import { describe, expect, it } from 'vitest'
import { artigosMaisAbertos, diaHaDias, entradasMaisAbertas } from '../utils/metricasUso'

const agora = new Date('2026-11-10T12:00:00Z').getTime()
const diasAtras = (n) => new Date(agora - n * 24 * 60 * 60 * 1000).toISOString()

describe('métricas de uso', () => {
  it('conta membros distintos por entrada na janela de 30 dias', () => {
    const entradas = [{ id: 'a', tema: 'Tema A' }, { id: 'b', tema: 'Tema B' }]
    const historico = [
      { user_id: 'u1', entrada_id: 'a', visto_em: diasAtras(1) },
      { user_id: 'u2', entrada_id: 'a', visto_em: diasAtras(2) },
      { user_id: 'u1', entrada_id: 'b', visto_em: diasAtras(3) },
      { user_id: 'u3', entrada_id: 'b', visto_em: diasAtras(40) },
      { user_id: 'u1', entrada_id: 'apagada', visto_em: diasAtras(1) },
    ]
    expect(entradasMaisAbertas(historico, entradas, { agora }).map(x => [x.entrada.id, x.membros])).toEqual([['a', 2], ['b', 1]])
  })

  it('soma as aberturas diárias de cada artigo, sem misturar o artigo com letra', () => {
    const linhas = [
      { codigo: 'cf', numero: 5, titulo: '', dia: '2026-11-09', aberturas: 3 },
      { codigo: 'cf', numero: 5, titulo: '', dia: '2026-11-10', aberturas: 2 },
      { codigo: 'cpp', numero: 3, titulo: 'Art. 3-A', dia: '2026-11-10', aberturas: 4 },
      { codigo: 'cpp', numero: 3, titulo: '', dia: '2026-11-10', aberturas: 1 },
    ]
    expect(artigosMaisAbertos(linhas)).toEqual([
      { codigo: 'cf', numero: 5, titulo: '', aberturas: 5 },
      { codigo: 'cpp', numero: 3, titulo: 'Art. 3-A', aberturas: 4 },
      { codigo: 'cpp', numero: 3, titulo: '', aberturas: 1 },
    ])
  })

  it('dia de 30 dias atrás', () => {
    expect(diaHaDias(30, new Date(2026, 10, 10))).toBe('2026-10-11')
  })
})
