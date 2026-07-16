import { describe, it, expect } from 'vitest'
import { parseLeiSeca } from '../utils/parseLeiSeca'

describe('parseLeiSeca', () => {
  it('reconhece um único código com um intervalo', () => {
    expect(parseLeiSeca('CC/02 arts. 1–78: pessoas naturais, personalidade, capacidade'))
      .toEqual(expect.arrayContaining([{ codigo: 'cc', min: 1, max: 78 }]))
  })

  it('reconhece múltiplos intervalos do mesmo código', () => {
    const r = parseLeiSeca('CC/02 arts. 104–232: negócio jurídico; arts. 189–206-A: prescrição')
    expect(r).toContainEqual({ codigo: 'cc', min: 104, max: 232 })
    expect(r.some(x => x.codigo === 'cc' && x.min === 189)).toBe(true)
  })

  it('reconhece múltiplos códigos no mesmo tópico', () => {
    const r = parseLeiSeca('CC/02 arts. 927–954 + CDC arts. 12–17: responsabilidade civil')
    expect(r).toContainEqual({ codigo: 'cc', min: 927, max: 954 })
    expect(r).toContainEqual({ codigo: 'cdc', min: 12, max: 17 })
  })

  it('reconhece CPP com múltiplas faixas separadas por ponto e vírgula', () => {
    const r = parseLeiSeca('CPP arts. 4–28: inquérito policial; arts. 29–62: ação penal; arts. 69–91: competência')
    expect(r).toContainEqual({ codigo: 'cpp', min: 4, max: 28 })
    expect(r).toContainEqual({ codigo: 'cpp', min: 29, max: 62 })
    expect(r).toContainEqual({ codigo: 'cpp', min: 69, max: 91 })
  })

  it('ignora códigos sem banco próprio (CP, CLT, CTN)', () => {
    expect(parseLeiSeca('CP arts. 1–28: princípios, aplicação da lei penal')).toEqual([])
    expect(parseLeiSeca('CLT arts. 2–19: empregado/empregador')).toEqual([])
    expect(parseLeiSeca('CTN arts. 1–95: tributo, espécies')).toEqual([])
  })

  it('reconhece artigo único sem intervalo (CF art. 5º)', () => {
    const r = parseLeiSeca('CF/88 art. 5º, LXVIII–LXXIII: HC, HD, MS individual e coletivo')
    expect(r.some(x => x.codigo === 'cf' && x.min === 5)).toBe(true)
  })

  it('retorna vazio quando não há menção a código nenhum', () => {
    expect(parseLeiSeca('Simulado Final: condições reais da 2ª Fase')).toEqual([])
  })

  it('retorna vazio para texto nulo/vazio', () => {
    expect(parseLeiSeca('')).toEqual([])
    expect(parseLeiSeca(null)).toEqual([])
  })
})
