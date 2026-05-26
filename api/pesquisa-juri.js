export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { query, tribunal } = req.body
  if (!query) return res.status(400).json({ error: 'Query obrigatória.' })

  const tribunalFiltro = tribunal && tribunal !== 'todos'
    ? `Busque especificamente no ${tribunal}.`
    : 'Priorize STJ e STF, mas inclua outros tribunais relevantes se necessário.'

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
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: `Você é um pesquisador jurídico especializado em jurisprudência brasileira.
Sua tarefa é buscar decisões reais nos portais oficiais dos tribunais (STJ, STF, TJs, TRFs).

REGRAS ABSOLUTAS:
1. Retorne APENAS um array JSON válido, sem markdown, sem texto antes ou depois.
2. Cada item do array deve ter EXATAMENTE estes campos:
   { "tribunal": "", "tipo": "", "numero": "", "relator": "", "data": "", "ementa": "", "url": "", "area": "" }
3. Todos os dados devem ser REAIS e verificáveis. Nunca invente processos, relatores ou ementas.
4. O campo "url" deve ser o link direto para a decisão no portal oficial do tribunal.
5. O campo "area" deve ser um dos: "Cível", "Penal", "Informativo", "Doutrina".
6. Retorne entre 5 e 8 resultados relevantes.
7. Se não encontrar resultados reais suficientes, retorne um array com menos itens — jamais invente.`,
        messages: [{
          role: 'user',
          content: `Pesquise jurisprudência sobre: "${query}". ${tribunalFiltro}
Acesse os portais: https://scon.stj.jus.br/SCON/ e https://jurisprudencia.stf.jus.br/pages/search
Retorne SOMENTE o array JSON com os resultados encontrados.`
        }]
      })
    })

    const json = await response.json()
    if (json.error) return res.status(500).json({ error: json.error.message })

    // Extrair o texto da resposta (ignora blocos tool_use)
    const text = (json.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()

    // Extrair JSON do texto
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return res.status(200).json({ resultados: [], aviso: 'Nenhum resultado encontrado.' })

    const resultados = JSON.parse(match[0])
    return res.status(200).json({ resultados })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
