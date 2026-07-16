import { describe, it, expect } from 'vitest'
import { disciplinasFracas } from '../utils/disciplinasFracas'

const base = [
  { disc: 'Direito Civil', total: 10, acertos: 3, pct: 30 },
  { disc: 'Direito Penal', total: 8, acertos: 7, pct: 88 },
  { disc: 'Direito Constitucional', total: 5, acertos: 2, pct: 40 },
  { disc: 'Ética Profissional', total: 2, acertos: 0, pct: 0 }, // poucas respostas
  { disc: 'Direito Tributário', total: 6, acertos: 3, pct: 50 },
]

describe('disciplinasFracas', () => {
  it('ignora disciplinas com poucas respostas mesmo com pct baixo', () => {
    const r = disciplinasFracas(base)
    expect(r.find(d => d.disc === 'Ética Profissional')).toBeUndefined()
  })

  it('ignora disciplinas com bom desempenho', () => {
    const r = disciplinasFracas(base)
    expect(r.find(d => d.disc === 'Direito Penal')).toBeUndefined()
  })

  it('ordena da pior pra melhor e respeita o limite', () => {
    const r = disciplinasFracas(base, { limite: 2 })
    expect(r.map(d => d.disc)).toEqual(['Direito Civil', 'Direito Constitucional'])
  })

  it('retorna vazio quando não há disciplinas fracas', () => {
    const todasBoas = base.map(s => ({ ...s, pct: 90 }))
    expect(disciplinasFracas(todasBoas)).toEqual([])
  })
})
