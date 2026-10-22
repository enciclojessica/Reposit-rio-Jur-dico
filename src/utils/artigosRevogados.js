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

// Decide se o dispositivo citado (parágrafo, inciso, alínea) de um artigo está
// revogado. `dispositivo` segue a convenção de `legislacao`: paragrafo '1',
// '2-A' ou 'único'; inciso romano ('VI'), alínea sob inciso ('VI-a') ou letra
// de alínea direto sob caput ou parágrafo.
//
// Só conta como revogado quando há linha no banco para o dispositivo (ou para
// um ancestral dele: o inciso da alínea, o parágrafo do inciso) e todas essas
// linhas têm vigente = false. Sem linha correspondente, não afirma nada: o
// banco pode não ter o dispositivo, e inferir revogação sem a fonte é proibido.
// O caput do artigo é tratado por artigosRevogados, não aqui.
function normalizarParagrafo(valor) {
  if (valor === null || valor === undefined || valor === '') return null
  return String(valor).trim().toLowerCase()
}

function normalizarInciso(valor) {
  if (valor === null || valor === undefined || valor === '') return null
  const [a, b] = String(valor).trim().split('-')
  return b === undefined ? a : `${a.toUpperCase()}-${b.toLowerCase()}`
}

export function dispositivoRevogado(linhas, numero, dispositivo) {
  if (!dispositivo) return false
  const alvoP = normalizarParagrafo(dispositivo.paragrafo)
  const alvoI = normalizarInciso(dispositivo.inciso)
  if (alvoP === null && alvoI === null) return false

  const doArtigo = (linhas || []).filter(l => Number(l.numero) === numero && !l.titulo)

  const niveis = []
  if (alvoI !== null) niveis.push([alvoP, alvoI])
  if (alvoI !== null && alvoI.includes('-')) niveis.push([alvoP, alvoI.split('-')[0]])
  if (alvoP !== null) niveis.push([alvoP, null])

  return niveis.some(([p, i]) => {
    const rows = doArtigo.filter(r => normalizarParagrafo(r.paragrafo) === p && normalizarInciso(r.inciso) === i)
    return rows.length > 0 && rows.every(r => r.vigente === false)
  })
}
