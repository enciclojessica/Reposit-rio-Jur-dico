import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock encadeável do client do Supabase: from().select().eq().eq() resolve
// pro valor configurado em mockData para o teste atual.
let mockData = []
vi.mock('../supabase', () => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    then: (resolve) => resolve({ data: mockData, error: null }),
  }
  return { supabase: { from: () => chain } }
})

const { coletarAnotacoes } = await import('../utils/exportarAnotacoes')

beforeEach(() => { mockData = [] })

describe('coletarAnotacoes', () => {
  it('retorna lista vazia sem userId, sem consultar o banco', async () => {
    const r = await coletarAnotacoes(null)
    expect(r.entradaIds).toEqual([])
  })

  it('coleta anotações retornadas pela consulta', async () => {
    mockData = [{ item_id: 'abc', texto: 'nota sobre a entrada' }]
    const r = await coletarAnotacoes('user-1')
    expect(r.entradaIds).toEqual(['abc'])
    expect(r.notas['abc']).toBe('nota sobre a entrada')
  })

  it('ignora anotações vazias ou só com espaços', async () => {
    mockData = [
      { item_id: 'vazia', texto: '' },
      { item_id: 'espacos', texto: '   ' },
    ]
    const r = await coletarAnotacoes('user-1')
    expect(r.entradaIds).toEqual([])
  })

  it('lida com múltiplas anotações', async () => {
    mockData = [
      { item_id: '1', texto: 'a' },
      { item_id: '2', texto: 'b' },
    ]
    const r = await coletarAnotacoes('user-1')
    expect(r.entradaIds.sort()).toEqual(['1', '2'])
  })
})
