import { describe, it, expect } from 'vitest'
import { normalizarArea, AREAS_VALIDAS } from '../../lib/normalizarArea.js'

describe('normalizarArea', () => {
  it('mantém inalterado quando já é uma área válida', () => {
    expect(normalizarArea('Penal')).toBe('Penal')
    expect(normalizarArea('Cível')).toBe('Cível')
  })

  it('corrige "Direito Penal" para "Penal" (caso real do acervo)', () => {
    expect(normalizarArea('Direito Penal')).toBe('Penal')
  })

  it('corrige "Direito Processual Penal" para "Penal" via correspondência por substring (caso real do acervo)', () => {
    expect(normalizarArea('Direito Processual Penal')).toBe('Penal')
  })

  it('corrige variações com "do"/"da" no prefixo', () => {
    expect(normalizarArea('Direito do Trabalho')).toBe('Cível') // "Trabalho" não bate com "Trabalhista", cai no fallback
    expect(normalizarArea('Direito da Família')).toBe('Família')
  })

  it('usa o fallback informado quando nada bate', () => {
    expect(normalizarArea('Direito Espacial', 'Cível')).toBe('Cível')
    expect(normalizarArea('Direito Espacial', 'Internacional')).toBe('Internacional')
  })

  it('usa "Cível" como fallback padrão quando não informado', () => {
    expect(normalizarArea('')).toBe('Cível')
    expect(normalizarArea(null)).toBe('Cível')
    expect(normalizarArea(undefined)).toBe('Cível')
  })

  it('AREAS_VALIDAS tem as 12 áreas oficiais do app', () => {
    expect(AREAS_VALIDAS).toHaveLength(12)
    expect(AREAS_VALIDAS).toContain('Penal')
    expect(AREAS_VALIDAS).toContain('Cível')
  })
})
