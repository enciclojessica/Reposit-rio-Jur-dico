import { describe, expect, it } from 'vitest'
import { compararRedacoes, redacaoAtual } from '../utils/diffRedacao'

const juntar = (trechos, tipos) => trechos.filter(t => tipos.includes(t.tipo)).map(t => t.texto).join('')

describe('comparação de redações', () => {
  it('CF art. 7º, XV (EC 141): mostra o que entrou', () => {
    const antes = 'XV - repouso semanal remunerado, preferencialmente aos domingos;'
    const depois = 'XV - repouso semanal remunerado de 2 (dois) dias, um dos quais preferencialmente aos domingos;'
    const trechos = compararRedacoes(antes, depois)
    // a vírgula vem presa à palavra: "remunerado," sai e "remunerado de 2 (dois) dias, um dos quais" entra
    expect(trechos.filter(t => t.tipo === 'incluido').map(t => t.texto.trim())).toEqual(['remunerado de 2 (dois) dias, um dos quais'])
    expect(trechos.filter(t => t.tipo === 'removido').map(t => t.texto.trim())).toEqual(['remunerado,'])
    expect(juntar(trechos, ['igual', 'removido'])).toBe(antes)
    expect(juntar(trechos, ['igual', 'incluido'])).toBe(depois)
  })

  it('CF art. 7º, XIII: troca de 44 por 40 horas', () => {
    const antes = 'XIII - duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação'
    const depois = 'XIII - duração do trabalho normal não superior a 8 (oito) horas diárias e 40 (quarenta) horas semanais, facultada a compensação'
    const trechos = compararRedacoes(antes, depois)
    expect(juntar(trechos, ['igual', 'removido'])).toBe(antes)
    expect(juntar(trechos, ['igual', 'incluido'])).toBe(depois)
    expect(trechos.filter(t => t.tipo === 'removido').map(t => t.texto).join('')).toContain('quatro')
    expect(trechos.filter(t => t.tipo === 'incluido').map(t => t.texto).join('')).toContain('40 (quarenta)')
  })

  it('textos iguais não marcam nada', () => {
    expect(compararRedacoes('Art. 1º Texto.', 'Art. 1º Texto.')).toEqual([{ tipo: 'igual', texto: 'Art. 1º Texto.' }])
  })

  it('acha a redação atual pelo parágrafo e inciso', () => {
    const itens = [{ paragrafo: null, inciso: null, texto: 'caput' }, { paragrafo: null, inciso: 'XV', texto: 'novo XV' }]
    expect(redacaoAtual({ paragrafo: null, inciso: 'XV' }, itens)).toBe('novo XV')
    expect(redacaoAtual({ paragrafo: 'único', inciso: null }, itens)).toBeNull()
  })
})
