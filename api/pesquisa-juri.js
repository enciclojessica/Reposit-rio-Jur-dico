export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' })

  const { query, tribunal } = req.body
  if (!query) return res.status(400).json({ error: 'Query obrigatória.' })

  const tribunalFiltro = tribunal && tribunal !== 'todos'
    ? `Busque especificamente no ${tribunal}.`
    : 'Priorize STJ e STF, mas inclua outros tribunais relevantes se necessário.'

  const prompt = `Você é um pesquisador jurídico especializado em jurisprudência brasileira.
Pesquise jurisprudência sobre: "${query}". ${tribunalFiltro}
Acesse os portais: https://scon.stj.jus.br/SCON/ e https://jurisprudencia.stf.jus.br/pages/search

REGRAS:
1. Retorne APENAS um array JSON válido, sem markdown.
2. Cada item: { "tribunal": "", "tipo": "", "numero": "", "relator": "", "data": "", "ementa": "", "url": "", "area": "" }
3. Todos os dados devem ser REAIS e verificáveis. Nunca invente.
4. "area" deve ser: "Cível", "Penal" ou "Doutrina".
5. Retorne entre 5 e 8 resultados. Se não encontrar reais suficientes, retorne menos itens.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return res.status(200).json({ resultados: [], aviso: 'Nenhum resultado encontrado.' })

    return res.status(200).json({ resultados: JSON.parse(match[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
