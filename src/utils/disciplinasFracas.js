// Identifica disciplinas com desempenho fraco a partir do array de stats
// já calculado em PainelStats ({ disc, total, acertos, pct }). Só considera
// disciplinas com respostas suficientes para o percentual ser confiável
// (evita apontar "0% de acerto" com base numa única questão respondida).
export function disciplinasFracas(stats, { minRespostas = 3, maxPct = 65, limite = 3 } = {}) {
  return stats
    .filter(s => s.total >= minRespostas && s.pct < maxPct)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limite)
}
