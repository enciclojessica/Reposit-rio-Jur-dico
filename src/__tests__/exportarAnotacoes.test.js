import { describe, it, expect, beforeEach } from 'vitest'
import { coletarAnotacoesDoLocalStorage } from '../utils/exportarAnotacoes'

beforeEach(() => localStorage.clear())

describe('coletarAnotacoesDoLocalStorage', () => {
  it('retorna listas vazias quando não há nenhuma anotação', () => {
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds).toEqual([])
    expect(r.questaoIds).toEqual([])
  })

  it('separa anotações de entrada e de questão pelos respectivos namespaces', () => {
    localStorage.setItem('lexia_nota_entrada_abc', 'nota sobre a entrada')
    localStorage.setItem('lexia_nota_questao_123', 'nota sobre a questão')
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds).toEqual(['abc'])
    expect(r.questaoIds).toEqual(['123'])
    expect(r.notas['lexia_nota_entrada_abc']).toBe('nota sobre a entrada')
    expect(r.notas['lexia_nota_questao_123']).toBe('nota sobre a questão')
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
    expect(r.questaoIds).toEqual([])
  })

  it('lida com múltiplas anotações de cada tipo', () => {
    localStorage.setItem('lexia_nota_entrada_1', 'a')
    localStorage.setItem('lexia_nota_entrada_2', 'b')
    localStorage.setItem('lexia_nota_questao_9', 'c')
    const r = coletarAnotacoesDoLocalStorage()
    expect(r.entradaIds.sort()).toEqual(['1', '2'])
    expect(r.questaoIds).toEqual(['9'])
  })
})
