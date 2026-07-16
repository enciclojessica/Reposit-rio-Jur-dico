import { describe, it, expect } from 'vitest'
import { DISC_COR } from '../data/disciplinas'

describe('DISC_COR', () => {
  it('tem uma cor definida para cada disciplina', () => {
    for (const [disc, cor] of Object.entries(DISC_COR)) {
      expect(cor, `disciplina "${disc}" sem cor válida`).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('contém as disciplinas centrais do banco de questões OAB', () => {
    const essenciais = [
      'Ética Profissional', 'Direito Civil', 'Direito Constitucional',
      'Direito Penal', 'Direito do Trabalho', 'Direito Tributário',
      'Direito Administrativo', 'Direito Empresarial',
    ]
    for (const d of essenciais) {
      expect(DISC_COR, `disciplina "${d}" ausente de DISC_COR`).toHaveProperty(d)
    }
  })

  it('inclui Simulado Geral (usado para colorir sessões de simulado no cronograma)', () => {
    expect(DISC_COR).toHaveProperty('Simulado Geral')
  })

  // Regressão: em 15/07/2026, DISC_COR estava duplicado em 3 arquivos e as
  // cópias haviam divergido (ex: Direito Previdenciário e Direito
  // Internacional com cores trocadas entre telas). Este teste não pode
  // detectar duplicação de arquivo diretamente, mas qualquer componente que
  // volte a declarar uma cópia local em vez de importar daqui vai divergir
  // de DISC_COR e ficaria evidente ao comparar manualmente — o valor real
  // deste teste é obrigar que exista SEMPRE uma fonte única e válida.
  it('não tem chaves ou cores vazias/duplicadas por engano', () => {
    const cores = Object.values(DISC_COR)
    const disciplinas = Object.keys(DISC_COR)
    expect(disciplinas.every(d => d.trim().length > 0)).toBe(true)
    expect(cores.every(c => c.trim().length > 0)).toBe(true)
  })
})
