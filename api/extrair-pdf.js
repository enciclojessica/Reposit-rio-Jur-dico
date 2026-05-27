// OCR de PDF — Anthropic (leitura nativa e fiel de documentos jurídicos)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { pdf_base64, filename } = req.body
  if (!pdf_base64) return res.status(400).json({ error: 'PDF não recebido.' })

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
        max_tokens: 2000,
        system: `Você é um extrator de dados jurídicos. Leia o acórdão/decisão e retorne APENAS um objeto JSON válido, sem markdown, sem texto antes ou depois.

Campos obrigatórios (deixe string vazia se não encontrar):
{
  "tribunal": "ex: STJ, TJSP, STF",
  "tipo_item": "ex: Acórdão, Decisão Monocrática, Súmula",
  "numero": "ex: REsp 1.234.567/SP, ADI 1234",
  "relator": "nome do ministro/desembargador relator",
  "data": "no formato YYYY-MM-DD",
  "ementa": "texto completo da ementa",
  "area": "um de: Cível, Penal, Doutrina",
  "teses": ["array de strings com as teses identificadas no julgado"],
  "fundamentacao_legal": "artigos e leis citados como fundamento principal",
  "url": "URL oficial se mencionada no documento, senão string vazia"
}

Extraia as informações com fidelidade absoluta ao documento. Não infira nem complemente dados ausentes.`,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf_base64 } },
            { type: 'text', text: `Extraia os dados jurídicos deste documento${filename ? ` (${filename})` : ''} e retorne o JSON conforme instruído.` },
          ],
        }],
      }),
    })
    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = (json.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim()
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.status(422).json({ error: 'Não foi possível extrair dados estruturados do PDF.' })

    return res.status(200).json({ dados: JSON.parse(match[0]) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
