import { describe, it, expect } from 'vitest'
import { similaridadeTemas, encontrarPossiveisDuplicatas, diferenciarTemaSeNecessario } from '../utils/duplicatas'

describe('similaridadeTemas', () => {
  it('tema idêntico tem similaridade 1', () => {
    const t = 'Homicídio qualificado — conceito de "meio cruel" (art. 121, §2º, III, CP)'
    expect(similaridadeTemas(t, t)).toBe(1)
  })

  it('temas totalmente diferentes têm similaridade 0', () => {
    expect(similaridadeTemas('Alimentos entre companheiros', 'Prisão preventiva e fundamentação')).toBe(0)
  })

  it('não falso-positiva em precedentes diferentes sobre o mesmo tema (caso real do acervo)', () => {
    const score = similaridadeTemas(
      'STJ REsp 1.955.890/SP — Responsabilidade objetiva do fornecedor',
      'STJ REsp 2.077.278/SP — Responsabilidade objetiva do fornecedor'
    )
    expect(score).toBeLessThan(0.6)
  })

  it('detecta paráfrase próxima como similaridade alta (caso real do acervo)', () => {
    const score = similaridadeTemas(
      'Ônus da prova do fato constitutivo do direito do autor',
      'Ônus da prova, incumbência da prova do fato constitutivo ao autor'
    )
    expect(score).toBeGreaterThanOrEqual(0.6)
  })
})

describe('encontrarPossiveisDuplicatas', () => {
  const acervo = [
    { id: '1', area: 'Penal', tema: 'Homicídio qualificado — conceito de "meio cruel" (art. 121, §2º, III, CP)' },
    { id: '2', area: 'Penal', tema: 'Homicídio qualificado — exclusão da qualificadora do meio cruel por ausência de sofrimento inútil' },
    { id: '3', area: 'Cível', tema: 'STJ REsp 1.955.890/SP — Responsabilidade objetiva do fornecedor' },
    { id: '4', area: 'Cível', tema: 'STJ REsp 2.077.278/SP — Responsabilidade objetiva do fornecedor' },
  ]

  it('encontra duplicata exata, exclui a própria entrada em edição', () => {
    const tema = 'Homicídio qualificado — conceito de "meio cruel" (art. 121, §2º, III, CP)'
    const r = encontrarPossiveisDuplicatas(tema, acervo, '1')
    expect(r).toEqual([])
  })

  it('detecta duplicata ao criar uma entrada nova (sem id pra excluir)', () => {
    const tema = 'Homicídio qualificado — conceito de "meio cruel" (art. 121, §2º, III, CP)'
    const r = encontrarPossiveisDuplicatas(tema, acervo, null)
    expect(r.length).toBeGreaterThan(0)
    expect(r[0].entrada.id).toBe('1')
  })

  it('não sinaliza precedentes STJ diferentes como duplicata', () => {
    const tema = 'STJ REsp 2.222.059/SP — Responsabilidade objetiva do fornecedor'
    const r = encontrarPossiveisDuplicatas(tema, acervo, null)
    expect(r).toEqual([])
  })

  it('não roda pra tema muito curto', () => {
    expect(encontrarPossiveisDuplicatas('Dano', acervo, null)).toEqual([])
  })

  it('lida com acervo vazio ou tema vazio', () => {
    expect(encontrarPossiveisDuplicatas('', acervo, null)).toEqual([])
    expect(encontrarPossiveisDuplicatas('Tema qualquer bem específico', [], null)).toEqual([])
  })
})

describe('diferenciarTemaSeNecessario', () => {
  const acervoDoutrina = [
    { id: '1', tipo: 'doutrina', fonte: 'E. Magalhães Noronha', tema: 'Homicídio qualificado — conceito de "meio cruel"' },
    { id: '2', tipo: 'doutrina', fonte: 'Cleber Masson', tema: 'Homicídio qualificado — conceito de "meio cruel"' },
  ]

  it('acrescenta o sobrenome do autor quando dois doutrinadores diferentes têm o mesmo tema exato (caso real do acervo)', () => {
    const r = diferenciarTemaSeNecessario(
      'Homicídio qualificado — conceito de "meio cruel"',
      'Cezar Roberto Bitencourt', 'doutrina', acervoDoutrina, null
    )
    expect(r).toBe('Homicídio qualificado — conceito de "meio cruel" (Bitencourt)')
  })

  it('não altera quando o tema é diferente', () => {
    const r = diferenciarTemaSeNecessario('Legítima defesa, requisitos', 'Bitencourt', 'doutrina', acervoDoutrina, null)
    expect(r).toBe('Legítima defesa, requisitos')
  })

  it('não altera quando é a própria entrada em edição, sem outra colisão real', () => {
    const soAPropria = [{ id: '1', tipo: 'doutrina', fonte: 'E. Magalhães Noronha', tema: 'Homicídio qualificado — conceito de "meio cruel"' }]
    const r = diferenciarTemaSeNecessario(
      'Homicídio qualificado — conceito de "meio cruel"',
      'E. Magalhães Noronha', 'doutrina', soAPropria, '1'
    )
    expect(r).toBe('Homicídio qualificado — conceito de "meio cruel"')
  })

  it('não altera quando o tema já menciona o autor', () => {
    const r = diferenciarTemaSeNecessario(
      'Homicídio qualificado — conceito de "meio cruel" segundo Bitencourt',
      'Cezar Roberto Bitencourt', 'doutrina', acervoDoutrina, null
    )
    expect(r).toBe('Homicídio qualificado — conceito de "meio cruel" segundo Bitencourt')
  })

  it('não roda pra jurisprudência (já se diferencia pelo número do processo)', () => {
    const acervoJuris = [{ id: '1', tipo: 'jurisprudencia', fonte: 'STJ', tema: 'Mesmo tema' }]
    const r = diferenciarTemaSeNecessario('Mesmo tema', 'STF', 'jurisprudencia', acervoJuris, null)
    expect(r).toBe('Mesmo tema')
  })

  it('lida com tema ou fonte vazios sem quebrar', () => {
    expect(diferenciarTemaSeNecessario('', 'Bitencourt', 'doutrina', acervoDoutrina, null)).toBe('')
    expect(diferenciarTemaSeNecessario('Tema', '', 'doutrina', acervoDoutrina, null)).toBe('Tema')
  })
})
