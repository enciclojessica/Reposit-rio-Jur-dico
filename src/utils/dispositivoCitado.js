import { extrairReferenciasLegais } from '../data/legislacaoNomes'

// Lê o dispositivo citado logo depois de "art. N" numa tese: parágrafo, inciso
// e alínea. O resultado usa a mesma convenção da tabela `legislacao`:
//   paragrafo: '1', '2-A' ou 'único' (null quando a citação não traz parágrafo)
//   inciso:    numeral romano em maiúsculas ('VI'); alínea sob inciso como
//              'VI-a'; alínea direto sob caput ou parágrafo como a própria letra
//
// Regra de segurança: só devolve algo quando a citação é inequívoca. Citações
// plurais ou em intervalo ("§§ 1º e 2º", "incisos I a III", "§ 1º ao 3º") e
// artigos com letra ("art. 121-A") devolvem null, porque apontar um dispositivo
// que a tese não cita geraria alerta de revogação falso.

const ROMANO = /^(?=[IVXL])(?:XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/
const JANELA = 80

const LETRA = 'A-Za-zÀ-ÿ'
const SEM_LETRA_DEPOIS = `(?![${LETRA}])`

export function lerDispositivoCitado(segmento) {
  if (!segmento) return null
  let resto = segmento.replace(/^\s*,?\s*/, '')

  // "art. 121-A": o número do artigo tem sufixo, a leitura por dispositivo não se aplica.
  if (new RegExp(`^-\\s*[${LETRA}]`).test(resto)) return null
  // "§§ 1º e 2º": plural.
  if (/^§\s*§/.test(resto)) return null

  let paragrafo = null
  let inciso = null

  const mp = resto.match(new RegExp(
    `^(?:§|par[áa]grafo)\\s*(?:(\\d+)[º°]?(?:-([A-Za-z])(?![${LETRA}]))?|([úu]nico))`, 'i'
  ))
  if (mp) {
    paragrafo = mp[3] ? 'único' : (mp[2] ? `${mp[1]}-${mp[2].toUpperCase()}` : mp[1])
    resto = resto.slice(mp[0].length)
    // "§ 1º e 2º", "§ 1º, 2º", "§ 1º a 3º": mais de um parágrafo.
    if (/^\s*(?:,\s*|\s+(?:e|a|ao|ou)\s+)(?:§\s*)?\d/.test(resto)) return null
    resto = resto.replace(/^\s*,?\s*/, '')
  }

  const mi = resto.match(new RegExp(`^(?:[Ii]nciso\\s+)?([IVXL]+)(?![${LETRA}]|-[${LETRA}])`))
  if (mi && ROMANO.test(mi[1])) {
    inciso = mi[1]
    resto = resto.slice(mi[0].length)
    // "I e II", "I, II", "I a III": mais de um inciso.
    if (new RegExp(`^\\s*(?:,\\s*|\\s+(?:e|a|ao|ou)\\s+)[IVXL]+${SEM_LETRA_DEPOIS}`).test(resto)) return null
  }

  const ma = resto.match(new RegExp(`^\\s*,?\\s*[Aa]l[íi]nea\\s+["“'‘]?([a-z])["”'’)]?${SEM_LETRA_DEPOIS}`))
  if (ma) inciso = inciso ? `${inciso}-${ma[1]}` : ma[1]

  if (paragrafo === null && inciso === null) return null
  return { paragrafo, inciso }
}

// Mesmas referências de extrairReferenciasLegais, cada uma com o campo
// `dispositivo` ({ paragrafo, inciso } ou null). A leitura para no início da
// próxima referência, para não atribuir a uma citação o dispositivo de outra.
export function extrairReferenciasComDispositivo(texto) {
  const refs = extrairReferenciasLegais(texto)
  return refs.map((ref, i) => {
    const proximo = i + 1 < refs.length ? refs[i + 1].start : texto.length
    const fim = Math.min(proximo, ref.end + JANELA)
    return { ...ref, dispositivo: lerDispositivoCitado(texto.slice(ref.end, fim)) }
  })
}

export function chaveArtigo(codigo, numero) {
  return `${codigo}|${numero}`
}

export function chaveDispositivo(codigo, numero, dispositivo) {
  return `${codigo}|${numero}|${dispositivo?.paragrafo ?? ''}|${dispositivo?.inciso ?? ''}`
}

export function descreverDispositivo(dispositivo) {
  if (!dispositivo) return ''
  const partes = []
  if (dispositivo.paragrafo === 'único') partes.push('parágrafo único')
  else if (dispositivo.paragrafo) partes.push(`§ ${dispositivo.paragrafo.replace(/^(\d+)/, '$1º')}`)
  if (dispositivo.inciso) {
    const [romanoOuLetra, letra] = dispositivo.inciso.split('-')
    if (letra) partes.push(`inciso ${romanoOuLetra}, alínea ${letra}`)
    else if (ROMANO.test(romanoOuLetra)) partes.push(`inciso ${romanoOuLetra}`)
    else partes.push(`alínea ${romanoOuLetra}`)
  }
  return partes.join(', ')
}
