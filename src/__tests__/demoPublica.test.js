import { describe, it, expect } from 'vitest'
import { agruparArtigos } from '../components/DemoPublica'

describe('agruparArtigos (demonstração pública)', () => {
  it('agrupa por artigo, separa artigo com letra e ordena os dispositivos', () => {
    const linhas = [
      { numero: 3, titulo: null, paragrafo: null, inciso: 'II', texto: 'II - b' },
      { numero: 3, titulo: null, paragrafo: null, inciso: null, texto: 'Art. 3º caput' },
      { numero: 3, titulo: null, paragrafo: null, inciso: 'I', texto: 'I - a' },
      { numero: 3, titulo: 'Art. 3-A', paragrafo: null, inciso: null, texto: 'Art. 3-A caput' },
      { numero: 2, titulo: null, paragrafo: null, inciso: null, texto: 'Art. 2º caput' },
    ]
    const g = agruparArtigos(linhas)
    expect(g.map(x => x.titulo)).toEqual(['Art. 2', 'Art. 3', 'Art. 3-A'])
    expect(g[1].itens.map(i => i.texto)).toEqual(['Art. 3º caput', 'I - a', 'II - b'])
  })

  it('aceita lista vazia ou nula', () => {
    expect(agruparArtigos([])).toEqual([])
    expect(agruparArtigos(null)).toEqual([])
  })
})
