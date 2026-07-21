// api/pesquisa-juri.js — Themis Jur
// Pesquisa jurisprudencial via Claude + web_search
// Retorna array de resultados com: tribunal, tipo, numero, relator, data, ementa, area, url
import { createClient } from '@supabase/supabase-js'
import { ANTHROPIC_MODEL } from '../lib/anthropicModel.js'
import { checarRateLimit } from '../lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  // ── Autenticar: CRON_SECRET (radar automático) OU JWT de usuário ──────
  const authHeader = req.headers.authorization?.replace('Bearer ', '')
  const isCron = process.env.CRON_SECRET && authHeader === process.env.CRON_SECRET

  if (!isCron) {
    if (!authHeader) return res.status(401).json({ error: 'Não autenticado.' })
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader)
    if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })

    const { permitido } = await checarRateLimit(supabase, user.id, 'pesquisa-juri', { limite: 15, janelaMs: 60_000 })
    if (!permitido) return res.status(429).json({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' })
  }

  const { query, tribunal } = req.body || {}
  if (!query?.trim()) return res.status(400).json({ error: 'query obrigatória' })

  const tribunais = Array.isArray(tribunal) ? tribunal : (tribunal ? [tribunal] : [])
  const tribunalFiltro = tribunais.length && !tribunais.includes('todos')
    ? `Foque apenas n${tribunais.length > 1 ? 'os tribunais' : 'o tribunal'}: ${tribunais.join(', ')}.`
    : 'Busque no STJ e STF prioritariamente. Se não encontrar, inclua TRFs e TST.'

  const prompt = `Você é um assistente jurídico especializado em jurisprudência brasileira.
Pesquise decisões reais sobre: "${query}"
${tribunalFiltro}

IMPORTANTE: Use a ferramenta de busca para encontrar decisões REAIS com dados verdadeiros.
Traga entre 3 e 6 resultados relevantes.

Para cada decisão, classifique "tendencia" como:
- "favoravel": reconhece o direito, protege parte vulnerável, aplica CDC/CLT/princípios protetivos
- "contrario": nega o direito, restringe a pretensão, exige requisitos adicionais
- "neutro": interpreta norma sem favorecer parte, ou depende do caso concreto

Responda SOMENTE com JSON válido, sem texto antes ou depois, no formato:
{
  "resultados": [
    {
      "tribunal": "STJ",
      "tipo": "REsp",
      "numero": "1.234.567/SP",
      "relator": "Min. Nome Sobrenome",
      "data": "2024-03-15",
      "ementa": "Resumo da tese/ementa em até 3 linhas...",
      "area": "Cível",
      "tendencia": "favoravel",
      "fundamentacao": "Art. X, Lei Y",
      "url": "https://..."
    }
  ],
  "aviso": "mensagem opcional se não houver resultados precisos"
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
        max_tokens: 3000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const raw = await claudeRes.text()
      console.error('[pesquisa-juri] Anthropic HTTP', claudeRes.status, raw.slice(0, 300))
      return res.status(500).json({ error: `Falha na API: HTTP ${claudeRes.status}` })
    }

    const data = await claudeRes.json()
    const textBlocks = data.content?.filter(b => b.type === 'text') || []
    const textBlock = textBlocks[textBlocks.length - 1]  // último bloco — após o web_search
    if (!textBlock?.text) {
      return res.status(500).json({ error: 'Resposta sem bloco de texto', resultados: [] })
    }

    let parsed
    try {
      let clean = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      // Remover qualquer texto explicativo antes/depois do JSON
      const inicioJson = clean.indexOf('{')
      const fimJson = clean.lastIndexOf('}')
      if (inicioJson >= 0 && fimJson > inicioJson) clean = clean.slice(inicioJson, fimJson + 1)
      parsed = JSON.parse(clean)
    } catch {
      console.error('[pesquisa-juri] JSON inválido:', textBlock.text.slice(0, 300))
      return res.status(200).json({
        resultados: [],
        aviso: 'Não foi possível estruturar os resultados. Tente uma busca mais específica.',
      })
    }

    return res.status(200).json({
      resultados: parsed.resultados || [],
      aviso: parsed.aviso || '',
    })
  } catch (err) {
    console.error('[pesquisa-juri] Erro:', err)
    return res.status(500).json({ error: err.message })
  }
}
