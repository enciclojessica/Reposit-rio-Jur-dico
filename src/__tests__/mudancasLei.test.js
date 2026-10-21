import { describe, it, expect } from 'vitest'
import { agruparMudancasLei } from '../components/Alertas'

const corte = '2026-10-14T00:00:00Z'
const l = (id, extra = {}) => ({ id, codigo: 'cf', numero: 7, titulo: null, inciso: null, paragrafo: null, texto: `t${id}`, vigente: true, criado_em: '2026-10-01T00:00:00Z', atualizado_em: '2026-10-21T15:00:00Z', ...extra })

describe('agruparMudancasLei', () => {
  it('agrupa por artigo e classifica Alterado, Novo e Atualizado', () => {
    const linhas = [l('a'), l('b', { criado_em: '2026-10-21T15:00:00Z' }), l('c'), l('d', { numero: 40 })]
    const hist = [{ legislacao_id: 'a', lei_alteradora: 'EC 141/2026' }]
    const { artigos, lotes } = agruparMudancasLei(linhas, hist, corte)
    expect(lotes).toEqual([])
    const art7 = artigos.find(a => a.numero === 7)
    expect(art7.norma).toBe('EC 141/2026')
    expect(art7.itens.map(i => i.status)).toEqual(['Alterado', 'Novo', 'Atualizado'])
    expect(artigos).toHaveLength(2)
  })
  it('resume em uma linha o código com carga em lote (mais de 80 linhas)', () => {
    const lote = Array.from({ length: 81 }, (_, i) => l(`x${i}`, { codigo: 'lep', numero: i }))
    const { artigos, lotes } = agruparMudancasLei([...lote, l('z')], [], corte)
    expect(lotes).toEqual([{ codigo: 'lep', total: 81, quando: '2026-10-21T15:00:00Z' }])
    expect(artigos.every(a => a.codigo === 'cf')).toBe(true)
  })
})
