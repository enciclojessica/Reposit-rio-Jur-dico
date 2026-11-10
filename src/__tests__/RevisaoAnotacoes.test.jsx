import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RevisaoAnotacoes from '../components/RevisaoAnotacoes'
import { temaFake } from './testUtils'

let mockNotas = []
let mockErroUpdate = null
let updates = []

vi.mock('../supabase', () => {
  const consulta = () => {
    const filtros = []
    const chain = {
      select: () => chain,
      eq: (col, val) => { filtros.push([col, val]); return chain },
      then: (resolve) => resolve({ data: mockNotas, error: null, filtros }),
      update: (campos) => {
        const upd = { campos, filtros: [] }
        updates.push(upd)
        const c2 = { eq: (col, val) => { upd.filtros.push([col, val]); return c2 }, then: (resolve) => resolve({ error: mockErroUpdate }) }
        return c2
      },
    }
    return chain
  }
  return { supabase: { from: () => consulta() } }
})

const sessao = { user: { id: 'u1' } }
const entradas = [{ id: 'e1', tema: 'Prisão preventiva: fundamentação concreta' }, { id: 'e2', tema: 'Outra tese' }]
const ontem = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d }

beforeEach(() => {
  mockErroUpdate = null
  updates = []
  mockNotas = [
    { id: 'n1', item_id: 'e1', texto: 'Gravidade abstrata não basta.', criado_em: ontem().toISOString(), revisao_etapa: 0, revisao_proxima: null },
    { id: 'n2', item_id: 'e2', texto: 'Ainda não vence.', criado_em: new Date().toISOString(), revisao_etapa: 0, revisao_proxima: null },
  ]
})

describe('RevisaoAnotacoes', () => {
  it('mostra o tema, esconde a anotação até a pessoa pedir e registra "Lembrei"', async () => {
    render(<RevisaoAnotacoes entradas={entradas} session={sessao} theme={temaFake} />)
    expect(await screen.findByText('Revisar anotações (1)')).toBeInTheDocument()
    expect(screen.getByText('Prisão preventiva: fundamentação concreta')).toBeInTheDocument()
    expect(screen.queryByText('Gravidade abstrata não basta.')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Mostrar minha anotação/ }))
    expect(screen.getByText('Gravidade abstrata não basta.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Lembrei/ }))
    await waitFor(() => expect(updates).toHaveLength(1))
    expect(updates[0].campos.revisao_etapa).toBe(1)
    expect(updates[0].filtros).toEqual([['id', 'n1'], ['user_id', 'u1']])
    expect(await screen.findByRole('status')).toHaveTextContent('Próxima revisão em')
    expect(screen.getByText(/Revisões de hoje concluídas \(1\)/)).toBeInTheDocument()
  })

  it('mostra o erro quando a gravação falha e mantém a anotação na fila', async () => {
    mockErroUpdate = { message: 'falhou' }
    render(<RevisaoAnotacoes entradas={entradas} session={sessao} theme={temaFake} />)
    fireEvent.click(await screen.findByRole('button', { name: /Mostrar minha anotação/ }))
    fireEvent.click(screen.getByRole('button', { name: /Revisar de novo/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível registrar a revisão')
    expect(screen.getByText('Revisar anotações (1)')).toBeInTheDocument()
  })

  it('sem anotação vencida, não aparece', async () => {
    mockNotas = [mockNotas[1]]
    const { container } = render(<RevisaoAnotacoes entradas={entradas} session={sessao} theme={temaFake} />)
    await waitFor(() => expect(container.textContent).toBe(''))
  })
})
