import { describe, it, expect } from 'vitest'
import { normalizarDominio } from './dominios'

describe('normalizarDominio', () => {
  it('aceita domínio puro e normaliza a caixa', () => {
    expect(normalizarDominio('unisantos.br')).toBe('unisantos.br')
    expect(normalizarDominio('  UniSantos.BR ')).toBe('unisantos.br')
  })

  it('extrai o domínio de arroba, e-mail e URL', () => {
    expect(normalizarDominio('@unisantos.br')).toBe('unisantos.br')
    expect(normalizarDominio('fulana@unisantos.br')).toBe('unisantos.br')
    expect(normalizarDominio('https://unisantos.br/')).toBe('unisantos.br')
  })

  it('mantém subdomínio como domínio distinto', () => {
    expect(normalizarDominio('alunos.unisantos.br')).toBe('alunos.unisantos.br')
  })

  it('rejeita o que não é domínio', () => {
    expect(normalizarDominio('')).toBeNull()
    expect(normalizarDominio('unisantos')).toBeNull()
    expect(normalizarDominio('uni santos.br')).toBeNull()
    expect(normalizarDominio('-x.br')).toBeNull()
    expect(normalizarDominio(null)).toBeNull()
  })
})
