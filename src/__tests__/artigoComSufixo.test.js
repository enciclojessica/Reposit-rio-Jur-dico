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

// As mesmas usadas no sitemap (api/legislacao.js), no link "Compartilhar"
// (Legislacao.jsx) e na leitura do link público (App.jsx / middleware.js).
function extrairSufixoDoTitulo(titulo) {
  return titulo?.match(/^Art\.\s*[\d.]+-(.+)$/)?.[1]
}
function parseArtigoDaUrl(raw) {
  const m = String(raw).match(/^(\d+)(?:-([a-zA-Z](?:-[a-zA-Z])?))?$/)
  if (!m) return null
  return { numero: m[1], sufixo: m[2] ? m[2].toUpperCase() : null }
}

describe('extrair sufixo do titulo para montar o link', () => {
  it('extrai sufixo simples', () => {
    expect(extrairSufixoDoTitulo('Art. 1358-D')).toBe('D')
  })
  it('extrai sufixo duplo', () => {
    expect(extrairSufixoDoTitulo('Art. 359-M-A')).toBe('M-A')
  })
  it('artigo sem sufixo não tem match', () => {
    expect(extrairSufixoDoTitulo('Art. 300')).toBeUndefined()
  })
  it('tolera titulo ausente', () => {
    expect(extrairSufixoDoTitulo(null)).toBeUndefined()
    expect(extrairSufixoDoTitulo(undefined)).toBeUndefined()
  })
})

describe('ler ?art= da URL pública (App.jsx / middleware.js)', () => {
  it('separa número e sufixo', () => {
    expect(parseArtigoDaUrl('1358-D')).toEqual({ numero: '1358', sufixo: 'D' })
  })
  it('sem sufixo, sufixo fica null', () => {
    expect(parseArtigoDaUrl('300')).toEqual({ numero: '300', sufixo: null })
  })
  it('normaliza minúsculas e sufixo duplo', () => {
    expect(parseArtigoDaUrl('359-m-a')).toEqual({ numero: '359', sufixo: 'M-A' })
  })
  it('entrada inválida não quebra', () => {
    expect(parseArtigoDaUrl('abc')).toBeNull()
  })
})

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
