// Pesquisa de jurisprudência — Datajud (CNJ) gratuito + Anthropic só para formatar
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { query, tribunal } = req.body
  if (!query) return res.status(400).json({ error: 'Query obrigatória.' })

  // Mapa de tribunais para siglas do Datajud
  const TRIBUNAIS_MAP = {
    'STJ':  'STJ',
    'STF':  'STF',
    'TST':  'TST',
    'TJSP': 'TJSP',
    'TJRJ': 'TJRJ',
    'TRFs': 'TRF1',
  }

  try {
    // ── Buscar no Datajud (CNJ) ──────────────────────────────────────────
    const siglaTribunal = TRIBUNAIS_MAP[tribunal] || null
    const urlBase = siglaTribunal
      ? `https://api-publica.datajud.cnj.jus.br/api_publica_${siglaTribunal.toLowerCase()}/_search`
      : 'https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search'

    const payload = {
      size: 8,
      query: {
        multi_match: {
          query,
          fields: ['ementa', 'decisao', 'txtEmenta', 'txtDecisao'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      },
      _source: ['tribunal', 'classe', 'numeroProcesso', 'relator', 'dataJulgamento', 'ementa', 'link'],
      sort: [{ dataJulgamento: { order: 'desc' } }],
    }

    const datajudRes = await fetch(urlBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'ApiKey cDZHYzlZa0JadVREZDJCendFbGFuZnVzZXY6SkJlTzNjLV9TRENyQk1RdnFKZGRqZw==',
      },
      body: JSON.stringify(payload),
    })

    if (!datajudRes.ok) throw new Error(`Datajud HTTP ${datajudRes.status}`)

    const datajudJson = await datajudRes.json()
    const hits = datajudJson?.hits?.hits || []

    if (!hits.length) {
      return res.status(200).json({ resultados: [], aviso: 'Nenhum resultado encontrado no Datajud.' })
    }

    // Formatar resultados
    const resultados = hits.map(h => {
      const s = h._source || {}
      const area = detectarArea(s.ementa || s.txtEmenta || '')
      return {
        tribunal:  s.tribunal || siglaTribunal || 'CNJ',
        tipo:      s.classe?.descricao || s.classe || '',
        numero:    s.numeroProcesso || '',
        relator:   s.relator?.nome || s.relator || '',
        data:      s.dataJulgamento ? s.dataJulgamento.slice(0, 10) : '',
        ementa:    (s.ementa || s.txtEmenta || '').slice(0, 400),
        url:       s.link || `https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(s.numeroProcesso || query)}`,
        area,
      }
    })

    return res.status(200).json({ resultados })

  } catch (err) {
    // Fallback: se Datajud falhar, tentar busca simples via Anthropic
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Datajud indisponível e ANTHROPIC_API_KEY não configurada.' })

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5', max_tokens: 800,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system: 'Retorne APENAS array JSON de jurisprudência real: [{"tribunal":"","tipo":"","numero":"","relator":"","data":"","ementa":"","url":"","area":""}]. Area: Cível, Penal ou Doutrina. Máx 5 itens reais.',
          messages: [{ role: 'user', content: `Jurisprudência sobre: "${query}". Tribunal: ${tribunal || 'todos'}` }],
        }),
      })
      const j = await r.json()
      if (j.error) return res.status(500).json({ error: j.error.message })
      const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      const match = text.match(/\[[\s\S]*\]/)
      return res.status(200).json({ resultados: match ? JSON.parse(match[0]) : [], fonte: 'fallback' })
    } catch (e2) {
      return res.status(500).json({ error: err.message })
    }
  }
}

function detectarArea(ementa) {
  const e = ementa.toLowerCase()
  if (/crime|penal|homicídio|furto|roubo|tráfico|réu|condenado|pena|prisão|reclusão/i.test(e)) return 'Penal'
  if (/doutrina|autor|obra|livro|artigo doutrinário/i.test(e)) return 'Doutrina'
  return 'Cível'
}
