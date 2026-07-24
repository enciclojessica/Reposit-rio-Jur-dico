import { describe, it, expect } from 'vitest'
import { TODAS_DISCIPLINAS, gerarSessoes } from '../components/CronogramaWizard'
import { DISC_COR } from '../data/disciplinas'

// Regressão: em 24/07/2026, TODAS_DISCIPLINAS usava nome: 'Simulados'
// (plural) enquanto DISC_COR, OabSessaoCard e OabDashboard esperavam
// 'Simulado Geral' em todos os outros lugares. O nome divergente quebrava
// em cascata: o botão "Iniciar Simulado" nunca aparecia (a checagem
// s.disciplina === 'Simulado Geral' nunca batia) e o botão "Praticar" da
// Home aparecia onde não devia, levando a um filtro de questões que nunca
// encontrava nada.
describe('CronogramaWizard — nomes de disciplina consistentes com DISC_COR', () => {
  it('todo nome de disciplina do wizard existe como chave em DISC_COR', () => {
    for (const d of TODAS_DISCIPLINAS) {
      expect(DISC_COR, `"${d.nome}" não existe em DISC_COR`).toHaveProperty(d.nome)
    }
  })

  it('a disciplina de simulado é exatamente "Simulado Geral" (usada por OabSessaoCard e OabDashboard)', () => {
    const simulado = TODAS_DISCIPLINAS.find(d => d.id === 'simulado')
    expect(simulado.nome).toBe('Simulado Geral')
  })

  it('sessões de simulado geradas pelo wizard usam disciplina "Simulado Geral"', () => {
    const config = {
      dataInicio: '2026-08-01',
      diasSemana: [1, 3, 5, 6],
      horasPorDia: 2,
      disciplinasPrioridade: ['simulado', 'civil', 'procc', 'const', 'penal', 'procp', 'trab', 'trib', 'emp', 'adm', 'etica'],
      dataFimFase1: '2027-01-10',
      dataFimFase2: '2027-02-27',
    }
    const sessoes = gerarSessoes(config)
    const temSimulado = sessoes.some(s => s.disciplina === 'Simulado Geral')
    expect(temSimulado).toBe(true)
  })
})
