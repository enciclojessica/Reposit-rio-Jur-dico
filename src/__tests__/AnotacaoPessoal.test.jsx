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

// Mock de SpeechRecognition — jsdom não tem essa API nativamente.
// Guarda a última instância criada pra poder disparar onresult/onend/onerror
// manualmente, simulando o comportamento real do navegador.
let ultimaInstanciaRec = null
class FakeSpeechRecognition {
  constructor() {
    this.startCallCount = 0
    ultimaInstanciaRec = this
  }
  start() { this.startCallCount++ }
  stop() { this.onend?.() }
}

beforeEach(() => {
  localStorage.clear()
  mockRow = null
  upsertCalls = []
  ultimaInstanciaRec = null
  vi.useFakeTimers({ shouldAdvanceTime: true })
  window.SpeechRecognition = FakeSpeechRecognition
})

afterEach(() => {
  vi.useRealTimers()
  delete window.SpeechRecognition
})

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

  it('quando o reconhecimento termina sozinho (comportamento do Safari), reinicia automaticamente', async () => {
    render(<AnotacaoPessoal itemId="1" session={sessaoFake} namespace="entrada" theme={temaFake} />)
    await waitFor(() => expect(screen.getByText('Adicionar anotação')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Adicionar anotação'))

    fireEvent.click(screen.getByText('Ditar'))
    expect(ultimaInstanciaRec.startCallCount).toBe(1)
    expect(screen.getByText('Parar ditado')).toBeInTheDocument()

    // Simula o Safari cortando sozinho por silêncio, sem a pessoa ter clicado em parar
    await act(async () => { ultimaInstanciaRec.onend() })
    await act(async () => { vi.advanceTimersByTime(300) })

    expect(ultimaInstanciaRec.startCallCount).toBe(2) // reiniciou sozinho
    expect(screen.getByText('Parar ditado')).toBeInTheDocument() // continua "gravando" pro usuário
  })

  it('clicar em "Parar ditado" não reinicia o reconhecimento', async () => {
    render(<AnotacaoPessoal itemId="1" session={sessaoFake} namespace="entrada" theme={temaFake} />)
    await waitFor(() => expect(screen.getByText('Adicionar anotação')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Adicionar anotação'))

    fireEvent.click(screen.getByText('Ditar'))
    fireEvent.click(screen.getByText('Parar ditado')) // chama rec.stop(), que já dispara onend no mock

    await act(async () => { vi.advanceTimersByTime(300) })

    expect(ultimaInstanciaRec.startCallCount).toBe(1) // não reiniciou
    expect(screen.getByText('Ditar')).toBeInTheDocument() // voltou ao estado parado
  })
})
