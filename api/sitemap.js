// api/sitemap.js — Themis Jur
// Gera o sitemap.xml dinamicamente a partir das entradas marcadas como públicas.
// Rota pública, sem autenticação: usa a mesma leitura que a RLS já libera
// para `anon` (entradas_select_publicas: publica = true).
//
// NOTA: legislacao ainda não tem deep-link no frontend (Legislacao.jsx não lê
// parâmetro de URL), então não entra no sitemap por enquanto. Quando existir
// uma rota tipo ?lei=<id>&artigo=<n>, dá pra somar aqui.

import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://themisjur.com.br'

function escapeXml(str) {
  return String(str || '').replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]))
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed')

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY
  )

  const { data: entradas, error } = await supabase
    .from('entradas')
    .select('id, atualizado_em')
    .eq('publica', true)
    .order('atualizado_em', { ascending: false })

  if (error) {
    // Falha ao consultar o banco: devolve só a home em vez de quebrar o sitemap inteiro.
    console.error('sitemap: erro ao buscar entradas públicas:', error.message)
  }

  const urls = [
    { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    ...(entradas || []).map((e) => ({
      loc: `${BASE_URL}/?entrada=${e.id}`,
      lastmod: e.atualizado_em ? new Date(e.atualizado_em).toISOString().slice(0, 10) : undefined,
      changefreq: 'weekly',
      priority: '0.7',
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
