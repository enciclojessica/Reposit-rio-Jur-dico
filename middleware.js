export const config = { matcher: '/' }

const SUPABASE_URL = 'https://wedfgqigtyrsrmmxsmuo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZGZncWlndHlyc3JtbXhzbXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDcxNzEsImV4cCI6MjA5NTI4MzE3MX0.yojX35SIMb6X0QRWMhInbeE0GUy57uWqGF101LWVlGg'
const SITE_URL = 'https://themisjur.com.br'
const IMG_PADRAO = `${SITE_URL}/logo-temis.png`

// Bots de prévia de link (WhatsApp, redes sociais) não executam JS — se
// não gerarmos o <meta og:*> certo no HTML de resposta, toda entrada e
// todo artigo compartilhado mostra sempre a mesma prévia genérica do
// site, sem título nem descrição específicos.
const REGEX_BOT = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|redditbot|skypeuripreview/i

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function paginaOg({ titulo, descricao, url, imagem }) {
  const t = escapeHtml(titulo)
  const d = escapeHtml(descricao).slice(0, 300)
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${t}</title>
<meta property="og:type" content="article">
<meta property="og:site_name" content="Themis Jur">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${imagem || IMG_PADRAO}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${imagem || IMG_PADRAO}">
<meta http-equiv="refresh" content="0; url=${escapeHtml(url)}">
</head><body>Redirecionando para <a href="${escapeHtml(url)}">${t}</a>…</body></html>`
}

async function buscarEntrada(id) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/entradas?id=eq.${encodeURIComponent(id)}&publica=eq.true&select=tema,zotero,area,tipo`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  )
  if (!r.ok) return null
  const rows = await r.json()
  return rows?.[0] || null
}

async function buscarArtigo(codigo, numero) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/legislacao?codigo=eq.${encodeURIComponent(codigo)}&numero=eq.${encodeURIComponent(numero)}&vigente=eq.true&select=titulo,texto&limit=1`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  )
  if (!r.ok) return null
  const rows = await r.json()
  return rows?.[0] || null
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || ''
  if (!REGEX_BOT.test(userAgent)) return // visitante normal: segue pro app de sempre

  const url = new URL(request.url)
  const entradaId = url.searchParams.get('entrada')
  const codigo = url.searchParams.get('lei')
  const numero = url.searchParams.get('art')

  try {
    if (entradaId) {
      const entrada = await buscarEntrada(entradaId)
      if (entrada) {
        return new Response(paginaOg({
          titulo: entrada.tema,
          descricao: entrada.zotero?.titulo_ementa || `${entrada.area}, ${entrada.tipo}, Themis Jur`,
          url: url.toString(),
        }), { headers: { 'content-type': 'text/html; charset=utf-8' } })
      }
    } else if (codigo && numero) {
      const artigo = await buscarArtigo(codigo, numero)
      if (artigo) {
        return new Response(paginaOg({
          titulo: `${codigo.toUpperCase()}, ${artigo.titulo || `Art. ${numero}`}`,
          descricao: artigo.texto,
          url: url.toString(),
        }), { headers: { 'content-type': 'text/html; charset=utf-8' } })
      }
    }
  } catch {
    // Qualquer erro na busca: segue pro app normal em vez de quebrar a
    // prévia do link (silenciosamente cai pro og:* padrão do index.html).
  }
  // Sem dado específico encontrado (ou sem parâmetro): segue pro app,
  // que usa os og:* padrão do index.html.
}
