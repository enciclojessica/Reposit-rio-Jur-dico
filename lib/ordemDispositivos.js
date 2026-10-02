// Ordena os dispositivos de um mesmo artigo (caput, incisos, parágrafos,
// alíneas) na ordem em que aparecem na lei.
//
// Existe porque: a tela ordenava incisos como texto (ordem alfabética), então
// "XIV" vinha antes de "XIX", que vinha antes de "XV"; e "IX" antes de "V".
// O numeral romano precisa ser convertido em número pra comparar.
//
// Convenção dos campos da tabela `legislacao` (igual em CC, CDC, CP, CPC, CF,
// ADCT, Estatuto da OAB e Código de Ética):
//   paragrafo  '1', '2-A', '10', 'único'  (ou nulo, quando o dispositivo é do caput)
//   inciso     'I', 'IX-A'                 inciso
//              'VIII-b', 'IX-A-a'          alínea de inciso (letra minúscula no fim)
// O caput é a linha sem paragrafo e sem inciso.

const VALOR_ROMANO = { I: 1, V: 5, X: 10, L: 50, C: 100 }

export function romanoParaNumero(s) {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const atual = VALOR_ROMANO[s[i]]
    const proximo = VALOR_ROMANO[s[i + 1]]
    total += proximo && proximo > atual ? -atual : atual
  }
  return total
}

// '2' -> 2 | '2-A' -> 2.01 | '10' -> 10 | 'único' -> 0.5 | vazio -> 0
export function chaveParagrafo(p) {
  if (p === null || p === undefined || p === '') return 0
  const texto = String(p).trim()
  if (/^[uú]nico$/i.test(texto)) return 0.5
  const m = texto.match(/^(\d+)(?:-([A-Z]))?$/)
  if (m) return Number(m[1]) + (m[2] ? (m[2].charCodeAt(0) - 64) / 100 : 0)
  const n = parseFloat(texto)
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n
}

// 'IX' -> [9,0,0] | 'IX-A' -> [9,1,0] | 'VIII-b' -> [8,0,2] | 'IX-A-a' -> [9,1,1]
export function chaveInciso(i) {
  if (i === null || i === undefined || i === '') return null
  const m = String(i).trim().match(/^([IVXLC]+)(?:-([A-Z]))?(?:-([a-z]))?$/)
  if (!m) return [Number.MAX_SAFE_INTEGER, 0, 0]
  return [
    romanoParaNumero(m[1]),
    m[2] ? m[2].charCodeAt(0) - 64 : 0,
    m[3] ? m[3].charCodeAt(0) - 96 : 0,
  ]
}

export function compararDispositivos(a, b) {
  const pa = chaveParagrafo(a.paragrafo)
  const pb = chaveParagrafo(b.paragrafo)
  if (pa !== pb) return pa - pb

  const ia = chaveInciso(a.inciso)
  const ib = chaveInciso(b.inciso)
  if (!ia && !ib) return 0
  if (!ia) return -1
  if (!ib) return 1
  for (let k = 0; k < 3; k++) {
    if (ia[k] !== ib[k]) return ia[k] - ib[k]
  }
  return 0
}

export function ordenarDispositivos(lista) {
  return [...lista].sort(compararDispositivos)
}
