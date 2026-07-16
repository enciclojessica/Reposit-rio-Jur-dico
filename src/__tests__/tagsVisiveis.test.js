import { describe, it, expect } from 'vitest'
import { tagsVisiveis } from '../utils/tagsVisiveis'

describe('tagsVisiveis', () => {
  it('esconde tags de origem/metadado interno', () => {
    const entry = { tipo: 'lei', tema: 'Algo qualquer', tags: ['pesquisa-juri', 'extraído-de-peça', 'auto-importado'] }
    expect(tagsVisiveis(entry)).toEqual([])
  })

  it('esconde tag que duplica o tipo', () => {
    const entry = { tipo: 'jurisprudência', tema: 'Responsabilidade objetiva', tags: ['jurisprudência'] }
    expect(tagsVisiveis(entry)).toEqual([])
  })

  it('esconde tag cujo texto já aparece no tema/fonte/tribunal', () => {
    const entry = { tipo: 'jurisprudência', tema: 'STJ REsp 2.077.278/SP — Responsabilidade objetiva', tags: ['stj'] }
    expect(tagsVisiveis(entry)).toEqual([])
  })

  it('mantém o exemplo real do card (todas as 3 tags somem, sobra nada)', () => {
    const entry = {
      tipo: 'jurisprudência',
      tema: 'STJ REsp 2.077.278/SP — Responsabilidade objetiva do fornecedor',
      tags: ['jurisprudência', 'stj', 'pesquisa-juri'],
    }
    expect(tagsVisiveis(entry)).toEqual([])
  })

  it('mantém tags realmente informativas, não redundantes', () => {
    const entry = { tipo: 'lei', tema: 'Ônus da prova', tags: ['repetitivo', 'tema-controvertido'] }
    expect(tagsVisiveis(entry)).toEqual(['repetitivo', 'tema-controvertido'])
  })

  it('lida com entrada sem tags', () => {
    expect(tagsVisiveis({ tipo: 'lei', tema: 'x', tags: [] })).toEqual([])
    expect(tagsVisiveis({ tipo: 'lei', tema: 'x' })).toEqual([])
  })

  it('esconde siglas de código/diploma (cpc, cpp, cf, cp, cc, cdc, ctb, lei9099)', () => {
    const entry = { tipo: 'doutrina', tema: 'Crime impossível: ineficácia absoluta do meio', tags: ['cp'] }
    expect(tagsVisiveis(entry)).toEqual([])
  })

  it('esconde padrão "lei NNNN" mesmo com pontuação/nº', () => {
    const casos = ['lei 10.826', 'lei nº 9.099', 'lei n° 8.078', 'Lei 13.105']
    for (const tag of casos) {
      expect(tagsVisiveis({ tipo: 'doutrina', tema: 'x', tags: [tag] }), `falhou para "${tag}"`).toEqual([])
    }
  })

  it('exemplo real: card de doutrina penal some com todas as tags de código', () => {
    const entry = {
      tipo: 'doutrina',
      tema: 'Crimes de perigo abstrato: consumação pela mera conduta sem necessidade de resultado naturalístico',
      tags: ['cp', 'lei 10.826'],
    }
    expect(tagsVisiveis(entry)).toEqual([])
  })
})
