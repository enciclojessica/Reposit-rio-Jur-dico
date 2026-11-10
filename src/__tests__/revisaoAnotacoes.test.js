import { describe, expect, it } from 'vitest'
import { anotacoesParaRevisar, proximaRevisao, registrarRevisao, somarDias } from '../utils/revisaoAnotacoes'

const agora = new Date(2026, 10, 10, 15, 0, 0) // 10/11/2026, horário local

describe('revisão espaçada das anotações', () => {
  it('sem agenda, vence no dia seguinte ao da criação', () => {
    expect(proximaRevisao({ criado_em: new Date(2026, 10, 1, 9).toISOString(), revisao_etapa: 0 })).toBe('2026-11-02')
  })

  it('lista só as vencidas com texto, da mais atrasada para a mais recente', () => {
    const notas = [
      { id: 'a', texto: 'x', revisao_etapa: 1, revisao_proxima: '2026-11-10' },
      { id: 'b', texto: 'y', revisao_etapa: 2, revisao_proxima: '2026-11-05' },
      { id: 'c', texto: 'z', revisao_etapa: 1, revisao_proxima: '2026-11-11' },
      { id: 'd', texto: '   ', revisao_etapa: 0, revisao_proxima: '2026-11-01' },
      { id: 'e', texto: 'w', revisao_etapa: 5, revisao_proxima: null },
    ]
    expect(anotacoesParaRevisar(notas, '2026-11-10').map(x => x.nota.id)).toEqual(['b', 'a'])
  })

  it('"Lembrei" avança 3, 7, 15 e 30 dias e, na quinta, a anotação fica dominada', () => {
    let nota = { revisao_etapa: 0 }
    const proximas = []
    for (let i = 0; i < 5; i += 1) {
      nota = { ...nota, ...registrarRevisao(nota, true, agora) }
      proximas.push([nota.revisao_etapa, nota.revisao_proxima])
    }
    expect(proximas).toEqual([
      [1, '2026-11-13'], [2, '2026-11-17'], [3, '2026-11-25'], [4, '2026-12-10'], [5, null],
    ])
    expect(proximaRevisao(nota)).toBeNull()
  })

  it('"Revisar de novo" volta para o começo, com revisão amanhã', () => {
    expect(registrarRevisao({ revisao_etapa: 3 }, false, agora)).toMatchObject({ revisao_etapa: 0, revisao_proxima: '2026-11-11' })
  })

  it('soma dias atravessando mês e ano', () => {
    expect(somarDias('2026-12-30', 3)).toBe('2027-01-02')
  })
})
