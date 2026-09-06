import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TextoComReferenciasLegais from '../components/TextoComReferenciasLegais'
import { temaFake } from './testUtils'

describe('TextoComReferenciasLegais', () => {
  it('renderiza texto puro quando não há onAbrirArtigo', () => {
    render(<TextoComReferenciasLegais texto="art. 6º do CDC" theme={temaFake} />)
    expect(screen.getByText('art. 6º do CDC')).toBeInTheDocument()
  })

  it('renderiza texto puro quando não há referência detectável', () => {
    render(<TextoComReferenciasLegais texto="sem citação de lei aqui" theme={temaFake} onAbrirArtigo={vi.fn()} />)
    expect(screen.getByText('sem citação de lei aqui')).toBeInTheDocument()
  })

  it('linka referência normal, sem aviso, quando não está no Set de revogados', () => {
    render(<TextoComReferenciasLegais texto="nos termos do art. 6º do CDC" theme={temaFake} onAbrirArtigo={vi.fn()} revogados={new Set()} />)
    const link = screen.getByText('art. 6º')
    expect(link).toHaveStyle({ color: temaFake.gold })
  })

  it('mostra aviso quando a referência está no Set de revogados', () => {
    render(<TextoComReferenciasLegais texto="nos termos do art. 760 do CC" theme={temaFake} onAbrirArtigo={vi.fn()}
      revogados={new Set(['cc|760'])} />)
    const link = screen.getByText('art. 760')
    expect(link).toHaveStyle({ color: temaFake.error })
    expect(link.closest('span')).toHaveAttribute('title', expect.stringContaining('não está mais vigente'))
  })
})
