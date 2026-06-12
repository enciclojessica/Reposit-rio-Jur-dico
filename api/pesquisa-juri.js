// api/pesquisa-juri.js — Lex.IA
// Pesquisa jurisprudencial via Claude + web_search
// Retorna array de resultados com: tribunal, tipo, numero, relator, data, ementa, area, url

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { query, tribunal } = req.body || {}
  if (!query?.trim()) return res.status(400).json({ error: 'query obrigatória' })

  const tribunalFiltro = tribunal && tribunal !== 'todos'
    ? `Foque apenas no tribunal: ${tribunal}.`
    : 'Busque no STJ e STF prioritariamente. Se não encontrar, inclua TRFs e TST.'

  const prompt = `Você é um assistente jurídico especializado em jurisprudência brasileira.
Pesquise decisões reais sobre: "${query}"
${tribunalFiltro}

IMPORTANTE: Use a ferramenta de busca para encontrar decisões REAIS com dados verdadeiros.
Traga entre 3 e 6 resultados relevantes.

Responda SOMENTE com JSON válido, sem texto antes ou depois, no formato:
{
  "resultados": [
    {
      "tribunal": "STJ",
      "tipo": "REsp",
      "numero": "1.234.567/SP",
      "relator": "Min. Nome Sobrenome",
      "data": "2024-03-15",
      "ementa": "Resumo da tese/ementa em até 3 linhas...",
      "area": "Cível",
      "url": "https://..."
    }
  ],
  "aviso": "mensagem opcional se não houver resultados precisos"
}`

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const raw = await claudeRes.text()
      console.error('[pesquisa-juri] Anthropic HTTP', claudeRes.status, raw.slice(0, 300))
      return res.status(500).json({ error: `Falha na API: HTTP ${claudeRes.status}` })
    }

    const data = await claudeRes.json()
    const textBlock = data.content?.find(b => b.type === 'text')
    if (!textBlock?.text) {
      return res.status(500).json({ error: 'Resposta sem bloco de texto', resultados: [] })
    }

    let parsed
    try {
      const clean = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      console.error('[pesquisa-juri] JSON inválido:', textBlock.text.slice(0, 300))
      return res.status(200).json({
        resultados: [],
        aviso: 'Não foi possível estruturar os resultados. Tente uma busca mais específica.',
      })
    }

    return res.status(200).json({
      resultados: parsed.resultados || [],
      aviso: parsed.aviso || '',
    })
  } catch (err) {
    console.error('[pesquisa-juri] Erro:', err)
    return res.status(500).json({ error: err.message })
  }
}
