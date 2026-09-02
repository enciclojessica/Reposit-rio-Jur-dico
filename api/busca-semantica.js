// Busca semântica — Anthropic (precisão na comparação de conceitos jurídicos)
import { createClient } from '@supabase/supabase-js'
import { ANTHROPIC_MODEL } from '../lib/anthropicModel.js'
import { checarRateLimit } from '../lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Autenticar via JWT do Supabase enviado no header ──────────────────
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })

  const { permitido } = await checarRateLimit(supabase, user.id, 'busca-semantica', { limite: 30, janelaMs: 5 * 60_000 })
  if (!permitido) return res.status(429).json({ error: 'Muitas requisições. Aguarde alguns minutos e tente novamente.' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { query, entradas } = req.body
  if (!query?.trim() || !entradas?.length)
    return res.status(400).json({ error: 'query e entradas são obrigatórios.' })

  const indice = entradas.map(e => ({
    id: e.id, area: e.area, tipo: e.tipo, tema: e.tema,
    fonte: e.fonte, referencia: e.referencia, tags: e.tags || [],
    teses: (Array.isArray(e.teses) ? e.teses : []).map(t => t.tese_assunto).filter(Boolean),
  }))

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 800,
        system: `Você é um sistema de busca semântica jurídica.
Dado um repositório de teses e uma consulta em linguagem natural, identifique as entradas mais relevantes semanticamente — mesmo que não compartilhem as mesmas palavras exatas.
Considere sinônimos, institutos jurídicos relacionados, fundamentos legais equivalentes e aplicações práticas similares.
Retorne APENAS um array JSON válido, sem markdown, com no máximo 10 resultados ordenados do mais para o menos relevante:
[{ "id": "id_da_entrada", "relevancia": 95, "motivo": "frase curta explicando a relação" }, ...]
Inclua apenas entradas com relevância acima de 40. Se nenhuma for relevante, retorne [].`,
        messages: [{
          role: 'user',
          content: `Consulta: "${query}"\n\nRepositório:\n${JSON.stringify(indice, null, 2)}`,
        }],
      }),
    })
    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = (json.content || []).find(b => b.type === 'text')?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    return res.status(200).json({ resultados: match ? JSON.parse(match[0]) : [] })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
