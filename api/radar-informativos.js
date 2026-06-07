// api/radar-informativos.js
// Versão 2 — Jessica / Lex.IA — 07/06/2026
// Schema real: tabela radar_informativos (tribunal, ultimo_numero, atualizado_em)

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // ── 1. Verificar ANTHROPIC_API_KEY ─────────────────────────────────────────
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY?.trim()) {
    console.error('[radar] ANTHROPIC_API_KEY ausente')
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no Vercel.' })
  }

  // ── 2. Verificar SUPABASE_SERVICE_KEY ──────────────────────────────────────
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
  if (!SERVICE_KEY?.trim()) {
    console.error('[radar] SUPABASE_SERVICE_KEY ausente')
    return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY não configurada no Vercel.' })
  }

  // Cliente com service_role — bypassa RLS
  const supabase = createClient(process.env.SUPABASE_URL, SERVICE_KEY)

  // ── 3. Autenticação admin ───────────────────────────────────────────────────
  const userId = req.body?.user_id
  if (!userId) {
    return res.status(400).json({ error: 'user_id obrigatório no body' })
  }

  console.log('[radar] Verificando user_id:', userId)

  const { data: membro, error: membroError } = await supabase
    .from('membros')
    .select('role, user_id')
    .eq('user_id', userId)
    .single()

  if (membroError) {
    console.error('[radar] Erro ao buscar membro:', membroError.message, '| code:', membroError.code)
    return res.status(401).json({
      error: 'Usuário não encontrado',
      detalhe: membroError.message,
      dica: 'Verifique se SUPABASE_SERVICE_KEY no Vercel é a chave service_role (não a anon key)'
    })
  }

  if (membro.role !== 'admin') {
    return res.status(403).json({ error: 'Apenas admins podem executar o radar' })
  }

  console.log('[radar] Admin confirmado. Iniciando busca de informativos...')

  // ── 4. Buscar último número processado por tribunal ─────────────────────────
  const { data: statusAtual } = await supabase
    .from('radar_informativos')
    .select('tribunal, ultimo_numero')

  const ultimoSTJ = statusAtual?.find(r => r.tribunal === 'STJ')?.ultimo_numero || 0
  const ultimoSTF = statusAtual?.find(r => r.tribunal === 'STF')?.ultimo_numero || 0

  console.log('[radar] Últimos processados — STJ:', ultimoSTJ, '| STF:', ultimoSTF)

  // ── 5. Chamar Anthropic (STJ + STF em uma única requisição) ─────────────────
  const prompt = `Você é um assistente jurídico especializado em jurisprudência brasileira.

Pesquise os informativos mais recentes do STJ e do STF publicados APÓS os seguintes números:
- STJ: após o informativo nº ${ultimoSTJ}
- STF: após o informativo nº ${ultimoSTF}

Para cada tribunal, encontre até 3 informativos novos. Para cada informativo, extraia:
- numero (número do informativo)
- data_publicacao
- teses: array de até 3 teses/decisões relevantes, cada uma com:
  - ementa (resumo de 2-3 frases)
  - area_direito (ex: "Direito Civil", "Direito Penal", etc.)
  - tipo_decisao (ex: "Recurso Especial", "Recurso Extraordinário", etc.)

Responda SOMENTE com JSON válido, sem texto antes ou depois, no formato:
{
  "STJ": [
    {
      "numero": 830,
      "data_publicacao": "2026-06-01",
      "teses": [
        {
          "ementa": "...",
          "area_direito": "Direito Civil",
          "tipo_decisao": "Recurso Especial"
        }
      ]
    }
  ],
  "STF": []
}

Se não houver informativos novos para um tribunal, retorne array vazio para aquele tribunal.`

  let claudeData
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    })

    // Verificar status ANTES de chamar .json()
    if (!claudeRes.ok) {
      const rawBody = await claudeRes.text()
      console.error('[radar] Anthropic retornou status', claudeRes.status, ':', rawBody.slice(0, 400))
      return res.status(500).json({
        error: `API Anthropic retornou HTTP ${claudeRes.status}`,
        detalhe: rawBody.slice(0, 200)
      })
    }

    claudeData = await claudeRes.json()
    console.log('[radar] Anthropic respondeu. stop_reason:', claudeData.stop_reason)
  } catch (fetchErr) {
    console.error('[radar] Erro de rede Anthropic:', fetchErr.message)
    return res.status(500).json({ error: 'Erro de rede ao chamar Anthropic', detalhe: fetchErr.message })
  }

  // ── 6. Extrair JSON da resposta ─────────────────────────────────────────────
  const textBlock = claudeData.content?.find(b => b.type === 'text')
  if (!textBlock?.text) {
    console.error('[radar] Sem bloco de texto na resposta:', JSON.stringify(claudeData.content).slice(0, 300))
    return res.status(500).json({ error: 'Resposta da Anthropic sem texto' })
  }

  let informativos
  try {
    const clean = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    informativos = JSON.parse(clean)
  } catch (parseErr) {
    console.error('[radar] JSON inválido na resposta:', textBlock.text.slice(0, 300))
    return res.status(500).json({
      error: 'Modelo não retornou JSON válido',
      resposta_bruta: textBlock.text.slice(0, 300)
    })
  }

  // ── 7. Persistir no Supabase e contar resultados ────────────────────────────
  const resultados = []
  const erros = []

  for (const tribunal of ['STJ', 'STF']) {
    const lista = informativos[tribunal] || []
    const novos = lista.filter(i => i.numero > (tribunal === 'STJ' ? ultimoSTJ : ultimoSTF))

    if (novos.length === 0) {
      resultados.push({ tribunal, novos: [], mensagem: 'Sem novos informativos' })
      continue
    }

    // Atualizar radar_informativos com o maior número processado
    const maiorNumero = Math.max(...novos.map(i => i.numero))
    const { error: upsertError } = await supabase
      .from('radar_informativos')
      .upsert(
        { tribunal, ultimo_numero: maiorNumero, atualizado_em: new Date().toISOString() },
        { onConflict: 'tribunal' }
      )

    if (upsertError) {
      console.error('[radar] Erro ao atualizar radar_informativos:', upsertError.message)
      erros.push({ tribunal, erro: upsertError.message })
    }

    resultados.push({
      tribunal,
      novos: novos.map(i => ({ numero: i.numero, teses: i.teses?.length || 0 }))
    })
  }

  console.log('[radar] Concluído. Resultados:', JSON.stringify(resultados))

  return res.status(200).json({
    success: true,
    processados: resultados,
    erros: erros.length > 0 ? erros : undefined
  })
}
