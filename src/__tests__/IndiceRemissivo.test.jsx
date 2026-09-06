import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../theme'
import IndiceRemissivo from '../components/IndiceRemissivo'

const entradasFake = [
  { id: '1', tags: ['cpp', 'homicídio qualificado'] },
  { id: '2', tags: ['cc', 'comunhão parcial'] },
  { id: '3', tags: ['art. 121 §2º III CP'] },
  { id: '4', tags: ['lei 9.099'] },
]

function renderIndice(onSelecionarTag = vi.fn()) {
  render(
    <ThemeProvider>
      <IndiceRemissivo entradas={entradasFake} onSelecionarTag={onSelecionarTag} />
    </ThemeProvider>
  )
  return { onSelecionarTag }
}

describe('IndiceRemissivo', () => {
  it('separa código de lei e artigo em Legislação citada, assunto em Assuntos', () => {
    renderIndice()
    expect(screen.getByText('Assuntos')).toBeInTheDocument()
    expect(screen.getByText('Legislação citada')).toBeInTheDocument()
    expect(screen.getByText('#homicídio qualificado')).toBeInTheDocument()
    expect(screen.getByText('#cpp')).toBeInTheDocument()
    expect(screen.getByText('#art. 121 §2º III CP')).toBeInTheDocument()
    expect(screen.getByText('#lei 9.099')).toBeInTheDocument()
  })

  it('filtra tags pelo campo de busca', () => {
    renderIndice()
    fireEvent.change(screen.getByPlaceholderText(/Filtrar/), { target: { value: 'homic' } })
    expect(screen.getByText('#homicídio qualificado')).toBeInTheDocument()
    expect(screen.queryByText('#cpp')).not.toBeInTheDocument()
  })

  it('aciona onSelecionarTag com o nome certo ao clicar', () => {
    const { onSelecionarTag } = renderIndice()
    fireEvent.click(screen.getByText('#cc'))
    expect(onSelecionarTag).toHaveBeenCalledWith('cc')
  })

  it('mostra mensagem quando não há tags', () => {
    render(
      <ThemeProvider>
        <IndiceRemissivo entradas={[]} onSelecionarTag={vi.fn()} />
      </ThemeProvider>
    )
    expect(screen.getByText('Nenhuma tag cadastrada ainda.')).toBeInTheDocument()
  })
})
