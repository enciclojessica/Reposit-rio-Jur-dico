import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../theme'

function Modo() {
  const { mode } = useTheme()
  return <div data-testid="modo">{mode}</div>
}

describe('tema durante a impressão', () => {
  beforeEach(() => localStorage.setItem('sintese_tema', 'escuro'))

  it('força o tema claro enquanto imprime e restaura o escuro depois', () => {
    render(<ThemeProvider><Modo /></ThemeProvider>)
    expect(screen.getByTestId('modo').textContent).toBe('dark')

    act(() => { window.dispatchEvent(new Event('beforeprint')) })
    expect(screen.getByTestId('modo').textContent).toBe('light')

    act(() => { window.dispatchEvent(new Event('afterprint')) })
    expect(screen.getByTestId('modo').textContent).toBe('dark')
  })

  it('não altera a preferência salva do usuário', () => {
    render(<ThemeProvider><Modo /></ThemeProvider>)
    act(() => { window.dispatchEvent(new Event('beforeprint')) })
    expect(localStorage.getItem('sintese_tema')).toBe('escuro')
  })
})
