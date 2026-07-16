import { describe, it, expect } from 'vitest'
import { AREAS, TIPOS, ROLE_COR, ROLE_LABEL } from '../shared'

describe('AREAS', () => {
  it('cada área tem cor e ícone', () => {
    for (const [area, meta] of Object.entries(AREAS)) {
      expect(meta.color, `área "${area}" sem cor`).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(meta.icon, `área "${area}" sem ícone`).toBeTruthy()
    }
  })
})

describe('TIPOS', () => {
  it('contém os quatro tipos de entrada esperados', () => {
    expect(TIPOS).toEqual(['jurisprudência', 'doutrina', 'súmula', 'lei'])
  })
})

describe('ROLE_COR / ROLE_LABEL', () => {
  it('têm exatamente os mesmos papéis (admin, editor, leitor)', () => {
    expect(Object.keys(ROLE_COR).sort()).toEqual(Object.keys(ROLE_LABEL).sort())
  })

  it('cada papel tem cor válida e rótulo não vazio', () => {
    for (const role of Object.keys(ROLE_COR)) {
      expect(ROLE_COR[role]).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(ROLE_LABEL[role]?.trim().length).toBeGreaterThan(0)
    }
  })
})
