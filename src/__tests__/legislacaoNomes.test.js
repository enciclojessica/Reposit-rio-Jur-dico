import { describe, it, expect } from 'vitest'
import { NOME_CODIGO, detectarCodigoNoTexto } from '../data/legislacaoNomes'

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
