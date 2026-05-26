export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { tribunal = 'STF', edicao } = req.query

  const query = edicao
    ? `informativo ${tribunal} número ${edicao} jurisprudência decisões 2026`
    : `último informativo ${tribunal} jurisprudência decisões recentes 2026 site:stf.jus.br OR site:stj.jus.br`

  try {
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
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `Você é um extrator de dados jurídicos. Pesquise o último informativo do ${tribunal} e extraia as decisões.
Retorne APENAS um objeto JSON válido, sem markdown, sem texto antes ou depois:
{
  "tribunal": "${tribunal}",
  "edicao": "número da edição",
  "data": "data no formato YYYY-MM-DD",
  "url_fonte": "URL da página oficial do informativo",
  "decisoes": [
    {
      "titulo": "tema resumido em até 80 caracteres",
      "orgao": "Plenário / Primeira Turma / Segunda Turma etc",
      "relator": "nome do relator",
      "numero": "número do processo",
      "area": "Cível ou Penal ou Informativo",
      "tese": "enunciado da tese fixada",
      "fundamentacao": "artigos ou dispositivos citados",
      "url": "URL direta para o processo se disponível, senão string vazia"
    }
  ]
}
Extraia até 10 decisões. Apenas dados reais encontrados na busca.`,
        messages: [{
          role: 'user',
          content: query,
        }],
      }),
    })

    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    const text = (json.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.status(422).json({ error: 'Não foi possível extrair dados do informativo.' })

    const dados = JSON.parse(match[0])
    return res.status(200).json(dados)

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
