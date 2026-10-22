import { describe, it, expect } from 'vitest'
import { POLITICA_PRIVACIDADE, TERMOS_DE_USO } from '../data/textosLegais'

describe('textos legais', () => {
  for (const doc of [POLITICA_PRIVACIDADE, TERMOS_DE_USO]) {
    it(`${doc.titulo}: seções numeradas em sequência e sem travessão`, () => {
      doc.secoes.forEach((sec, i) => {
        expect(sec.titulo.startsWith(`${i + 1}. `)).toBe(true)
        expect(sec.corpo).not.toMatch(/—/)
      })
    })
  }

  it('Política de Privacidade traz bases legais, transferência internacional, incidentes e canal da LGPD', () => {
    const texto = POLITICA_PRIVACIDADE.secoes.map(s => `${s.titulo}\n${s.corpo}`).join('\n')
    expect(texto).toMatch(/art\. 7º/)
    expect(texto).toMatch(/Transferência internacional/)
    expect(texto).toMatch(/art\. 33, IX/)
    expect(texto).toMatch(/art\. 48/)
    expect(texto).toMatch(/art\. 41/)
    expect(texto).toMatch(/art\. 18, § 1º/)
  })

  it('telefone aparece como opcional nos Termos e na Política', () => {
    expect(TERMOS_DE_USO.secoes[1].corpo).toMatch(/se desejar, telefone/)
    expect(POLITICA_PRIVACIDADE.secoes[1].corpo).toMatch(/de forma opcional, telefone/)
  })
})
