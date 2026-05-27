export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' })

  const { model, max_tokens, system, messages } = req.body

  // Converter formato Anthropic → Gemini
  const contents = []
  if (system) {
    contents.push({ role: 'user', parts: [{ text: `[CONTEXTO DO SISTEMA]: ${system}` }] })
    contents.push({ role: 'model', parts: [{ text: 'Entendido. Seguirei essas instruções.' }] })
  }
  for (const m of (messages || [])) {
    const role = m.role === 'assistant' ? 'model' : 'user'
    const text = typeof m.content === 'string' ? m.content : m.content?.map(c => c.text || '').join('')
    contents.push({ role, parts: [{ text }] })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { maxOutputTokens: max_tokens || 1000, temperature: 0.3 },
        }),
      }
    )
    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    // Converter resposta Gemini → formato Anthropic esperado pelo frontend
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return res.status(200).json({ content: [{ type: 'text', text }] })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
