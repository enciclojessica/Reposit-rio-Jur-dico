// Repetição espaçada simplificada (3 botões: errei / difícil / sabia),
// no espírito do Anki mas com uma progressão fixa de intervalos em dias.
export const INTERVALOS_DIAS = [1, 2, 4, 7, 14, 30, 60, 120]

// Recebe o nível atual (0 = nunca revisado ou zerado) e o resultado da
// última revisão, devolve o novo nível e a data da próxima revisão.
export function calcularProximaRevisao(nivelAtual, resultado, agora = new Date()) {
  let novoNivel
  if (resultado === 'errei')        novoNivel = 0
  else if (resultado === 'dificil') novoNivel = Math.max(0, nivelAtual - 1)
  else /* 'facil' */                novoNivel = Math.min(INTERVALOS_DIAS.length - 1, nivelAtual + 1)

  const dias = INTERVALOS_DIAS[novoNivel]
  const data = new Date(agora)
  data.setDate(data.getDate() + dias)
  return { nivel: novoNivel, proximaRevisao: data.toISOString() }
}

// Um card está pendente de revisão se nunca foi revisado (sem registro) ou
// se a data de próxima revisão já passou.
export function estaPendente(registro, agora = new Date()) {
  if (!registro) return true
  return new Date(registro.proxima_revisao) <= agora
}
