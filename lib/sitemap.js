// Sitemap do Themis Jur. O acervo é de acesso fechado, então o sitemap lista só
// as páginas que o Google consegue abrir sem login e que mantêm a própria URL:
// a home e as páginas legais. URLs como /?entrada=ID e /?lei=X&art=N são
// reescritas para "/" pelo App (history.replaceState) e apareciam no Search
// Console como "Página com redirecionamento".
export const BASE_URL = 'https://themisjur.com.br'

export const URLS_SITEMAP = [
  { loc: `${BASE_URL}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${BASE_URL}/?pagina=termos`, changefreq: 'yearly', priority: '0.3' },
  { loc: `${BASE_URL}/?pagina=privacidade`, changefreq: 'yearly', priority: '0.3' },
]

const escapeXml = (str) => String(str || '').replace(/[<>&'"]/g, (c) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
}[c]))

export function gerarSitemapXml(urls = URLS_SITEMAP) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
}
