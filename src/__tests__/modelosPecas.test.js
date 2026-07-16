import { describe, it, expect } from 'vitest'
import { MODELOS_PECAS, CATEGORIAS_MODELO } from '../data/modelosPecas'

describe('MODELOS_PECAS', () => {
  it('tem ids únicos', () => {
    const ids = MODELOS_PECAS.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cada modelo pertence a uma categoria válida', () => {
    for (const m of MODELOS_PECAS) {
      expect(CATEGORIAS_MODELO, `modelo "${m.id}" com categoria "${m.categoria}" inválida`).toContain(m.categoria)
    }
  })

  it('cada modelo tem título, descrição e conteúdo preenchidos', () => {
    for (const m of MODELOS_PECAS) {
      expect(m.titulo?.trim().length, `modelo "${m.id}" sem título`).toBeGreaterThan(0)
      expect(m.descricao?.trim().length, `modelo "${m.id}" sem descrição`).toBeGreaterThan(0)
      expect(m.conteudo?.trim().length, `modelo "${m.id}" sem conteúdo`).toBeGreaterThan(50)
    }
  })

  it('não há menos de uma categoria representada', () => {
    const categoriasUsadas = new Set(MODELOS_PECAS.map(m => m.categoria))
    expect(categoriasUsadas.size).toBeGreaterThan(0)
  })
})
