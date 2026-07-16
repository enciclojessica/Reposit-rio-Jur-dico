import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ModalModelos from '../components/ModalModelos'
import { ThemeProvider } from '../theme'
import { MODELOS_PECAS } from '../data/modelosPecas'

function renderModal() {
  const onUsar = vi.fn()
  const onFechar = vi.fn()
  render(
    <ThemeProvider>
      <ModalModelos onUsar={onUsar} onFechar={onFechar} />
    </ThemeProvider>
  )
  return { onUsar, onFechar }
}

describe('ModalModelos', () => {
  it('renderiza sem quebrar e lista os modelos disponíveis', () => {
    renderModal()
    expect(screen.getByText('Modelos de Peças')).toBeInTheDocument()
    expect(screen.getByText(MODELOS_PECAS[0].titulo)).toBeInTheDocument()
  })

  it('chama onUsar com o modelo escolhido ao clicar', () => {
    const { onUsar } = renderModal()
    fireEvent.click(screen.getByText(MODELOS_PECAS[0].titulo))
    expect(onUsar).toHaveBeenCalledWith(MODELOS_PECAS[0])
  })

  it('chama onFechar ao clicar no X', () => {
    const { onFechar } = renderModal()
    fireEvent.click(screen.getByLabelText('Fechar'))
    expect(onFechar).toHaveBeenCalled()
  })

  it('filtra por categoria', () => {
    renderModal()
    const categoriaComItens = MODELOS_PECAS[0].categoria
    fireEvent.click(screen.getByText(categoriaComItens))
    // ao menos o próprio modelo de referência continua visível na categoria dele
    expect(screen.getByText(MODELOS_PECAS[0].titulo)).toBeInTheDocument()
  })
})
