// Listas de uso para o painel de métricas (admin).
// - Entradas: `historico_leitura` guarda uma linha por (membro, entrada) com a última vez que abriu; a contagem é de
//   membros distintos que abriram a entrada na janela, não de aberturas.
// - Artigos: `legislacao_aberturas` guarda o total de aberturas do modal por artigo e por dia, sem quem abriu.

const DIA_MS = 24 * 60 * 60 * 1000

/** Entradas abertas por mais membros nos últimos `dias` dias: [{ entrada, membros }], até `limite`. */
export function entradasMaisAbertas(historico, entradas, { dias = 30, limite = 10, agora = Date.now() } = {}) {
  const porId = new Map((entradas || []).map(e => [e.id, e]))
  const membros = new Map()
  for (const h of historico || []) {
    if (agora - new Date(h.visto_em).getTime() >= dias * DIA_MS) continue
    if (!porId.has(h.entrada_id)) continue
    if (!membros.has(h.entrada_id)) membros.set(h.entrada_id, new Set())
    membros.get(h.entrada_id).add(h.user_id)
  }
  return [...membros.entries()]
    .map(([id, set]) => ({ entrada: porId.get(id), membros: set.size }))
    .sort((a, b) => b.membros - a.membros || String(a.entrada.tema || '').localeCompare(String(b.entrada.tema || ''), 'pt-BR'))
    .slice(0, limite)
}

/** Artigos mais abertos: soma as linhas diárias por (código, número, título): [{ codigo, numero, titulo, aberturas }]. */
export function artigosMaisAbertos(linhas, { limite = 10 } = {}) {
  const soma = new Map()
  for (const l of linhas || []) {
    const chave = `${l.codigo}|${l.numero}|${l.titulo || ''}`
    const atual = soma.get(chave) ?? { codigo: l.codigo, numero: l.numero, titulo: l.titulo || '', aberturas: 0 }
    atual.aberturas += l.aberturas
    soma.set(chave, atual)
  }
  return [...soma.values()]
    .sort((a, b) => b.aberturas - a.aberturas || a.codigo.localeCompare(b.codigo) || a.numero - b.numero)
    .slice(0, limite)
}

/** AAAA-MM-DD de `dias` dias atrás (para filtrar `legislacao_aberturas.dia`). */
export function diaHaDias(dias, agora = new Date()) {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - dias)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
