import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CronogramaWizard from '../components/CronogramaWizard'
import { temaFake } from './testUtils'

// Regressão: em 24/07/2026, o OabDashboard sempre montava o CronogramaWizard
// sem passar a configuração já salva no banco (initialConfig). Isso fazia
// com que, toda vez que o usuário clicasse em "Reconfigurar", a ordem de
// prioridade voltasse ao padrão do código (ética primeiro), descartando
// qualquer reordenação feita em sessões anteriores — mesmo já estando salva.
function avancarAteEtapa4() {
  fireEvent.click(screen.getByText(/Próximo/))
  fireEvent.click(screen.getByText(/Próximo/))
  fireEvent.click(screen.getByText(/Próximo/))
}

describe('CronogramaWizard — pré-preenchimento com a config salva', () => {
  it('sem initialConfig, usa a ordem padrão do código (ética primeiro)', () => {
    render(<CronogramaWizard session={null} theme={temaFake} onConcluir={() => {}} />)
    avancarAteEtapa4()
    expect(screen.getByText('Ordene por prioridade')).toBeInTheDocument()
    const nomes = screen.getAllByText(/Direito|Ética|Simulados/).map(el => el.textContent)
    expect(nomes[0]).toBe('Ética Profissional')
  })

  it('com initialConfig, respeita a ordem de prioridade já salva pelo usuário', () => {
    const configSalva = {
      dataInicio: '2026-08-01',
      diasSemana: [1, 3, 5, 6],
      horasPorDia: 2,
      disciplinasPrioridade: ['trib', 'civil', 'procc', 'const', 'penal', 'procp', 'trab', 'emp', 'adm', 'simulado', 'etica'],
      dataFimFase1: '2027-01-10',
      dataFimFase2: '2027-02-27',
    }
    render(<CronogramaWizard session={null} theme={temaFake} onConcluir={() => {}} initialConfig={configSalva} />)
    avancarAteEtapa4()
    const nomes = screen.getAllByText(/Direito|Ética|Simulados/).map(el => el.textContent)
    expect(nomes[0]).toBe('Direito Tributário')
    expect(nomes[nomes.length - 1]).toBe('Ética Profissional')
  })
})
