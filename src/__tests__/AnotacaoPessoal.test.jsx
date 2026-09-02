import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AnotacaoPessoal from '../components/AnotacaoPessoal'
import { temaFake } from './testUtils'

beforeEach(() => localStorage.clear())

describe('AnotacaoPessoal', () => {
  it('renderiza fechado por padrão, sem anotação', () => {
    render(<AnotacaoPessoal itemId="abc" namespace="entrada" theme={temaFake} />)
    expect(screen.getByText('Adicionar anotação')).toBeInTheDocument()
  })

  it('salva no localStorage com chave namespaced (evita colisão entre telas)', () => {
    render(<AnotacaoPessoal itemId="123" namespace="peca" theme={temaFake} />)
    fireEvent.click(screen.getByText('Adicionar anotação'))
    fireEvent.change(screen.getByPlaceholderText('Sua anotação...'), { target: { value: 'nota de teste' } })
    expect(localStorage.getItem('lexia_nota_peca_123')).toBe('nota de teste')
  })

  it('migra anotação salva na chave antiga (sem namespace)', () => {
    localStorage.setItem('lexia_nota_999', 'nota antiga')
    render(<AnotacaoPessoal itemId="999" namespace="peca" theme={temaFake} />)
    fireEvent.click(screen.getByText('Ver anotação'))
    expect(screen.getByDisplayValue('nota antiga')).toBeInTheDocument()
    expect(localStorage.getItem('lexia_nota_peca_999')).toBe('nota antiga')
    expect(localStorage.getItem('lexia_nota_999')).toBeNull()
  })

  it('itens diferentes (mesmo id, namespaces diferentes) não colidem', () => {
    localStorage.setItem('lexia_nota_entrada_1', 'nota do repositório')
    localStorage.setItem('lexia_nota_peca_1', 'nota de outra tela')
    const { unmount } = render(<AnotacaoPessoal itemId="1" namespace="entrada" theme={temaFake} />)
    fireEvent.click(screen.getByText('Ver anotação'))
    expect(screen.getByDisplayValue('nota do repositório')).toBeInTheDocument()
    unmount()
    render(<AnotacaoPessoal itemId="1" namespace="peca" theme={temaFake} />)
    fireEvent.click(screen.getByText('Ver anotação'))
    expect(screen.getByDisplayValue('nota de outra tela')).toBeInTheDocument()
  })
})
