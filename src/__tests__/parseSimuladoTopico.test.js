import { describe, it, expect } from 'vitest'
import { parseSimuladoTopico } from '../utils/parseSimuladoTopico'

describe('parseSimuladoTopico', () => {
  it('extrai quantidade e disciplinas de "30 questões — Ética + Civil + Processo Civil"', () => {
    const r = parseSimuladoTopico('Simulado FGV-padrão: 30 questões — Ética + Civil + Processo Civil')
    expect(r.quantidade).toBe(30)
    expect(r.disciplinas.sort()).toEqual(['Direito Civil', 'Direito Processual Civil', 'Ética Profissional'].sort())
  })

  it('extrai quantidade e disciplinas de "30 questões — Constitucional + Penal + Processo Penal"', () => {
    const r = parseSimuladoTopico('Simulado FGV-padrão: 30 questões — Constitucional + Penal + Processo Penal')
    expect(r.quantidade).toBe(30)
    expect(r.disciplinas.sort()).toEqual(['Direito Constitucional', 'Direito Penal', 'Direito Processual Penal'].sort())
  })

  it('retorna disciplinas vazio (= todas) para "revisão geral"', () => {
    const r = parseSimuladoTopico('Simulado FGV-padrão: 40 questões — revisão geral 1ª Fase (todas as disciplinas)')
    expect(r.quantidade).toBe(40)
    expect(r.disciplinas).toEqual([])
  })

  it('reconhece os simulados completos de 80 questões sem disciplina específica', () => {
    const r = parseSimuladoTopico('Simulado completo: 80 questões — 3ª bateria')
    expect(r.quantidade).toBe(80)
    expect(r.disciplinas).toEqual([])
  })

  it('usa 80 como padrão quando não há tópico', () => {
    expect(parseSimuladoTopico(null)).toEqual({ quantidade: 80, disciplinas: [] })
    expect(parseSimuladoTopico('')).toEqual({ quantidade: 80, disciplinas: [] })
  })
})
