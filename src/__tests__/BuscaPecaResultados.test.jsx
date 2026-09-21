import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultadoFts } from '../components/BuscaPeca'
import { ThemeProvider, useTheme } from '../theme'

const entradas = [
  { id: 'a1', area: 'Cível', tipo: 'lei', tema: 'Competência territorial', fonte: 'CPC', url: 'https://exemplo.gov.br/x', teses: [{ tese_assunto: 'Foro do domicílio do autor' }] },
]

function Wrapper({ onAbrir }) {
  const { theme } = useTheme()
  return <ResultadoFts entradas={entradas} theme={theme} onAbrir={onAbrir} />
}

function renderResultados(onAbrir) {
  render(<ThemeProvider><Wrapper onAbrir={onAbrir} /></ThemeProvider>)
}

describe('ResultadoFts', () => {
  it('abre a entrada ao clicar no cartão', () => {
    const onAbrir = vi.fn()
    renderResultados(onAbrir)
    fireEvent.click(screen.getByRole('button', { name: /Abrir no acervo: Competência territorial/ }))
    expect(onAbrir).toHaveBeenCalledWith(entradas[0])
  })

  it('abre a entrada com Enter pelo teclado', () => {
    const onAbrir = vi.fn()
    renderResultados(onAbrir)
    fireEvent.keyDown(screen.getByRole('button', { name: /Abrir no acervo/ }), { key: 'Enter' })
    expect(onAbrir).toHaveBeenCalledTimes(1)
  })

  it('o link "Ver fonte" não dispara a abertura da entrada', () => {
    const onAbrir = vi.fn()
    renderResultados(onAbrir)
    fireEvent.click(screen.getByText(/Ver fonte/))
    expect(onAbrir).not.toHaveBeenCalled()
  })

  it('sem onAbrir, o cartão não é clicável', () => {
    renderResultados(undefined)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
