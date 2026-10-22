import { describe, it, expect } from 'vitest'
import { artigosRevogados, dispositivoRevogado } from '../utils/artigosRevogados'

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

describe('dispositivoRevogado', () => {
  const cp121 = [
    { numero: 121, titulo: null, paragrafo: null, inciso: null, vigente: true },
    { numero: 121, titulo: null, paragrafo: '2', inciso: 'VI', vigente: false },
    { numero: 121, titulo: null, paragrafo: '2', inciso: 'VII', vigente: true },
    { numero: 121, titulo: null, paragrafo: '2-A', inciso: null, vigente: false },
    { numero: 121, titulo: null, paragrafo: '7', inciso: null, vigente: false },
  ]

  it('marca a citação ao inciso revogado (CP 121, § 2º, VI)', () => {
    expect(dispositivoRevogado(cp121, 121, { paragrafo: '2', inciso: 'VI' })).toBe(true)
  })

  it('não marca inciso vigente do mesmo parágrafo', () => {
    expect(dispositivoRevogado(cp121, 121, { paragrafo: '2', inciso: 'VII' })).toBe(false)
  })

  it('não marca o parágrafo cujo inciso está revogado, nem o parágrafo vigente', () => {
    expect(dispositivoRevogado(cp121, 121, { paragrafo: '2', inciso: null })).toBe(false)
    expect(dispositivoRevogado(cp121, 121, { paragrafo: '1', inciso: null })).toBe(false)
  })

  it('marca parágrafo revogado, inclusive com letra', () => {
    expect(dispositivoRevogado(cp121, 121, { paragrafo: '2-A', inciso: null })).toBe(true)
    expect(dispositivoRevogado(cp121, 121, { paragrafo: '7', inciso: null })).toBe(true)
  })

  it('não confunde inciso de parágrafo com inciso do caput', () => {
    expect(dispositivoRevogado(cp121, 121, { paragrafo: null, inciso: 'VI' })).toBe(false)
  })

  it('sem linha correspondente no banco, não afirma revogação', () => {
    expect(dispositivoRevogado(cp121, 121, { paragrafo: '9', inciso: 'I' })).toBe(false)
    expect(dispositivoRevogado([], 121, { paragrafo: '2', inciso: 'VI' })).toBe(false)
    expect(dispositivoRevogado(null, 121, { paragrafo: '2', inciso: 'VI' })).toBe(false)
  })

  it('não marca quando alguma das linhas do dispositivo está vigente', () => {
    const linhas = [
      { numero: 112, titulo: null, paragrafo: null, inciso: 'I', vigente: false },
      { numero: 112, titulo: null, paragrafo: null, inciso: 'I', vigente: true },
    ]
    expect(dispositivoRevogado(linhas, 112, { paragrafo: null, inciso: 'I' })).toBe(false)
  })

  it('marca quando todas as linhas do dispositivo estão revogadas (duas linhas na fonte)', () => {
    const linhas = [
      { numero: 122, titulo: null, paragrafo: null, inciso: 'I', vigente: false },
      { numero: 122, titulo: null, paragrafo: null, inciso: 'I', vigente: false },
    ]
    expect(dispositivoRevogado(linhas, 122, { paragrafo: null, inciso: 'I' })).toBe(true)
  })

  it('alínea cai no inciso quando o inciso está revogado', () => {
    const linhas = [
      { numero: 50, titulo: null, paragrafo: '1', inciso: 'III', vigente: false },
    ]
    expect(dispositivoRevogado(linhas, 50, { paragrafo: '1', inciso: 'III-a' })).toBe(true)
  })

  it('alínea revogada, com linha própria', () => {
    const linhas = [
      { numero: 50, titulo: null, paragrafo: '1', inciso: 'III', vigente: true },
      { numero: 50, titulo: null, paragrafo: '1', inciso: 'III-a', vigente: false },
    ]
    expect(dispositivoRevogado(linhas, 50, { paragrafo: '1', inciso: 'III-a' })).toBe(true)
    expect(dispositivoRevogado(linhas, 50, { paragrafo: '1', inciso: 'III' })).toBe(false)
  })

  it('parágrafo revogado torna revogada a citação ao inciso dele', () => {
    const linhas = [
      { numero: 7, titulo: null, paragrafo: '3', inciso: null, vigente: false },
      { numero: 7, titulo: null, paragrafo: '3', inciso: 'II', vigente: true },
    ]
    expect(dispositivoRevogado(linhas, 7, { paragrafo: '3', inciso: 'II' })).toBe(true)
  })

  it('ignora linhas de artigo com letra e de outro artigo', () => {
    const linhas = [
      { numero: 121, titulo: 'Art. 121-A', paragrafo: '1', inciso: null, vigente: false },
      { numero: 122, titulo: null, paragrafo: '1', inciso: null, vigente: false },
    ]
    expect(dispositivoRevogado(linhas, 121, { paragrafo: '1', inciso: null })).toBe(false)
  })

  it('aceita numero como texto vindo do banco e caixa diferente na letra do parágrafo', () => {
    const linhas = [
      { numero: '121', titulo: null, paragrafo: '2-a', inciso: 'VI', vigente: false },
    ]
    expect(dispositivoRevogado(linhas, 121, { paragrafo: '2-A', inciso: 'VI' })).toBe(true)
  })

  it('devolve false sem dispositivo', () => {
    expect(dispositivoRevogado(cp121, 121, null)).toBe(false)
    expect(dispositivoRevogado(cp121, 121, { paragrafo: null, inciso: null })).toBe(false)
  })
})
