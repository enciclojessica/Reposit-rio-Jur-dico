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

  it('mostra aviso do dispositivo quando o inciso citado está revogado (CP 121, § 2º, VI)', () => {
    render(<TextoComReferenciasLegais texto="Art. 121, § 2º, VI, CP" theme={temaFake} onAbrirArtigo={vi.fn()}
      revogados={new Set(['cp|121|2|VI'])} />)
    const link = screen.getByText('Art. 121')
    expect(link).toHaveStyle({ color: temaFake.error })
    expect(link.closest('span')).toHaveAttribute('title', expect.stringContaining('Este dispositivo (§ 2º, inciso VI)'))
  })

  it('não mostra aviso quando outro dispositivo do mesmo artigo é que está revogado', () => {
    render(<TextoComReferenciasLegais texto="Art. 121, § 1º, CP" theme={temaFake} onAbrirArtigo={vi.fn()}
      revogados={new Set(['cp|121|2|VI'])} />)
    const link = screen.getByText('Art. 121')
    expect(link).toHaveStyle({ color: temaFake.gold })
    expect(link.closest('span')).toHaveAttribute('title', 'Abrir na Legislação')
  })

  it('citação ao artigo sem dispositivo não é marcada por dispositivo revogado dele', () => {
    render(<TextoComReferenciasLegais texto="nos termos do art. 121 do Código Penal" theme={temaFake} onAbrirArtigo={vi.fn()}
      revogados={new Set(['cp|121|2|VI'])} />)
    expect(screen.getByText('art. 121')).toHaveStyle({ color: temaFake.gold })
  })

  it('artigo revogado prevalece e mantém a mensagem de artigo', () => {
    render(<TextoComReferenciasLegais texto="Art. 121, § 2º, VI, CP" theme={temaFake} onAbrirArtigo={vi.fn()}
      revogados={new Set(['cp|121', 'cp|121|2|VI'])} />)
    const link = screen.getByText('Art. 121')
    expect(link.closest('span')).toHaveAttribute('title', expect.stringContaining('Este artigo não está mais vigente'))
  })
})
