import { describe, it, expect } from 'vitest'
import { AREAS, TIPOS, ROLE_COR, ROLE_LABEL, corDaArea } from '../shared'

const temaFake = { muted: '#736b62', gold: '#800020' }

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

describe('corDaArea', () => {
  it('resolve a cor normalmente para uma área simples', () => {
    expect(corDaArea('Cível', temaFake)).toBe(AREAS['Cível'].color)
  })

  // Regressão: entradas importadas de pesquisa de jurisprudência salvam a
  // área como string composta (ex: "Cível / Consumidor / Bancário"), que
  // não bate com nenhuma chave de AREAS — antes disso caía num cinza sem
  // contraste. Ver: bug do badge "CÍVEL / DIREITO DO CONSUMIDOR" pálido.
  it('resolve pelo primeiro segmento quando a área é composta', () => {
    expect(corDaArea('Cível / Consumidor', temaFake)).toBe(AREAS['Cível'].color)
    expect(corDaArea('Cível / Consumidor / Bancário', temaFake)).toBe(AREAS['Cível'].color)
    expect(corDaArea('Constitucional / Cível', temaFake)).toBe(AREAS['Constitucional'].color)
  })

  it('nunca retorna a cor neutra de fallback (theme.muted) quando o primeiro segmento é válido', () => {
    expect(corDaArea('Cível / Direito do Consumidor', temaFake)).not.toBe(temaFake.muted)
  })

  it('usa o tema como fallback final quando não reconhece nenhum segmento', () => {
    expect(corDaArea('Área Totalmente Desconhecida', temaFake)).toBe(temaFake.gold)
  })

  it('lida com valor nulo/vazio sem lançar erro', () => {
    expect(corDaArea(null, temaFake)).toBe(temaFake.muted)
    expect(corDaArea('', temaFake)).toBe(temaFake.muted)
  })
})
