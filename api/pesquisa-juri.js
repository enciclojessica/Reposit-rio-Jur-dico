// Pesquisa de jurisprudência — Anthropic web_search nos portais oficiais
// Fonte única por resultado: sem cruzamento de dados entre APIs
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { query, tribunal } = req.body
  if (!query) return res.status(400).json({ error: 'Query obrigatória.' })

  const site = tribunal && tribunal !== 'todos'
    ? `site:${tribunal.toLowerCase()}.jus.br`
    : 'site:stj.jus.br OR site:stf.jus.br'

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
        max_tokens: 600,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'Retorne APENAS array JSON. Cada item deve ter todos os campos do mesmo processo: [{"tribunal":"","tipo":"","numero":"","relator":"","data":"YYYY-MM-DD","ementa":"","url":"","area":""}]. Area: Cível, Penal ou Doutrina. Máx 5 itens. Dados de fonte única por item.',
        messages: [{ role: 'user', content: `"${query}" jurisprudência ementa ${site}` }],
      }),
    })

    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = (json.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
    const match = text.match(/\[[\s\S]*?\]/)
    if (!match) return res.status(200).json({ resultados: [], aviso: 'Nenhum resultado encontrado.' })

    return res.status(200).json({ resultados: JSON.parse(match[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
