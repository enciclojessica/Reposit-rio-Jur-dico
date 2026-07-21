import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileNav from '../components/MobileNav'
import { VIEWS } from '../data/views'
import { temaFake } from './testUtils'

function renderNav(props = {}) {
  const setView = vi.fn()
  const setMaisAberto = vi.fn()
  render(
    <MobileNav
      theme={temaFake}
      view={VIEWS.HOME}
      setView={setView}
      maisAberto={false}
      setMaisAberto={setMaisAberto}
      isEditor={false}
      isAdmin={false}
      session={null}
      entradas={[]}
      isOwner={false}
      exportarTesesPlanilha={vi.fn()}
      {...props}
    />
  )
  return { setView, setMaisAberto }
}

describe('MobileNav', () => {
  it('renderiza os itens fixos de navegação', () => {
    renderNav()
    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Busca IA')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Mais')).toBeInTheDocument()
  })

  it('não mostra "Nova" para quem não é editor', () => {
    renderNav({ isEditor: false })
    expect(screen.queryByText('Nova')).not.toBeInTheDocument()
  })

  it('mostra "Nova" para editor', () => {
    renderNav({ isEditor: true })
    expect(screen.getByText('Nova')).toBeInTheDocument()
  })

  it('abre o menu "Mais" ao clicar', () => {
    const { setMaisAberto } = renderNav()
    fireEvent.click(screen.getByText('Mais'))
    expect(setMaisAberto).toHaveBeenCalled()
  })

  it('navega ao clicar em "Início"', () => {
    const { setView } = renderNav()
    fireEvent.click(screen.getByText('Início'))
    expect(setView).toHaveBeenCalledWith(VIEWS.HOJE)
  })
})
