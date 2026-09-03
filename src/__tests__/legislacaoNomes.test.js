import { describe, it, expect } from 'vitest'
import { NOME_CODIGO, detectarCodigoNoTexto, extrairReferenciasLegais } from '../data/legislacaoNomes'

describe('NOME_CODIGO', () => {
  it('tem um nome completo para cada código usado no editor', () => {
    for (const codigo of ['cc', 'cdc', 'cf', 'cpc', 'cpp', 'ctb', 'lei9099']) {
      expect(NOME_CODIGO[codigo]?.trim().length, `sem nome para "${codigo}"`).toBeGreaterThan(0)
    }
  })
})

describe('detectarCodigoNoTexto', () => {
  it('reconhece "Código Civil" e a sigla "CC"', () => {
    expect(detectarCodigoNoTexto('conforme dispõe o Código Civil, art.')).toBe('cc')
    expect(detectarCodigoNoTexto('nos termos do art. 927 do CC')).toBe('cc')
  })

  it('reconhece Código de Processo Civil / CPC', () => {
    expect(detectarCodigoNoTexto('artigo 300 do Código de Processo Civil')).toBe('cpc')
    expect(detectarCodigoNoTexto('art. 300, CPC,')).toBe('cpc')
  })

  it('reconhece Constituição Federal / CF', () => {
    expect(detectarCodigoNoTexto('art. 5º da Constituição Federal')).toBe('cf')
  })

  it('reconhece Lei 9.099 e "juizados especiais"', () => {
    expect(detectarCodigoNoTexto('nos termos da Lei 9.099/95')).toBe('lei9099')
    expect(detectarCodigoNoTexto('rito dos juizados especiais')).toBe('lei9099')
  })

  it('retorna null quando nenhum diploma é mencionado', () => {
    expect(detectarCodigoNoTexto('o autor sustenta que houve dano moral')).toBe(null)
  })
})

describe('extrairReferenciasLegais', () => {
  it('encontra artigo com código depois da menção', () => {
    const refs = extrairReferenciasLegais('violação ao art. 5º, LVII, da Constituição Federal')
    expect(refs).toEqual([{ codigo: 'cf', numero: 5, matchTexto: 'art. 5º', start: expect.any(Number), end: expect.any(Number) }])
  })

  it('encontra artigo com código antes da menção', () => {
    const refs = extrairReferenciasLegais('nos termos do CDC, art. 6º, inciso VIII')
    expect(refs.length).toBe(1)
    expect(refs[0].codigo).toBe('cdc')
    expect(refs[0].numero).toBe(6)
  })

  it('não retorna referência quando não identifica o diploma por perto', () => {
    const refs = extrairReferenciasLegais('conforme art. 300, sem mais contexto que ajude')
    expect(refs).toEqual([])
  })

  it('encontra múltiplas referências no mesmo texto, cada uma com seu diploma', () => {
    const texto = 'combinação do art. 927 do Código Civil com o art. 6º do Código de Defesa do Consumidor'
    const refs = extrairReferenciasLegais(texto)
    expect(refs.map(r => [r.codigo, r.numero])).toEqual([['cc', 927], ['cdc', 6]])
  })

  it('retorna lista vazia para texto vazio ou nulo', () => {
    expect(extrairReferenciasLegais('')).toEqual([])
    expect(extrairReferenciasLegais(null)).toEqual([])
  })
})
