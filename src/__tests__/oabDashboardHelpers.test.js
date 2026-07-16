import { describe, it, expect } from 'vitest'
import { fmt, getMes, diasAte, fmtTempo, calcularRitmo } from '../data/oabDashboardHelpers'

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

describe('calcularRitmo', () => {
  const hoje = '2026-07-16'
  const sessions = [
    { id: 's1', date: '2026-07-01' }, // passada, concluída
    { id: 's2', date: '2026-07-10' }, // passada, NÃO concluída (atraso)
    { id: 's3', date: '2026-07-16' }, // é hoje, concluída
    { id: 's4', date: '2026-07-20' }, // futura, não conta
  ]

  it('conta só sessões com data <= hoje como "esperadas"', () => {
    const r = calcularRitmo(sessions, {}, hoje)
    expect(r.esperadas).toBe(3) // s1, s2, s3 — não s4
  })

  it('calcula atraso corretamente (esperadas - concluídas até hoje)', () => {
    const dados = {
      s1: { status: 'Concluído' },
      s3: { status: 'Concluído' },
    }
    const r = calcularRitmo(sessions, dados, hoje)
    expect(r.concEsperadas).toBe(2) // s1 e s3
    expect(r.atraso).toBe(1) // s2 ficou pra trás
  })

  it('atraso zero (ou negativo) quando está em dia ou adiantada', () => {
    const dados = { s1: { status: 'Concluído' }, s2: { status: 'Concluído' }, s3: { status: 'Concluído' } }
    const r = calcularRitmo(sessions, dados, hoje)
    expect(r.atraso).toBeLessThanOrEqual(0)
  })
})
