import { describe, it, expect } from 'vitest'
import { artigosRevogados } from '../utils/artigosRevogados'

describe('artigosRevogados', () => {
  it('não marca artigo vigente que tem inciso ou parágrafo revogado (CP 121)', () => {
    const linhas = [
      { numero: 121, titulo: null, paragrafo: null, inciso: null, vigente: true },
      { numero: 121, titulo: null, paragrafo: '2', inciso: 'VI', vigente: false },
      { numero: 121, titulo: null, paragrafo: '2-A', inciso: null, vigente: false },
      { numero: 121, titulo: null, paragrafo: '7', inciso: null, vigente: false },
    ]
    expect(artigosRevogados(linhas)).toEqual([])
  })

  it('marca artigo cujo caput está revogado', () => {
    const linhas = [
      { numero: 786, titulo: null, paragrafo: null, inciso: null, vigente: false },
    ]
    expect(artigosRevogados(linhas)).toEqual([786])
  })

  it('sem linha de caput, marca só se nenhum dispositivo está vigente', () => {
    expect(artigosRevogados([
      { numero: 5, titulo: null, paragrafo: '1', inciso: null, vigente: false },
      { numero: 5, titulo: null, paragrafo: '2', inciso: null, vigente: false },
    ])).toEqual([5])
    expect(artigosRevogados([
      { numero: 6, titulo: null, paragrafo: '1', inciso: null, vigente: false },
      { numero: 6, titulo: null, paragrafo: '2', inciso: null, vigente: true },
    ])).toEqual([])
  })

  it('ignora linhas com título (artigo com letra) ao olhar o caput do artigo-base', () => {
    const linhas = [
      { numero: 121, titulo: null, paragrafo: null, inciso: null, vigente: true },
      { numero: 121, titulo: 'Art. 121-A', paragrafo: null, inciso: null, vigente: false },
    ]
    expect(artigosRevogados(linhas)).toEqual([])
  })
})
