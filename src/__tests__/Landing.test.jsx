import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ThemeProvider } from '../theme'
import Landing from '../components/Landing'

vi.mock('../supabase', () => ({
  supabase: {
    rpc: () => Promise.resolve({ data: null, error: null }),
    from: () => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => Promise.resolve({ data: [], error: null }),
      }
      return chain
    },
  },
}))

beforeAll(() => {
  // jsdom não tem IntersectionObserver (usado na contagem dos números).
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} }
})

describe('Landing: seção Plataformas', () => {
  it('mostra as duas plataformas e linka o app de questões em nova aba', () => {
    render(<ThemeProvider><Landing onEntrar={() => {}} /></ThemeProvider>)
    const secao = document.getElementById('plataformas')
    expect(secao).not.toBeNull()
    expect(within(secao).getByText('Você está aqui')).toBeTruthy()
    expect(within(secao).getByText('Plataforma irmã')).toBeTruthy()

    const link = within(secao).getByRole('link', { name: /Conhecer o Themis Jur Questões/ })
    expect(link.getAttribute('href')).toBe('https://aprovaoab.vercel.app')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')

    expect(screen.getByRole('link', { name: 'Themis Jur Questões' }).getAttribute('href')).toBe('https://aprovaoab.vercel.app')
  })

  it('o botão do cartão atual abre o cadastro', () => {
    const onEntrar = vi.fn()
    render(<ThemeProvider><Landing onEntrar={onEntrar} /></ThemeProvider>)
    const secao = document.getElementById('plataformas')
    fireEvent.click(within(secao).getByRole('button', { name: /Solicitar acesso gratuito/ }))
    expect(onEntrar).toHaveBeenCalledWith('register')
  })

  it('textos da seção sem travessão', () => {
    render(<ThemeProvider><Landing onEntrar={() => {}} /></ThemeProvider>)
    expect(document.getElementById('plataformas').textContent).not.toMatch(/[—–]/)
  })
})
