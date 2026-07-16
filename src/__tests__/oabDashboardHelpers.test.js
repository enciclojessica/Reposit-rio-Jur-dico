import { describe, it, expect } from 'vitest'
import { fmt, getMes, diasAte, fmtTempo } from '../data/oabDashboardHelpers'

describe('fmt (data dd/mm/aa)', () => {
  it('formata data ISO para dd/mm/aa', () => {
    expect(fmt('2026-07-15')).toBe('15/07/26')
  })
})

describe('getMes', () => {
  it('retorna mês abreviado + ano de 2 dígitos', () => {
    expect(getMes('2026-07-15')).toBe('Jul/26')
    expect(getMes('2027-01-05')).toBe('Jan/27')
  })
})

describe('diasAte', () => {
  it('retorna número (não NaN) para uma data válida', () => {
    expect(Number.isNaN(diasAte('2027-01-10'))).toBe(false)
  })
})

describe('fmtTempo', () => {
  it('formata segundos como mm:ss quando menor que 1 hora', () => {
    expect(fmtTempo(65)).toBe('01:05')
    expect(fmtTempo(0)).toBe('00:00')
  })

  it('formata como h:mm:ss quando 1 hora ou mais', () => {
    expect(fmtTempo(3661)).toBe('1:01:01')
  })
})
