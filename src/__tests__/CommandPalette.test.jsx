import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../theme'
import CommandPalette from '../components/CommandPalette'
import { VIEWS } from '../data/views'

function renderPaleta(props = {}) {
  const setView = vi.fn()
  const onFechar = vi.fn()
  render(
    <ThemeProvider>
      <CommandPalette onFechar={onFechar} setView={setView} isAdmin={false} isEditor={false} {...props} />
    </ThemeProvider>
  )
  return { setView, onFechar }
}

describe('CommandPalette', () => {
  it('lista os itens básicos, sem itens de editor/admin quando não tem permissão', () => {
    renderPaleta()
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    expect(screen.getByText('Favoritos')).toBeInTheDocument()
    expect(screen.queryByText('Nova entrada')).not.toBeInTheDocument()
    expect(screen.queryByText('Membros')).not.toBeInTheDocument()
  })

  it('mostra itens de editor quando isEditor', () => {
    renderPaleta({ isEditor: true })
    expect(screen.getByText('Nova entrada')).toBeInTheDocument()
    expect(screen.getByText('Editor de peças')).toBeInTheDocument()
  })

  it('mostra itens de admin quando isAdmin', () => {
    renderPaleta({ isAdmin: true })
    expect(screen.getByText('Membros')).toBeInTheDocument()
    expect(screen.getByText('Métricas')).toBeInTheDocument()
  })

  it('filtra pelo texto digitado', () => {
    renderPaleta()
    fireEvent.change(screen.getByPlaceholderText('Ir para…'), { target: { value: 'favor' } })
    expect(screen.getByText('Favoritos')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('mostra "Nada encontrado" quando o filtro não bate com nada', () => {
    renderPaleta()
    fireEvent.change(screen.getByPlaceholderText('Ir para…'), { target: { value: 'xyzxyz' } })
    expect(screen.getByText('Nada encontrado.')).toBeInTheDocument()
  })

  it('clicar num item navega e fecha a paleta', () => {
    const { setView, onFechar } = renderPaleta()
    fireEvent.click(screen.getByText('Favoritos'))
    expect(setView).toHaveBeenCalledWith(VIEWS.FAVORITOS)
    expect(onFechar).toHaveBeenCalled()
  })

  it('Escape fecha a paleta sem navegar', () => {
    const { setView, onFechar } = renderPaleta()
    fireEvent.keyDown(screen.getByPlaceholderText('Ir para…'), { key: 'Escape' })
    expect(onFechar).toHaveBeenCalled()
    expect(setView).not.toHaveBeenCalled()
  })

  it('Enter ativa o item selecionado (o primeiro, por padrão)', () => {
    const { setView } = renderPaleta()
    fireEvent.keyDown(screen.getByPlaceholderText('Ir para…'), { key: 'Enter' })
    expect(setView).toHaveBeenCalledWith(VIEWS.HOJE)
  })

  it('seta pra baixo muda a seleção antes de confirmar com Enter', () => {
    const { setView } = renderPaleta()
    const input = screen.getByPlaceholderText('Ir para…')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(setView).toHaveBeenCalledWith(VIEWS.HOME)
  })

  it('clicar fora (no overlay) fecha a paleta', () => {
    const { onFechar } = renderPaleta()
    fireEvent.click(screen.getByTestId('palette-overlay'))
    expect(onFechar).toHaveBeenCalled()
  })
})
