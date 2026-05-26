export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { tribunal = 'STF', edicao } = req.query

  // ── URLs dos informativos ─────────────────────────────────────────────
  let url
  if (tribunal === 'STF') {
    // Descobrir última edição se não passada
    if (edicao) {
      url = `https://www.stf.jus.br/arquivo/informativo/documento/informativo${edicao}.htm`
    } else {
      // Buscar número da última edição no portal
      try {
        const indexRes = await fetch('https://portal.stf.jus.br/textos/verTexto.asp?servico=informativoSTF', {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const html = await indexRes.text()
        const match = html.match(/informativo(\d{3,4})\.htm/i)
        const num   = match ? match[1] : '1217'
        url = `https://www.stf.jus.br/arquivo/informativo/documento/informativo${num}.htm`
      } catch {
        url = 'https://www.stf.jus.br/arquivo/informativo/documento/informativo1217.htm'
      }
    }
  } else {
    // STJ — página HTML do último informativo
    url = 'https://scon.stj.jus.br/jurisprudencia/externo/informativo/'
  }

  try {
    // Buscar HTML do informativo
    const pageRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`)
    const html = await pageRes.text()

    // Limpar HTML para enviar ao Claude (limitar a 8000 chars para caber no contexto)
    const texto = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{3,}/g, '\n')
      .trim()
      .slice(0, 8000)

    // Extrair decisões via Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: `Você é um extrator de dados jurídicos. Dado o texto de um informativo jurisprudencial (STF ou STJ), extraia as decisões mais relevantes e retorne APENAS um objeto JSON válido, sem markdown:

{
  "tribunal": "STF" ou "STJ",
  "edicao": "número da edição",
  "data": "data da publicação no formato YYYY-MM-DD",
  "decisoes": [
    {
      "titulo": "tema resumido em até 80 caracteres",
      "orgao": "Plenário / Primeira Turma / Segunda Turma / Primeira Seção etc",
      "relator": "nome do relator",
      "numero": "número do processo (ex: RE 123456, REsp 1.234.567)",
      "area": "Cível ou Penal ou Informativo",
      "tese": "enunciado da tese fixada ou conclusão principal",
      "fundamentacao": "artigos ou dispositivos legais citados como fundamento",
      "url": "URL direta para o processo no portal se mencionada, senão string vazia"
    }
  ]
}

Extraia até 10 decisões mais relevantes. Apenas dados que constam expressamente no texto.`,
        messages: [{
          role: 'user',
          content: `Tribunal: ${tribunal}\n\nTexto do informativo:\n${texto}`,
        }],
      }),
    })

    const json = await response.json()
    if (json.error) throw new Error(json.error.message)

    const text = (json.content || []).find(b => b.type === 'text')?.text || '{}'
    const match = text.match(/\{[\s\S]*\}/)
    const dados = match ? JSON.parse(match[0]) : { tribunal, decisoes: [] }

    return res.status(200).json({ ...dados, url_fonte: url })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
