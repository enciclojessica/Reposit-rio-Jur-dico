export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' })

  const { pdf_base64, filename } = req.body
  if (!pdf_base64) return res.status(400).json({ error: 'PDF não recebido.' })

  const prompt = `Você é um extrator de dados jurídicos. Leia o acórdão/decisão e retorne APENAS um objeto JSON válido, sem markdown, sem texto antes ou depois.

Campos obrigatórios (deixe string vazia se não encontrar):
{
  "tribunal": "ex: STJ, TJSP, STF",
  "tipo_item": "ex: Acórdão, Decisão Monocrática, Súmula",
  "numero": "ex: REsp 1.234.567/SP",
  "relator": "nome do ministro/desembargador relator",
  "data": "no formato YYYY-MM-DD",
  "ementa": "texto completo da ementa",
  "area": "um de: Cível, Penal, Doutrina",
  "teses": ["array de strings com as teses identificadas"],
  "fundamentacao_legal": "artigos e leis citados como fundamento principal",
  "url": "URL oficial se mencionada, senão string vazia"
}

Extraia as informações com fidelidade absoluta ao documento. Não infira nem complemente dados ausentes.
Documento: ${filename || 'acórdão'}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { inline_data: { mime_type: 'application/pdf', data: pdf_base64 } },
              { text: prompt },
            ],
          }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.1 },
        }),
      }
    )
    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.status(422).json({ error: 'Não foi possível extrair dados estruturados do PDF.' })

    return res.status(200).json({ dados: JSON.parse(match[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
