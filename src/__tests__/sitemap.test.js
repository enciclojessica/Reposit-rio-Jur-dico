import { describe, it, expect } from 'vitest'
import { gerarSitemapXml, URLS_SITEMAP, BASE_URL } from '../../lib/sitemap.js'

describe('sitemap', () => {
  it('lista só a home e as páginas legais', () => {
    expect(URLS_SITEMAP.map((u) => u.loc)).toEqual([
      `${BASE_URL}/`,
      `${BASE_URL}/?pagina=termos`,
      `${BASE_URL}/?pagina=privacidade`,
    ])
  })
  it('não expõe entradas nem artigos de legislação', () => {
    const xml = gerarSitemapXml()
    expect(xml).not.toMatch(/\?entrada=/)
    expect(xml).not.toMatch(/\?lei=/)
  })
  it('gera XML válido e escapa o "&"', () => {
    const xml = gerarSitemapXml([{ loc: 'https://x.com/?a=1&b=2', changefreq: 'weekly', priority: '0.5' }])
    expect(xml).toContain('<loc>https://x.com/?a=1&amp;b=2</loc>')
    expect(xml.startsWith('<?xml')).toBe(true)
  })
})
