import { describe, it, expect } from 'vitest'
import { calcularProximaRevisao, estaPendente, INTERVALOS_DIAS } from '../utils/spacedRepetition'

describe('calcularProximaRevisao', () => {
  const agora = new Date('2026-07-16T12:00:00Z')

  it('"errei" zera o nível e agenda para o intervalo mais curto', () => {
    const r = calcularProximaRevisao(5, 'errei', agora)
    expect(r.nivel).toBe(0)
    expect(r.proximaRevisao).toBe(new Date('2026-07-17T12:00:00Z').toISOString())
  })

  it('"dificil" recua um nível (sem zerar) e não deixa negativo', () => {
    expect(calcularProximaRevisao(2, 'dificil', agora).nivel).toBe(1)
    expect(calcularProximaRevisao(0, 'dificil', agora).nivel).toBe(0)
  })

  it('"facil" avança um nível, respeitando o teto da tabela de intervalos', () => {
    expect(calcularProximaRevisao(0, 'facil', agora).nivel).toBe(1)
    const ultimo = INTERVALOS_DIAS.length - 1
    expect(calcularProximaRevisao(ultimo, 'facil', agora).nivel).toBe(ultimo)
  })

  it('intervalo cresce conforme o nível avança (repetição espaçada de verdade)', () => {
    const dias = (nivel) => {
      const r = calcularProximaRevisao(nivel - 1, 'facil', agora)
      return Math.round((new Date(r.proximaRevisao) - agora) / 86400000)
    }
    expect(dias(1)).toBeLessThan(dias(3))
    expect(dias(3)).toBeLessThan(dias(6))
  })
})

describe('estaPendente', () => {
  const agora = new Date('2026-07-16T12:00:00Z')

  it('card nunca revisado está sempre pendente', () => {
    expect(estaPendente(null, agora)).toBe(true)
    expect(estaPendente(undefined, agora)).toBe(true)
  })

  it('card com próxima revisão no passado está pendente', () => {
    expect(estaPendente({ proxima_revisao: '2026-07-10T00:00:00Z' }, agora)).toBe(true)
  })

  it('card com próxima revisão no futuro NÃO está pendente', () => {
    expect(estaPendente({ proxima_revisao: '2026-08-01T00:00:00Z' }, agora)).toBe(false)
  })
})
