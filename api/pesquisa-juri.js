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
        max_tokens: 800,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `Pesquisador jurídico brasileiro. Retorne APENAS array JSON, sem markdown:
[{"tribunal":"","tipo":"","numero":"","relator":"","data":"","ementa":"","url":"","area":""}]
Area: Cível, Penal ou Doutrina. Máx 5 resultados REAIS. Nunca invente dados.`,
        messages: [{
          role: 'user',
          content: `Jurisprudência: "${query}". ${tribunalFiltro} Portais: scon.stj.jus.br e jurisprudencia.stf.jus.br`
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
