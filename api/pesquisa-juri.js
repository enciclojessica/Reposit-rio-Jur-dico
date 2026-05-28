// Pesquisa de jurisprudência
// Estratégia: Datajud CNJ para busca por assunto/classe (metadados reais)
//             + Anthropic web_search para busca textual em ementas
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { query, tribunal } = req.body
  if (!query) return res.status(400).json({ error: 'Query obrigatória.' })

  const DATAJUD_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

  // ── 1. Datajud — busca por assunto (tabela TPU do CNJ) ──────────────────
  // Mapeia termos comuns para códigos de assunto TPU-CNJ
  const ASSUNTOS_MAP = {
    'dano moral': '10804',
    'responsabilidade civil': '10804',
    'indenização': '10804',
    'negativação indevida': '10804',
    'consumidor': '7771',
    'contrato': '10926',
    'alimentos': '1156',
    'divórcio': '1128',
    'guarda': '1143',
    'furto': '10899',
    'roubo': '10900',
    'homicídio': '10895',
    'tráfico': '10923',
    'habeas corpus': '7778',
    'mandado de segurança': '7780',
    'usucapião': '10909',
    'inventário': '10193',
    'locação': '10913',
    'acidente': '7759',
    'trabalhista': '10000',
    'rescisão': '10996',
    'horas extras': '10007',
  }

  const queryLower = query.toLowerCase()
  const codigoAssunto = Object.entries(ASSUNTOS_MAP)
    .find(([termo]) => queryLower.includes(termo))?.[1]

  const tribunais = tribunal && tribunal !== 'todos'
    ? [tribunal.toLowerCase()]
    : ['stj', 'stf', 'tjsp', 'tjrj', 'trf1']

  let resultadosDatajud = []

  if (codigoAssunto) {
    // Temos código TPU — buscar no Datajud com dados reais
    for (const trib of tribunais.slice(0, 2)) {
      try {
        const r = await fetch(
          `https://api-publica.datajud.cnj.jus.br/api_publica_${trib}/_search`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `APIKey ${DATAJUD_KEY}`,
            },
            body: JSON.stringify({
              size: 5,
              query: {
                bool: {
                  must: [{ match: { 'assunto.codigo': codigoAssunto } }],
                  filter: [{ term: { grau: 'G2' } }], // só 2ª instância / acordãos
                },
              },
              sort: [{ dataAjuizamento: { order: 'desc' } }],
              _source: ['tribunal','classe','numeroProcesso','orgaoJulgador','dataAjuizamento','assunto','grau'],
            }),
          }
        )
        if (r.ok) {
          const j = await r.json()
          const hits = j?.hits?.hits || []
          hits.forEach(h => {
            const s = h._source || {}
            resultadosDatajud.push({
              tribunal:  s.tribunal || trib.toUpperCase(),
              tipo:      s.classe?.nome || '',
              numero:    s.numeroProcesso || '',
              relator:   s.orgaoJulgador?.nome || '',
              data:      s.dataAjuizamento ? s.dataAjuizamento.slice(0,10) : '',
              ementa:    `${s.classe?.nome || ''} — Assunto: ${(s.assunto||[]).map(a=>a.nome).join(', ')}`,
              url:       `https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(s.numeroProcesso || query)}`,
              area:      detectarArea(queryLower),
              fonte:     'Datajud CNJ',
            })
          })
        }
      } catch {}
    }
  }

  // ── 2. Anthropic web_search — busca textual em ementas reais ───────────
  // Sempre executa para complementar com texto de ementa real
  if (ANTHROPIC_KEY) {
    try {
      const tribunalFiltro = tribunal && tribunal !== 'todos'
        ? `Busque no ${tribunal}.`
        : 'Busque no STJ e STF prioritariamente.'

      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 800,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system: 'Retorne APENAS array JSON com jurisprudência real encontrada na web: [{"tribunal":"","tipo":"","numero":"","relator":"","data":"YYYY-MM-DD","ementa":"","url":"","area":""}]. Area: Cível, Penal ou Doutrina. Máx 4 itens. Nunca invente dados.',
          messages: [{ role: 'user', content: `Jurisprudência: "${query}". ${tribunalFiltro} site:stj.jus.br OR site:stf.jus.br` }],
        }),
      })
      const j = await r.json()
      if (!j.error) {
        const text = (j.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('')
        const match = text.match(/\[[\s\S]*?\]/)
        if (match) {
          const webResults = JSON.parse(match[0])
          webResults.forEach(w => { w.fonte = 'Portal Oficial' })
          // Combinar: resultados web primeiro (têm ementa), Datajud depois (têm número)
          const numerosJaPresentes = new Set(webResults.map(w=>w.numero).filter(Boolean))
          const datajudFiltrado = resultadosDatajud.filter(d => !numerosJaPresentes.has(d.numero))
          return res.status(200).json({ resultados: [...webResults, ...datajudFiltrado] })
        }
      }
    } catch {}
  }

  // Se só tem Datajud ou nenhum resultado
  if (resultadosDatajud.length) {
    return res.status(200).json({ resultados: resultadosDatajud, aviso: 'Resultados do Datajud CNJ (metadados processuais). Para texto de ementa, busque no portal do tribunal.' })
  }

  return res.status(200).json({ resultados: [], aviso: 'Nenhum resultado encontrado.' })
}

function detectarArea(q) {
  if (/crime|penal|homicídio|furto|roubo|tráfico|réu|pena|prisão/i.test(q)) return 'Penal'
  if (/doutrina|autor|obra|livro/i.test(q)) return 'Doutrina'
  return 'Cível'
}
