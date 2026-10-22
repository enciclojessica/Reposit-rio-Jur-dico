import { describe, it, expect } from 'vitest'
import {
  lerDispositivoCitado,
  extrairReferenciasComDispositivo,
  chaveArtigo,
  chaveDispositivo,
  descreverDispositivo,
} from '../utils/dispositivoCitado'

describe('lerDispositivoCitado', () => {
  it('lê parágrafo e inciso', () => {
    expect(lerDispositivoCitado(', § 2º, VI, do CP')).toEqual({ paragrafo: '2', inciso: 'VI' })
  })

  it('lê a palavra "inciso" antes do numeral', () => {
    expect(lerDispositivoCitado(', § 2º, inciso VI, do Código Penal')).toEqual({ paragrafo: '2', inciso: 'VI' })
    expect(lerDispositivoCitado(', Inciso VI')).toEqual({ paragrafo: null, inciso: 'VI' })
  })

  it('lê inciso do caput, sem parágrafo', () => {
    expect(lerDispositivoCitado(', LVII, da Constituição Federal')).toEqual({ paragrafo: null, inciso: 'LVII' })
    expect(lerDispositivoCitado(', XL')).toEqual({ paragrafo: null, inciso: 'XL' })
    expect(lerDispositivoCitado(', XLVII')).toEqual({ paragrafo: null, inciso: 'XLVII' })
    expect(lerDispositivoCitado(', I, do CP')).toEqual({ paragrafo: null, inciso: 'I' })
  })

  it('lê parágrafo único e parágrafo com letra', () => {
    expect(lerDispositivoCitado(', parágrafo único, do Código Civil')).toEqual({ paragrafo: 'único', inciso: null })
    expect(lerDispositivoCitado(', § 2º-A')).toEqual({ paragrafo: '2-A', inciso: null })
    expect(lerDispositivoCitado(' § 1º')).toEqual({ paragrafo: '1', inciso: null })
  })

  it('não confunde parágrafo seguido de hífen com espaço com sufixo de letra', () => {
    expect(lerDispositivoCitado(', § 1º - Os direitos')).toEqual({ paragrafo: '1', inciso: null })
  })

  it('lê alínea com a convenção do banco', () => {
    expect(lerDispositivoCitado(', § 1º, III, alínea a')).toEqual({ paragrafo: '1', inciso: 'III-a' })
    expect(lerDispositivoCitado(', § 1º, alínea b')).toEqual({ paragrafo: '1', inciso: 'b' })
  })

  it('devolve null para citação plural ou em intervalo', () => {
    expect(lerDispositivoCitado(', §§ 1º e 2º')).toBeNull()
    expect(lerDispositivoCitado(', § 1º e 2º')).toBeNull()
    expect(lerDispositivoCitado(', § 1º a 3º')).toBeNull()
    expect(lerDispositivoCitado(', § 1º, 2º')).toBeNull()
    expect(lerDispositivoCitado(', I e II')).toBeNull()
    expect(lerDispositivoCitado(', I, II e III')).toBeNull()
    expect(lerDispositivoCitado(', I a III')).toBeNull()
    expect(lerDispositivoCitado(', incisos I a III')).toBeNull()
  })

  it('devolve null para artigo com letra', () => {
    expect(lerDispositivoCitado('-A, § 1º')).toBeNull()
  })

  it('devolve null quando não há dispositivo, ou só o caput', () => {
    expect(lerDispositivoCitado('')).toBeNull()
    expect(lerDispositivoCitado(null)).toBeNull()
    expect(lerDispositivoCitado(', caput')).toBeNull()
    expect(lerDispositivoCitado(' do Código Penal')).toBeNull()
  })

  it('não lê sigla de diploma como numeral romano (CC, CDC, CP, CPC)', () => {
    expect(lerDispositivoCitado(', CC')).toBeNull()
    expect(lerDispositivoCitado(' do CDC')).toBeNull()
    expect(lerDispositivoCitado(', CP')).toBeNull()
    expect(lerDispositivoCitado(', CPC')).toBeNull()
  })

  it('não lê numeral romano inválido', () => {
    expect(lerDispositivoCitado(', IIII')).toBeNull()
    expect(lerDispositivoCitado(', VV')).toBeNull()
  })
})

describe('extrairReferenciasComDispositivo', () => {
  it('anexa o dispositivo à referência', () => {
    const refs = extrairReferenciasComDispositivo('Art. 121, § 2º, VI, CP')
    expect(refs.map(r => [r.codigo, r.numero, r.dispositivo])).toEqual([
      ['cp', 121, { paragrafo: '2', inciso: 'VI' }],
    ])
  })

  it('mantém start, end e matchTexto da referência original', () => {
    const [ref] = extrairReferenciasComDispositivo('violação ao art. 5º, LVII, da Constituição Federal')
    expect(ref.matchTexto).toBe('art. 5º')
    expect(ref.dispositivo).toEqual({ paragrafo: null, inciso: 'LVII' })
    expect(typeof ref.start).toBe('number')
    expect(typeof ref.end).toBe('number')
  })

  it('cada citação recebe o próprio dispositivo, sem vazar para a vizinha', () => {
    const texto = 'art. 121, § 2º, VI, do Código Penal, e art. 129, § 1º, do Código Penal'
    const refs = extrairReferenciasComDispositivo(texto)
    expect(refs.map(r => [r.numero, r.dispositivo])).toEqual([
      [121, { paragrafo: '2', inciso: 'VI' }],
      [129, { paragrafo: '1', inciso: null }],
    ])
  })

  it('devolve dispositivo null quando a referência não traz parágrafo nem inciso', () => {
    const [ref] = extrairReferenciasComDispositivo('nos termos do art. 6º do CDC')
    expect(ref.dispositivo).toBeNull()
  })

  it('devolve lista vazia para texto vazio ou nulo', () => {
    expect(extrairReferenciasComDispositivo('')).toEqual([])
    expect(extrairReferenciasComDispositivo(null)).toEqual([])
  })
})

describe('chaves e descrição', () => {
  it('monta as chaves de artigo e de dispositivo', () => {
    expect(chaveArtigo('cp', 121)).toBe('cp|121')
    expect(chaveDispositivo('cp', 121, { paragrafo: '2', inciso: 'VI' })).toBe('cp|121|2|VI')
    expect(chaveDispositivo('cp', 121, { paragrafo: null, inciso: 'VI' })).toBe('cp|121||VI')
    expect(chaveDispositivo('cp', 121, { paragrafo: '2-A', inciso: null })).toBe('cp|121|2-A|')
  })

  it('descreve o dispositivo para o aviso', () => {
    expect(descreverDispositivo({ paragrafo: '2', inciso: 'VI' })).toBe('§ 2º, inciso VI')
    expect(descreverDispositivo({ paragrafo: '2-A', inciso: null })).toBe('§ 2º-A')
    expect(descreverDispositivo({ paragrafo: 'único', inciso: null })).toBe('parágrafo único')
    expect(descreverDispositivo({ paragrafo: null, inciso: 'III-a' })).toBe('inciso III, alínea a')
    expect(descreverDispositivo({ paragrafo: '1', inciso: 'b' })).toBe('§ 1º, alínea b')
    expect(descreverDispositivo(null)).toBe('')
  })
})
