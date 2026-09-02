import { describe, it, expect, beforeEach } from 'vitest'
import { coletarAnotacoesDoLocalStorage } from '../utils/exportarAnotacoes'

beforeEach(() => localStorage.clear())

describe('coletarAnotacoesDoLocalStorage', () => {
  it('retorna lista vazia quando não há nenhuma anotação', () => {
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds).toEqual([])
  })

  it('coleta anotações de entrada pelo namespace lexia_nota_entrada_', () => {
    localStorage.setItem('lexia_nota_entrada_abc', 'nota sobre a entrada')
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds).toEqual(['abc'])
    expect(r.notas['lexia_nota_entrada_abc']).toBe('nota sobre a entrada')
  })

  it('ignora anotações vazias (usuário abriu o campo mas não escreveu nada)', () => {
    localStorage.setItem('lexia_nota_entrada_vazia', '')
    localStorage.setItem('lexia_nota_entrada_espacos', '   ')
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds).toEqual([])
  })

  it('ignora chaves de localStorage que não são anotações (ex: filtros, preferências)', () => {
    localStorage.setItem('lexia_tema', 'dark')
    localStorage.setItem('lexia_ultimo_backup', '20/07/2026')
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds).toEqual([])
  })

  it('lida com múltiplas anotações de entrada', () => {
    localStorage.setItem('lexia_nota_entrada_1', 'a')
    localStorage.setItem('lexia_nota_entrada_2', 'b')
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds.sort()).toEqual(['1', '2'])
  })
})
