import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseEmenda, compararComBanco, montarOperacoes } from '../utils/parserAtualizacao'

const ler = (n) => readFileSync(join(process.cwd(), 'src/__tests__/fixtures', `ec${n}.txt`), 'utf8')
const chave = (d) => `${d.numero}|${d.titulo ?? ''}|${d.paragrafo ?? ''}|${d.inciso ?? ''}`

describe('parseEmenda, EC 141 (art. 7º)', () => {
  const { dispositivos } = parseEmenda(ler(141))
  it('lê só os dispositivos com texto e ignora as reticências', () => {
    expect(dispositivos.map(chave)).toEqual(['7|||XIII', '7|||XV', '7||2|', '7||3|'])
  })
  it('mantém o texto do inciso XIII e retira a marca (Vigência) do XV', () => {
    const xiii = dispositivos.find(d => d.inciso === 'XIII')
    expect(xiii.texto).toBe('XIII - duração do trabalho normal não superior a 8 (oito) horas diárias e 40 (quarenta) horas semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho;')
    const xv = dispositivos.find(d => d.inciso === 'XV')
    expect(xv.texto).toBe('XV - repouso semanal remunerado de 2 (dois) dias, um dos quais preferencialmente aos domingos;')
    expect(xv.vigenciaDiferida).toBe(true)
  })
  it('não carrega os artigos transitórios da emenda (fora dos blocos entre aspas)', () => {
    expect(dispositivos.some(d => /Justiça do Trabalho/.test(d.texto))).toBe(false)
  })
})

describe('parseEmenda, EC 140 (arts. 40, 198 e 201)', () => {
  const { dispositivos } = parseEmenda(ler(140))
  it('lê os 3 artigos e a convenção de parágrafo com letra e § 10', () => {
    expect(dispositivos.map(chave)).toEqual([
      '40||4|', '40||5-A|', '198|||IV', '198||4-A|', '198||4-B|', '198||10|', '201||8-A|',
    ])
    expect(dispositivos.find(d => d.paragrafo === '5-A').texto.startsWith('§ 5º-A O requisito de idade')).toBe(true)
    expect(dispositivos.find(d => d.paragrafo === '10').texto.startsWith('§ 10. Os agentes comunitários')).toBe(true)
  })
})

describe('parseEmenda, EC 137 (alínea sob inciso sob parágrafo)', () => {
  const { dispositivos } = parseEmenda(ler(137))
  it('lê a alínea e como inciso III-e do § 6º do art. 155', () => {
    expect(dispositivos).toHaveLength(1)
    expect(chave(dispositivos[0])).toBe('155||6|III-e')
    expect(dispositivos[0].texto.startsWith('e) veículos terrestres de passageiros')).toBe(true)
  })
})

describe('compararComBanco', () => {
  const banco = [
    { id: 'a', numero: 7, titulo: null, inciso: 'XIII', paragrafo: null, texto: 'XIII - duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação;', vigente: true },
    { id: 'b', numero: 7, titulo: null, inciso: null, paragrafo: 'único', texto: 'Parágrafo único. São assegurados à categoria dos trabalhadores domésticos...', vigente: true },
    { id: 'c', numero: 198, titulo: null, inciso: 'III', paragrafo: null, texto: 'III - participação da comunidade.', vigente: true },
  ]
  it('classifica alterar, inserir e igual, e avisa renumeração de parágrafo único', () => {
    const { dispositivos } = parseEmenda(ler(141))
    const { itens } = compararComBanco(dispositivos, banco)
    expect(itens.find(i => i.inciso === 'XIII').status).toBe('alterar')
    expect(itens.find(i => i.inciso === 'XV').status).toBe('inserir')
    expect(itens.find(i => i.paragrafo === '2').status).toBe('inserir')
  })
  it('avisa pontuação encadeada quando o inciso novo vem após um que termina em ponto', () => {
    const { dispositivos } = parseEmenda(ler(140))
    const { itens } = compararComBanco(dispositivos.filter(d => d.numero === 198), banco)
    const iv = itens.find(i => i.inciso === 'IV')
    expect(iv.status).toBe('inserir')
    expect(iv.avisos.join(' ')).toMatch(/ponto final/)
  })
  it('marca igual quando o texto já é o mesmo (EC 137)', () => {
    const { dispositivos } = parseEmenda(ler(137))
    const d = dispositivos[0]
    const { itens } = compararComBanco(dispositivos, [{ id: 'z', numero: 155, titulo: null, inciso: 'III-e', paragrafo: '6', texto: d.texto, vigente: true }])
    expect(itens[0].status).toBe('igual')
  })
  it('monta operações só para o que foi selecionado', () => {
    const { dispositivos } = parseEmenda(ler(141))
    const { itens } = compararComBanco(dispositivos, banco)
    const ops = montarOperacoes(itens)
    expect(ops.filter(o => o.op === 'update')).toHaveLength(1)
    expect(ops.filter(o => o.op === 'insert')).toHaveLength(3)
    expect(ops[0].esperado).toBe(banco[0].texto)
    expect(montarOperacoes(itens, { selecionados: new Set() })).toEqual([])
  })
})
