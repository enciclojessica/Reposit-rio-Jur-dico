import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AnotacaoPessoal from '../components/AnotacaoPessoal'
import { temaFake } from './testUtils'

// Mock encadeável do client do Supabase.
let mockRow = null       // linha retornada por maybeSingle()
let upsertCalls = []

vi.mock('../supabase', () => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: async () => ({ data: mockRow, error: null }),
    upsert: (payload) => { upsertCalls.push(payload); return Promise.resolve({ data: null, error: null }) },
  }
  return { supabase: { from: () => chain } }
})

const sessaoFake = { user: { id: 'user-1' } }

beforeEach(() => {
  localStorage.clear()
  mockRow = null
  upsertCalls = []
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => { vi.useRealTimers() })

describe('AnotacaoPessoal', () => {
  it('sem sessão, não renderiza nada (evita salvar anotação anônima)', () => {
    const { container } = render(<AnotacaoPessoal itemId="abc" namespace="entrada" theme={temaFake} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('com sessão e sem anotação salva, mostra "Adicionar anotação"', async () => {
    render(<AnotacaoPessoal itemId="abc" session={sessaoFake} namespace="entrada" theme={temaFake} />)
    await waitFor(() => expect(screen.getByText('Adicionar anotação')).toBeInTheDocument())
  })

  it('carrega o texto já salvo no Supabase', async () => {
    mockRow = { texto: 'nota já salva na conta' }
    render(<AnotacaoPessoal itemId="123" session={sessaoFake} namespace="peca" theme={temaFake} />)
    await waitFor(() => expect(screen.getByText('Ver anotação')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Ver anotação'))
    expect(screen.getByDisplayValue('nota já salva na conta')).toBeInTheDocument()
  })

  it('migra anotação antiga do localStorage quando não há nada no Supabase ainda', async () => {
    localStorage.setItem('lexia_nota_peca_999', 'nota antiga do navegador')
    render(<AnotacaoPessoal itemId="999" session={sessaoFake} namespace="peca" theme={temaFake} />)
    await waitFor(() => expect(screen.getByText('Ver anotação')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Ver anotação'))
    expect(screen.getByDisplayValue('nota antiga do navegador')).toBeInTheDocument()
    expect(upsertCalls[0]).toMatchObject({ user_id: 'user-1', namespace: 'peca', item_id: '999', texto: 'nota antiga do navegador' })
    expect(localStorage.getItem('lexia_nota_peca_999')).toBeNull()
  })

  it('salva no Supabase após pausa na digitação (debounce), não a cada tecla', async () => {
    render(<AnotacaoPessoal itemId="1" session={sessaoFake} namespace="entrada" theme={temaFake} />)
    await waitFor(() => expect(screen.getByText('Adicionar anotação')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Adicionar anotação'))
    fireEvent.change(screen.getByPlaceholderText('Sua anotação...'), { target: { value: 'nota nova' } })

    expect(upsertCalls.length).toBe(0)
    await act(async () => { vi.advanceTimersByTime(900) })
    expect(upsertCalls.length).toBe(1)
    expect(upsertCalls[0]).toMatchObject({ user_id: 'user-1', namespace: 'entrada', item_id: '1', texto: 'nota nova' })
  })
})
