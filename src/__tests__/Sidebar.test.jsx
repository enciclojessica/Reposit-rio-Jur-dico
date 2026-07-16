import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../components/Sidebar'
import { VIEWS } from '../data/views'
import { temaFake } from './testUtils'

function renderSidebar(props = {}) {
  const setView = vi.fn()
  const setAreaFilter = vi.fn()
  const setTipoFilter = vi.fn()
  const setPrefillEntry = vi.fn()
  render(
    <Sidebar
      theme={temaFake}
      view={VIEWS.HOME}
      setView={setView}
      setAreaFilter={setAreaFilter}
      setTipoFilter={setTipoFilter}
      isAdmin={false}
      isEditor={false}
      setPrefillEntry={setPrefillEntry}
      {...props}
    />
  )
  return { setView, setAreaFilter, setTipoFilter, setPrefillEntry }
}

describe('Sidebar', () => {
  it('renderiza sem quebrar e mostra a navegação básica', () => {
    renderSidebar()
    expect(screen.getByText('Lex.IA')).toBeInTheDocument()
    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Editor de Peças')).toBeInTheDocument()
    expect(screen.getByText('Estudos OAB')).toBeInTheDocument()
  })

  it('navega para o Editor de Peças ao clicar', () => {
    const { setView } = renderSidebar()
    fireEvent.click(screen.getByText('Editor de Peças'))
    expect(setView).toHaveBeenCalledWith(VIEWS.EDITOR)
  })

  it('não mostra "Membros" para quem não é admin', () => {
    renderSidebar({ isAdmin: false })
    expect(screen.queryByText('Membros')).not.toBeInTheDocument()
  })

  it('mostra "Membros" para admin', () => {
    renderSidebar({ isAdmin: true })
    expect(screen.getByText('Membros')).toBeInTheDocument()
  })

  it('mostra "+ Nova Entrada" apenas para editor', () => {
    renderSidebar({ isEditor: false })
    expect(screen.queryByText('+ Nova Entrada')).not.toBeInTheDocument()
    renderSidebar({ isEditor: true })
    expect(screen.getByText('+ Nova Entrada')).toBeInTheDocument()
  })

  it('mostra o bloco de assinatura no rodapé', () => {
    renderSidebar()
    expect(screen.getByText('Farias Fusquiani')).toBeInTheDocument()
  })
})
