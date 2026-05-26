export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { tribunal = 'STF', edicao } = req.query

  const query = edicao
    ? `informativo ${tribunal} ${edicao} 2026 decisões teses`
    : `informativo ${tribunal} mais recente 2026 decisões`

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
        system: `Pesquise o último informativo do ${tribunal} e retorne JSON:
{"tribunal":"${tribunal}","edicao":"","data":"YYYY-MM-DD","url_fonte":"","decisoes":[{"titulo":"","orgao":"","relator":"","numero":"","area":"Cível|Penal|Informativo","tese":"","fundamentacao":"","url":""}]}
Máx 6 decisões. Só dados reais. Sem markdown.`,
        messages: [{ role: 'user', content: query }],
      }),
    })

    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = (json.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('').trim()

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.status(422).json({ error: 'Não foi possível extrair dados do informativo.' })

    return res.status(200).json(JSON.parse(match[0]))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
