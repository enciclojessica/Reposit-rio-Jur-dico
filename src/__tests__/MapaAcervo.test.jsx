import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../theme'
import MapaAcervo from '../components/MapaAcervo'

const entradasFake = [
  { id: '1', tags: ['dano-moral', 'consumidor'] },
  { id: '2', tags: ['dano-moral', 'familia'] },
  { id: '3', tags: ['consumidor'] },
  { id: '4', tags: [] },
]

function renderMapa(entradas = entradasFake, onSelecionarTag = vi.fn()) {
  render(
    <ThemeProvider>
      <MapaAcervo entradas={entradas} onSelecionarTag={onSelecionarTag} />
    </ThemeProvider>
  )
  return { onSelecionarTag }
}

describe('MapaAcervo', () => {
  it('renderiza sem quebrar e mostra um nó por tag usada', () => {
    renderMapa()
    expect(screen.getByText('#dano-moral')).toBeInTheDocument()
    expect(screen.getByText('#consumidor')).toBeInTheDocument()
    expect(screen.getByText('#familia')).toBeInTheDocument()
  })

  it('mostra mensagem quando não há nenhuma tag no acervo', () => {
    renderMapa([{ id: '1', tags: [] }, { id: '2' }])
    expect(screen.getByText(/Nenhuma tag cadastrada ainda/)).toBeInTheDocument()
  })

  it('aciona onSelecionarTag com o nome certo da tag ao clicar num nó', () => {
    const { onSelecionarTag } = renderMapa()
    fireEvent.click(screen.getByText('#consumidor').closest('g'))
    expect(onSelecionarTag).toHaveBeenCalledWith('consumidor')
  })

  it('nunca deixa nó fora dos limites do SVG depois da simulação', () => {
    renderMapa()
    const circulos = document.querySelectorAll('circle')
    expect(circulos.length).toBeGreaterThan(0)
    circulos.forEach(c => {
      const cx = parseFloat(c.getAttribute('cx'))
      const cy = parseFloat(c.getAttribute('cy'))
      expect(cx).toBeGreaterThanOrEqual(0)
      expect(cx).toBeLessThanOrEqual(720)
      expect(cy).toBeGreaterThanOrEqual(0)
      expect(cy).toBeLessThanOrEqual(520)
    })
  })

  it('não quebra com lista de entradas vazia', () => {
    renderMapa([])
    expect(screen.getByText(/Nenhuma tag cadastrada ainda/)).toBeInTheDocument()
  })
})
