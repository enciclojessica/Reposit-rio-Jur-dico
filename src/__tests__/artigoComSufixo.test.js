import { describe, it, expect } from 'vitest'

// As mesmas regex usadas em EditorPecas.jsx (handleSlashInput e
// handleArtigoNatural) para artigos que compartilham o `numero`-base com
// outros na tabela `legislacao` (ex.: 1.358-A a 1.358-U do CC, 54-A a
// 54-G do CDC, 359-A a 359-U do CP) e só se distinguem pelo `titulo`.
// Reproduzidas aqui como funções puras para testar sem montar o editor.

function comandoBarra(arg) {
  const valido = /^\d+(-?[a-zA-Z](?:-[a-zA-Z])?)?$/.test(arg)
  if (!valido) return null
  return arg.replace(/^(\d+)-?([a-zA-Z].*)?$/, (_, n, s) => (s ? `${n}-${s}` : n))
}

function autocompletar(janela) {
  const m = janela.match(/\bart(?:igo)?s?\.?\s*(\d{1,4})\s*(-\s*[a-zA-Z](?:\s*-\s*[a-zA-Z])?)?\s*º?\s*$/i)
  if (!m) return null
  const sufixo = m[2] ? m[2].replace(/\s+/g, '').replace(/^-/, '') : null
  return m[1] + (sufixo ? '-' + sufixo : '')
}

describe('comando de barra (/cc 1358-d)', () => {
  it('mantém número simples sem sufixo', () => {
    expect(comandoBarra('300')).toBe('300')
  })
  it('normaliza sufixo com ou sem hífen', () => {
    expect(comandoBarra('1358-d')).toBe('1358-d')
    expect(comandoBarra('1358d')).toBe('1358-d')
  })
  it('preserva sufixo duplo (359-M-A do CP)', () => {
    expect(comandoBarra('359-m-a')).toBe('359-m-a')
  })
  it('rejeita entrada inválida', () => {
    expect(comandoBarra('abc')).toBeNull()
    expect(comandoBarra('1358-')).toBeNull()
  })
})

describe('autocompletar de artigo no texto corrido', () => {
  it('captura só o número quando não há sufixo', () => {
    expect(autocompletar('conforme o art. 927')).toBe('927')
  })
  it('captura número e sufixo de letra', () => {
    expect(autocompletar('nos termos do art. 1358-D')).toBe('1358-D')
  })
  it('tolera espaço em volta do hífen', () => {
    expect(autocompletar('ver art.1358 - d')).toBe('1358-d')
  })
  it('preserva sufixo duplo com hífen interno', () => {
    expect(autocompletar('art. 359-M-A')).toBe('359-M-A')
  })
  it('não dispara com texto após o número', () => {
    expect(autocompletar('conforme o art. 927 do Código')).toBeNull()
  })
})
