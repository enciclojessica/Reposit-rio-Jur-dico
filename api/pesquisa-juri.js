// Pesquisa de jurisprudência — Anthropic com web_search
// (Gemini googleSearch só funciona via Vertex AI, não via AI Studio)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { query, tribunal } = req.body
  if (!query) return res.status(400).json({ error: 'Query obrigatória.' })

  const tribunalFiltro = tribunal && tribunal !== 'todos'
    ? `Busque especificamente no ${tribunal}.`
    : 'Priorize STJ e STF, mas inclua outros tribunais relevantes se necessário.'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `Você é um pesquisador jurídico especializado em jurisprudência brasileira.
Pesquise decisões reais nos portais oficiais dos tribunais (STJ, STF, TJs, TRFs).

REGRAS ABSOLUTAS:
1. Retorne APENAS um array JSON válido, sem markdown.
2. Cada item: { "tribunal": "", "tipo": "", "numero": "", "relator": "", "data": "", "ementa": "", "url": "", "area": "" }
3. Todos os dados devem ser REAIS. Nunca invente processos, relatores ou ementas.
4. "area" deve ser: "Cível", "Penal" ou "Doutrina".
5. Retorne entre 5 e 8 resultados. Se não encontrar suficientes, retorne menos.`,
        messages: [{
          role: 'user',
          content: `Pesquise jurisprudência sobre: "${query}". ${tribunalFiltro}
Acesse: https://scon.stj.jus.br/SCON/ e https://jurisprudencia.stf.jus.br/pages/search
Retorne SOMENTE o array JSON.`
        }],
      }),
    })

    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = (json.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('').trim()

    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return res.status(200).json({ resultados: [], aviso: 'Nenhum resultado encontrado.' })

    return res.status(200).json({ resultados: JSON.parse(match[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
