import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // ── Sitemap dinâmico (rota /sitemap.xml via rewrite no vercel.json) ─────
  // Vive aqui, e não em api/sitemap.js, porque o plano Hobby da Vercel
  // limita a 12 Serverless Functions por deployment e o projeto já usa
  // as 12 (ver vercel.json). Sem relação temática com legislação; é só
  // o slot disponível.
  if (req.query.sitemap) {
    const BASE_URL = 'https://themisjur.com.br'
    const escapeXml = (str) => String(str || '').replace(/[<>&'"]/g, (c) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
    }[c]))

    const { data: entradas, error: erroEntradas } = await supabase
      .from('entradas')
      .select('id, atualizado_em')
      .eq('publica', true)
      .order('atualizado_em', { ascending: false })

    if (erroEntradas) console.error('sitemap: erro ao buscar entradas públicas:', erroEntradas.message)

    const { data: artigos, error: erroArtigos } = await supabase
      .from('legislacao')
      .select('codigo, numero')
      .eq('vigente', true)

    if (erroArtigos) console.error('sitemap: erro ao buscar artigos de legislação:', erroArtigos.message)

    // legislacao tem várias linhas por artigo (caput + incisos + parágrafos);
    // o sitemap só quer uma URL por artigo, não por linha.
    const artigosUnicos = [...new Map(
      (artigos || []).map((a) => [`${a.codigo}|${a.numero}`, a])
    ).values()]

    const urls = [
      { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
      ...(entradas || []).map((e) => ({
        loc: `${BASE_URL}/?entrada=${e.id}`,
        lastmod: e.atualizado_em ? new Date(e.atualizado_em).toISOString().slice(0, 10) : undefined,
        changefreq: 'weekly',
        priority: '0.7',
      })),
      ...artigosUnicos.map((a) => ({
        loc: `${BASE_URL}/?lei=${a.codigo}&art=${a.numero}`,
        changefreq: 'monthly',
        priority: '0.5',
      })),
    ]

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).send(body)
  }

  const { codigo, numero, q } = req.query

  // Busca por comando: /cpc 300
  if (codigo && numero) {
    const { data, error } = await supabase
      .from('legislacao')
      .select('*')
      .eq('codigo', codigo.toLowerCase())
      .eq('numero', parseInt(numero))
      .eq('vigente', true)
      .order('inciso', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ artigos: data || [] })
  }

  // Busca textual: /leg responsabilidade civil
  if (q) {
    const { data, error } = await supabase
      .from('legislacao')
      .select('*')
      .textSearch('texto', q, { type: 'websearch', config: 'portuguese' })
      .eq('vigente', true)
      .limit(8)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ artigos: data || [] })
  }

  // Listar códigos disponíveis
  const { data, error } = await supabase
    .from('legislacao')
    .select('codigo')
    .eq('vigente', true)

  if (error) return res.status(500).json({ error: error.message })

  const codigos = [...new Set((data || []).map(d => d.codigo))]
  const counts = {}
  for (const cod of codigos) {
    counts[cod] = (data || []).filter(d => d.codigo === cod).length
  }

  return res.status(200).json({ codigos: counts })
}
