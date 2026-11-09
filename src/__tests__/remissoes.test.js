import { describe, expect, it } from 'vitest'
import { letraDoTitulo, trechosComRemissoes } from '../utils/remissoes'

const links = (texto, atual) => trechosComRemissoes(texto, atual).filter(t => t.codigo).map(t => [t.texto, t.codigo, t.numero, t.letra])

describe('remissões no texto da lei', () => {
  it('remissão sem lei citada aponta para o próprio código', () => {
    expect(links('nos casos previstos no art. 37, XI, e no art. 5º-A', { codigo: 'cf', numero: 40 })).toEqual([
      ['art. 37', 'cf', 37, null],
      ['art. 5º-A', 'cf', 5, 'A'],
    ])
  })

  it('reconhece "desta Lei" e o nome de outro código', () => {
    expect(links('na forma do art. 9º desta Lei e do art. 121 do Código Penal', { codigo: 'lep', numero: 1 })).toEqual([
      ['art. 9º', 'lep', 9, null],
      ['art. 121', 'cp', 121, null],
    ])
    expect(links('observado o art. 100 da Constituição Federal', { codigo: 'adct', numero: 97 })).toEqual([['art. 100', 'cf', 100, null]])
  })

  it('em lista, o artigo sem lei herda a lei do seguinte (ADCT, art. 110, I)', () => {
    const texto = 'calculadas nos termos do inciso I do § 2º do art. 198 e do caput do art. 212, da Constituição Federal; e'
    expect(links(texto, { codigo: 'adct', numero: 110 })).toEqual([
      ['art. 198', 'cf', 198, null],
      ['art. 212', 'cf', 212, null],
    ])
    // separados por ponto e vírgula, não herda
    expect(links('art. 5º; ver art. 121 do Código Penal', { codigo: 'cpp', numero: 1 })).toEqual([
      ['art. 5º', 'cpp', 5, null],
      ['art. 121', 'cp', 121, null],
    ])
  })

  it('remissão com "deste Ato" e com "artigo" por extenso', () => {
    expect(links('incisos II, III e IV do caput do art. 107 deste Ato das Disposições', { codigo: 'adct', numero: 109 })).toEqual([['art. 107', 'adct', 107, null]])
    expect(links('menção dessa circunstância, para fins do disposto no § 2°, do artigo 84, desta Lei.', { codigo: 'lep', numero: 106 })).toEqual([['artigo 84', 'lep', 84, null]])
    expect(links('sobrevier ao condenado doença mental (artigo 52 do Código Penal).', { codigo: 'lep', numero: 167 })).toEqual([['artigo 52', 'cp', 52, null]])
  })

  it('norma fora da base não vira link', () => {
    expect(links('conforme o art. 2º da Lei nº 8.213, de 1991', { codigo: 'clt', numero: 3 })).toEqual([])
    expect(links('nos termos do art. 4º do Decreto-Lei nº 1.001', { codigo: 'cp', numero: 7 })).toEqual([])
  })

  it('não liga o rótulo do próprio dispositivo nem a remissão ao próprio artigo', () => {
    expect(links('Art. 3º Aplica-se o disposto no art. 3º e no art. 4º.', { codigo: 'cpc', numero: 3 })).toEqual([['art. 4º', 'cpc', 4, null]])
  })

  it('número com ponto de milhar e texto preservado na íntegra', () => {
    const texto = 'Aplica-se o art. 1.015 ao caso.'
    const trechos = trechosComRemissoes(texto, { codigo: 'cpc', numero: 1009 })
    expect(trechos.map(t => t.texto).join('')).toBe(texto)
    expect(trechos.find(t => t.codigo)).toMatchObject({ codigo: 'cpc', numero: 1015 })
  })

  it('lê a letra do título', () => {
    expect(letraDoTitulo('Art. 7-A')).toBe('A')
    expect(letraDoTitulo(null)).toBeNull()
  })
})
