import { describe, it, expect } from 'vitest'
import { DISCIPLINAS, EXAMES, MODOS, EXAME_ANO, fmtTempo, fmtData } from '../data/oabQuestoesConstants'

describe('DISCIPLINAS', () => {
  it('exclui "Simulado Geral" (não é disciplina classificável)', () => {
    expect(DISCIPLINAS).not.toContain('Simulado Geral')
  })

  it('não está vazia', () => {
    expect(DISCIPLINAS.length).toBeGreaterThan(0)
  })
})

describe('EXAMES', () => {
  it('começa com "Todos" e inclui os exames 38 a 45', () => {
    expect(EXAMES[0]).toBe('Todos')
    for (const n of ['38','39','40','41','42','43','44','45']) {
      expect(EXAMES).toContain(n)
    }
  })
})

describe('MODOS', () => {
  it('tem ids únicos e label/desc preenchidos', () => {
    const ids = MODOS.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const m of MODOS) {
      expect(m.label?.trim().length).toBeGreaterThan(0)
      expect(m.desc?.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('EXAME_ANO', () => {
  it('tem uma entrada para cada exame numerado em EXAMES', () => {
    const numeros = EXAMES.filter(e => e !== 'Todos')
    for (const n of numeros) {
      expect(EXAME_ANO, `EXAME_ANO sem entrada para o exame ${n}`).toHaveProperty(n)
    }
  })
})

describe('fmtTempo', () => {
  it('formata igual ao helper do OabDashboard', () => {
    expect(fmtTempo(65)).toBe('01:05')
    expect(fmtTempo(3661)).toBe('1:01:01')
  })
})

describe('fmtData', () => {
  it('retorna string vazia para valor nulo/ausente', () => {
    expect(fmtData(null)).toBe('')
    expect(fmtData(undefined)).toBe('')
  })

  it('formata uma data ISO válida sem lançar erro', () => {
    const resultado = fmtData('2026-07-15T10:30:00Z')
    expect(typeof resultado).toBe('string')
    expect(resultado.length).toBeGreaterThan(0)
  })
})
