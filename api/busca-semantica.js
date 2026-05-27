export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' })

  const { query, entradas } = req.body
  if (!query?.trim() || !entradas?.length)
    return res.status(400).json({ error: 'query e entradas são obrigatórios.' })

  const indice = entradas.map(e => ({
    id: e.id, area: e.area, tipo: e.tipo, tema: e.tema,
    fonte: e.fonte, referencia: e.referencia, tags: e.tags || [],
    teses: (e.teses || []).map(t => t.tese_assunto).filter(Boolean),
  }))

  const prompt = `Você é um sistema de busca semântica jurídica.
Dado um repositório de teses e uma consulta em linguagem natural, identifique as entradas mais relevantes semanticamente — mesmo que não compartilhem as mesmas palavras exatas.
Considere sinônimos, institutos jurídicos relacionados, fundamentos legais equivalentes e aplicações práticas similares.
Retorne APENAS um array JSON válido, sem markdown, com no máximo 10 resultados ordenados do mais para o menos relevante:
[{ "id": "id_da_entrada", "relevancia": 95, "motivo": "frase curta explicando a relação" }, ...]
Inclua apenas entradas com relevância acima de 40. Se nenhuma for relevante, retorne [].

Consulta: "${query}"

Repositório:
${JSON.stringify(indice, null, 2)}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.2 },
        }),
      }
    )
    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const match = text.match(/\[[\s\S]*\]/)
    const resultados = match ? JSON.parse(match[0]) : []
    return res.status(200).json({ resultados })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
