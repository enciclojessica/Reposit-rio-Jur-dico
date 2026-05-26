export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { query, entradas } = req.body
  if (!query?.trim() || !entradas?.length)
    return res.status(400).json({ error: 'query e entradas são obrigatórios.' })

  // Índice simplificado para reduzir tokens
  const indice = entradas.map(e => ({
    id: e.id,
    area: e.area,
    tipo: e.tipo,
    tema: e.tema,
    fonte: e.fonte,
    referencia: e.referencia,
    tags: e.tags || [],
    teses: (e.teses || []).map(t => t.tese_assunto).filter(Boolean),
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
        model: 'claude-sonnet-4-5',
        max_tokens: 800,
        system: `Você é um sistema de busca semântica jurídica. 
Dado um repositório de teses e uma consulta em linguagem natural, identifique as entradas mais relevantes semanticamente — mesmo que não compartilhem as mesmas palavras exatas.

Considere sinônimos, institutos jurídicos relacionados, fundamentos legais equivalentes e aplicações práticas similares.

Retorne APENAS um array JSON válido, sem markdown, com no máximo 10 resultados ordenados do mais para o menos relevante:
[
  { "id": "id_da_entrada", "relevancia": 95, "motivo": "frase curta explicando a relação" },
  ...
]

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
    const resultados = match ? JSON.parse(match[0]) : []

    return res.status(200).json({ resultados })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
