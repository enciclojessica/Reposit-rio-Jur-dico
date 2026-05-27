export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' })

  const { tribunal = 'STF', edicao } = req.query

  const query = edicao
    ? `informativo ${tribunal} número ${edicao} 2026 decisões teses jurisprudência`
    : `informativo ${tribunal} mais recente 2026 decisões jurisprudência`

  const prompt = `${query}

Pesquise o último informativo do ${tribunal} e retorne APENAS este JSON, sem markdown:
{"tribunal":"${tribunal}","edicao":"","data":"YYYY-MM-DD","url_fonte":"","decisoes":[{"titulo":"","orgao":"","relator":"","numero":"","area":"Cível|Penal|Doutrina","tese":"","fundamentacao":"","url":""}]}
Máx 6 decisões. Só dados reais.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.2 },
        }),
      }
    )
    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = (json.candidates?.[0]?.content?.parts || [])
      .filter(p => p.text).map(p => p.text).join('').trim()

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.status(422).json({ error: 'Não foi possível extrair dados do informativo.' })

    return res.status(200).json(JSON.parse(match[0]))
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
