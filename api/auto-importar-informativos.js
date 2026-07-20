// api/auto-importar-informativos.js — Themis Jur
// Busca o informativo mais recente do tribunal e salva as decisões
// relevantes que ainda não estão no repositório como novas entradas

import { createClient } from '@supabase/supabase-js'
import { ANTHROPIC_MODEL } from '../lib/anthropicModel.js'
import { checarRateLimit } from '../lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

  // ── Autenticar: CRON_SECRET (chamada automatizada) OU JWT de usuário ──
  const authHeader = req.headers.authorization?.replace('Bearer ', '')
  const isCron = process.env.CRON_SECRET && authHeader === process.env.CRON_SECRET

  let userId
  if (isCron) {
    userId = req.body?.user_id
    if (!userId) return res.status(400).json({ error: 'user_id obrigatório em chamadas via CRON_SECRET.' })
  } else {
    if (!authHeader) return res.status(401).json({ error: 'Não autenticado.' })
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader)
    if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })
    userId = user.id
    const { permitido } = await checarRateLimit(supabase, userId, 'auto-importar-informativos', { limite: 10, janelaMs: 60_000 })
    if (!permitido) return res.status(429).json({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' })
  }

  const { tribunal = 'STF', entradas = [] } = req.body || {}

  // Verificar se é editor
  const { data: membro } = await supabase
    .from('membros')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (!membro || !['admin', 'editor'].includes(membro.role)) {
    return res.status(403).json({ error: 'Apenas editores podem usar esta função.' })
  }

  // Resumo das entradas existentes para evitar duplicatas
  const temasExistentes = entradas
    .slice(0, 50)
    .map(e => e.tema?.slice(0, 60))
    .filter(Boolean)
    .join('; ')

  const prompt = `Você é um assistente jurídico. Faça o seguinte em duas etapas:

ETAPA 1: Busque o informativo jurisprudencial mais recente do ${tribunal} nos portais oficiais.

ETAPA 2: Das decisões encontradas, selecione apenas as que NÃO estejam já cobertas por estes temas do repositório:
"${temasExistentes || 'repositório vazio'}"

Para cada decisão selecionada, estruture uma entrada do repositório.

Responda SOMENTE com JSON válido, sem nenhum texto antes ou depois, sem markdown, sem crases — a resposta inteira deve poder ser processada diretamente por JSON.parse():
{
  "edicao": "número do informativo",
  "tribunal": "${tribunal}",
  "total_analisadas": número,
  "entradas": [
    {
      "area": "Cível|Penal|Trabalhista|Tributário|Constitucional|Administrativo|Empresarial",
      "tipo": "jurisprudência",
      "tema": "Título conciso da tese (máx 80 chars)",
      "fonte": "${tribunal}",
      "referencia": "Informativo nº XXX — Processo nº",
      "url": "link oficial se disponível",
      "status": "vigente",
      "tags": ["informativo", "${tribunal.toLowerCase()}", "auto-importado"],
      "teses": [
        {
          "tese_assunto": "Tese jurídica resumida",
          "fundamentacao_legal": "Artigos e leis relevantes",
          "precedente_sumula": "Número do processo",
          "ratio_decidendi": "Fundamento determinante da decisão",
          "aplicacao_pratica": "Como usar na prática forense"
        }
      ]
    }
  ]
}`

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 5000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const raw = await claudeRes.text()
      return res.status(500).json({ error: `Falha na API: HTTP ${claudeRes.status}`, detalhe: raw.slice(0, 200) })
    }

    const data = await claudeRes.json()
    const textBlocks = data.content?.filter(b => b.type === 'text') || []
    const textBlock = textBlocks[textBlocks.length - 1]  // último bloco — após o web_search
    if (!textBlock?.text) return res.status(500).json({ error: 'Sem resposta da IA.' })

    let parsed
    try {
      let clean = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      // Remover qualquer texto explicativo antes/depois do JSON
      const inicioJson = clean.indexOf('{')
      const fimJson = clean.lastIndexOf('}')
      if (inicioJson >= 0 && fimJson > inicioJson) clean = clean.slice(inicioJson, fimJson + 1)
      parsed = JSON.parse(clean)
    } catch {
      return res.status(500).json({ error: 'IA não retornou JSON válido.' })
    }

    if (!parsed.entradas?.length) {
      return res.status(200).json({
        salvas: 0,
        total_analisadas: parsed.total_analisadas || 0,
        mensagem: 'Nenhuma decisão nova relevante encontrada neste informativo.',
      })
    }

    // Salvar no Supabase
    const payload = parsed.entradas.map(e => ({
      ...e,
      criado_por: userId,
      criado_em: new Date().toISOString(),
    }))

    const { data: salvas, error: insertErr } = await supabase
      .from('entradas')
      .insert(payload)
      .select('id')

    if (insertErr) {
      console.error('[auto-importar] Supabase insert error:', insertErr)
      return res.status(500).json({ error: 'Erro ao salvar no repositório: ' + insertErr.message })
    }

    return res.status(200).json({
      salvas: salvas?.length || 0,
      total_analisadas: parsed.total_analisadas || parsed.entradas.length,
      edicao: parsed.edicao,
      tribunal: parsed.tribunal,
    })
  } catch (err) {
    console.error('[auto-importar] Erro:', err)
    return res.status(500).json({ error: err.message })
  }
}
