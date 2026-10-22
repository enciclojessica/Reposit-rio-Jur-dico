// Decide quais números de artigo estão revogados, a partir das linhas de
// `legislacao` (uma por dispositivo). Um artigo só conta como revogado quando
// o próprio artigo (caput) não está vigente, ou, se o banco não tem a linha do
// caput, quando nenhum dispositivo dele está vigente. Um inciso ou parágrafo
// revogado dentro de artigo vigente (ex.: CP art. 121, § 2º, VI) não torna o
// artigo revogado.
export function artigosRevogados(linhas) {
  const porNumero = new Map()
  for (const l of linhas || []) {
    if (!porNumero.has(l.numero)) porNumero.set(l.numero, [])
    porNumero.get(l.numero).push(l)
  }
  const revogados = []
  for (const [numero, rows] of porNumero) {
    const caputs = rows.filter(r => !r.titulo && !r.paragrafo && !r.inciso)
    const base = caputs.length ? caputs : rows
    if (base.every(r => r.vigente === false)) revogados.push(numero)
  }
  return revogados
}
