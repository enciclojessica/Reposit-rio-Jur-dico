// Revisão espaçada das anotações pessoais (tabela `anotacoes`, colunas `revisao_etapa`, `revisao_proxima`,
// `revisao_feita_em`; MIGRATION_revisao_anotacoes_20261110.sql).
// Regra: a anotação vence no dia seguinte ao da criação. "Lembrei" avança uma etapa e marca a próxima revisão
// para daqui a 3, 7, 15 e 30 dias; depois da quinta revisão certa ela fica dominada (sem próxima). "Revisar de novo"
// volta para a etapa 0, com revisão no dia seguinte. Datas no calendário local (AAAA-MM-DD).

export const INTERVALOS_REVISAO = [1, 3, 7, 15, 30]
export const ETAPA_DOMINADA = INTERVALOS_REVISAO.length

/** Dia local no formato AAAA-MM-DD. */
export function diaLocal(data = new Date()) {
  const d = data instanceof Date ? data : new Date(data)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** AAAA-MM-DD somado de `dias` dias. */
export function somarDias(dia, dias) {
  const [a, m, d] = dia.split('-').map(Number)
  return diaLocal(new Date(a, m - 1, d + dias))
}

/** Dia da próxima revisão (AAAA-MM-DD), ou null se dominada. */
export function proximaRevisao(nota) {
  if ((nota.revisao_etapa ?? 0) >= ETAPA_DOMINADA) return null
  if (nota.revisao_proxima) return String(nota.revisao_proxima).slice(0, 10)
  return somarDias(diaLocal(nota.criado_em ?? new Date()), INTERVALOS_REVISAO[0])
}

/** Anotações com texto que vencem até `hoje`, da mais atrasada para a mais recente. */
export function anotacoesParaRevisar(notas, hoje = diaLocal()) {
  return (notas || [])
    .filter(n => (n.texto || '').trim())
    .map(n => ({ nota: n, vence: proximaRevisao(n) }))
    .filter(x => x.vence && x.vence <= hoje)
    .sort((a, b) => a.vence.localeCompare(b.vence) || String(a.nota.id).localeCompare(String(b.nota.id)))
}

/** Campos a gravar depois da revisão. `lembrou` = acertou sem reler. */
export function registrarRevisao(nota, lembrou, agora = new Date()) {
  const hoje = diaLocal(agora)
  const feita = agora.toISOString()
  if (!lembrou) return { revisao_etapa: 0, revisao_proxima: somarDias(hoje, INTERVALOS_REVISAO[0]), revisao_feita_em: feita }
  const etapa = Math.min((nota.revisao_etapa ?? 0) + 1, ETAPA_DOMINADA)
  const proxima = etapa >= ETAPA_DOMINADA ? null : somarDias(hoje, INTERVALOS_REVISAO[etapa])
  return { revisao_etapa: etapa, revisao_proxima: proxima, revisao_feita_em: feita }
}
