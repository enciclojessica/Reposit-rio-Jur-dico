import { describe, it, expect } from 'vitest'
import { gerarSessoes } from '../components/CronogramaWizard'

// Regressão: em 24/07/2026, o cronograma sempre começava com Ética
// Profissional, mesmo quando o usuário a marcava como menos prioritária.
// A causa raiz: a fila de sessões era montada iterando TODAS_DISCIPLINAS
// (ordem fixa do array-fonte, onde ética vem primeiro), em vez de seguir
// disciplinasPrioridade (a ordem que o usuário configura na Etapa 4). A
// prioridade só influenciava o peso (quantidade de sessões), não a posição
// na fila, então os primeiros dias sempre caíam na primeira disciplina do
// array-fonte, não na primeira disciplina priorizada pelo usuário.
describe('gerarSessoes — ordem de prioridade', () => {
  const configBase = {
    dataInicio: '2026-08-01',
    diasSemana: [1, 3, 5, 6],
    horasPorDia: 2,
    dataFimFase1: '2027-01-10',
    dataFimFase2: '2027-02-27',
  }

  it('a primeira sessão da 1ª Fase é da disciplina mais prioritária, não a primeira do array-fonte', () => {
    const config = {
      ...configBase,
      // Ética (primeira do array-fonte) marcada como MENOS prioritária;
      // Direito Tributário movido para o topo.
      disciplinasPrioridade: ['trib', 'civil', 'procc', 'const', 'penal', 'procp', 'trab', 'emp', 'adm', 'simulado', 'etica'],
    }
    const sessoes = gerarSessoes(config)
    const primeiraFase1 = sessoes.find(s => s.fase === '1ª Fase')
    expect(primeiraFase1.disciplina).toBe('Direito Tributário')
  })

  it('com a ordem padrão (ética primeiro), a primeira sessão é de Ética', () => {
    const config = {
      ...configBase,
      disciplinasPrioridade: ['etica', 'civil', 'procc', 'const', 'penal', 'procp', 'trab', 'trib', 'emp', 'adm', 'simulado'],
    }
    const sessoes = gerarSessoes(config)
    const primeiraFase1 = sessoes.find(s => s.fase === '1ª Fase')
    expect(primeiraFase1.disciplina).toBe('Ética Profissional')
  })

  it('disciplina deprioritizada (movida para o fim) concentra sessões nos últimos dias da 1ª Fase, não nos primeiros', () => {
    const config = {
      ...configBase,
      disciplinasPrioridade: ['civil', 'procc', 'const', 'penal', 'procp', 'trab', 'trib', 'emp', 'adm', 'simulado', 'etica'],
    }
    const sessoes = gerarSessoes(config)
    const fase1 = sessoes.filter(s => s.fase === '1ª Fase')
    const primeirosDez = fase1.slice(0, 10)
    expect(primeirosDez.some(s => s.disciplina === 'Ética Profissional')).toBe(false)
  })
})
