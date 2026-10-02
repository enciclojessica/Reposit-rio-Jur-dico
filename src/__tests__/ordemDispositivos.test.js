import { describe, it, expect } from 'vitest'
import { compararDispositivos, ordenarDispositivos, romanoParaNumero, chaveParagrafo } from '../../lib/ordemDispositivos'

const ordem = (lista) => ordenarDispositivos(lista).map(d => `${d.paragrafo ?? ''}|${d.inciso ?? ''}`)

describe('numeral romano', () => {
  it('converte corretamente', () => {
    expect(['I', 'IV', 'IX', 'XIV', 'XIX', 'XL', 'LXXVIII', 'XCIX', 'C'].map(romanoParaNumero))
      .toEqual([1, 4, 9, 14, 19, 40, 78, 99, 100])
  })
})

describe('parágrafos', () => {
  it('ordena 1, 2, 2-A, 10 e único numericamente', () => {
    const l = ['10', '2-A', '1', 'único', '2'].map(p => ({ paragrafo: p, inciso: null }))
    expect(ordenarDispositivos(l).map(d => d.paragrafo)).toEqual(['único', '1', '2', '2-A', '10'])
    expect(chaveParagrafo(null)).toBe(0)
  })
})

describe('incisos (o defeito que aparecia na tela)', () => {
  it('XIV vem antes de XV, XIX depois de XVIII, IX-A depois de VIII e antes de X', () => {
    const embaralhado = ['XIX', 'XV', 'IX-A', 'XIV', 'V', 'X', 'XVIII', 'IV', 'VIII', 'XX', 'I', 'XXI', 'XVI', 'XVII', 'XIII']
      .map(i => ({ paragrafo: null, inciso: i }))
    expect(ordenarDispositivos(embaralhado).map(d => d.inciso)).toEqual(
      ['I', 'IV', 'V', 'VIII', 'IX-A', 'X', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'])
  })

  it('art. 5º da CF: LXXVIII depois de LXXVII e antes de nada alfabético', () => {
    const l = ['LXXVIII', 'L', 'V', 'LI', 'IX', 'LXXVI', 'IV', 'LXXVII', 'XLVII'].map(i => ({ paragrafo: null, inciso: i }))
    expect(ordenarDispositivos(l).map(d => d.inciso)).toEqual(
      ['IV', 'V', 'IX', 'XLVII', 'L', 'LI', 'LXXVI', 'LXXVII', 'LXXVIII'])
  })
})

describe('estrutura completa de um artigo', () => {
  it('caput, incisos do caput, parágrafos com seus incisos e alíneas', () => {
    const lista = [
      { paragrafo: '1', inciso: 'II' },
      { paragrafo: null, inciso: 'II-b' },
      { paragrafo: 'único', inciso: null },
      { paragrafo: '1', inciso: null },
      { paragrafo: null, inciso: null },
      { paragrafo: null, inciso: 'II-a' },
      { paragrafo: null, inciso: 'II' },
      { paragrafo: '1', inciso: 'I' },
      { paragrafo: null, inciso: 'I' },
      { paragrafo: '10', inciso: null },
      { paragrafo: '2', inciso: null },
      { paragrafo: '1', inciso: 'II-a' },
    ]
    expect(ordem(lista)).toEqual([
      '|', '|I', '|II', '|II-a', '|II-b',
      'único|',
      '1|', '1|I', '1|II', '1|II-a',
      '2|', '10|',
    ])
  })

  it('é estável: itens iguais mantêm a ordem em que vieram', () => {
    const a = { paragrafo: null, inciso: null, id: 1 }
    const b = { paragrafo: null, inciso: null, id: 2 }
    expect([b, a].sort(compararDispositivos).map(x => x.id)).toEqual([2, 1])
  })
})
