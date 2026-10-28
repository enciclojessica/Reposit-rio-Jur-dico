import { describe, it, expect } from 'vitest'
import { PASSOS_DESKTOP, PASSOS_MOBILE } from '../data/passosTour'
import sidebar from '../components/Sidebar.jsx?raw'
import mobileNav from '../components/MobileNav.jsx?raw'

const todos = [...PASSOS_DESKTOP, ...PASSOS_MOBILE]

describe('passos do tour de boas-vindas', () => {
  it('cada passo tem alvo, título e texto', () => {
    for (const p of todos) {
      expect(p.alvo).toBeTruthy()
      expect(p.titulo).toBeTruthy()
      expect(p.texto.length).toBeGreaterThan(20)
    }
  })

  it('não usa travessão nem fala em plano ou recurso pago (a IA não está disponível aos usuários)', () => {
    for (const p of todos) {
      expect(`${p.titulo} ${p.texto}`).not.toMatch(/[—–]/)
      expect(`${p.titulo} ${p.texto}`).not.toMatch(/\b(pago|paga|pagos|pagas|plano pago|versão paga)\b/i)
    }
  })

  it('os passos de IA dizem que o recurso não está disponível', () => {
    const ia = todos.filter(p => /IA/.test(p.titulo) || p.alvo === 'juri')
    expect(ia.length).toBeGreaterThan(0)
    for (const p of ia) expect(p.texto).toMatch(/não (está|estão) disponíve/)
  })

  it('os alvos do desktop existem no Sidebar (data-tour) e os do celular no MobileNav', () => {
    for (const p of PASSOS_DESKTOP) {
      expect(sidebar.includes(`id="${p.alvo}"`) || sidebar.includes(`data-tour="${p.alvo}"`)).toBe(true)
    }
    for (const p of PASSOS_MOBILE) {
      const id = p.alvo.replace(/^m_/, '')
      const noMobile = mobileNav.includes(`data-tour="${p.alvo}"`) || mobileNav.includes('data-tour={`m_${item.v}`}')
      expect(noMobile).toBe(true)
      expect(id.length).toBeGreaterThan(0)
    }
  })

  it('só o passo de "Nova entrada" é restrito a editor', () => {
    const restritos = todos.filter(p => p.apenasEditor).map(p => p.alvo)
    expect(restritos.sort()).toEqual(['add', 'm_add'])
  })
})
