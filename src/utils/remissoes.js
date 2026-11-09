import { detectarCodigoNoTexto } from '../data/legislacaoNomes'

// Remissões dentro do texto da lei: "art. 5º", "artigo 121-A", "art. 100 da Constituição Federal".
// Cada uma vira um trecho clicável que abre o artigo citado. Regras (nada é afirmado sem pista no texto):
// - "desta Lei", "deste Código" (e parecidos) logo depois: o mesmo código do artigo aberto;
// - nome de um código da base logo depois ("do Código Penal", "da CF"): esse código;
// - "da Lei nº ...", "do Decreto-Lei nº ...", "da Medida Provisória nº ...": norma que a base pode não ter, sem link;
// - sem nada disso: o mesmo código (é como a lei remete aos próprios artigos).
// O rótulo do próprio dispositivo ("Art. 3º ..." no começo do texto) e a remissão ao próprio artigo não viram link.
// Em lista ("arts. 5º e 6º") só o primeiro número vira link.

const REGEX_REMISSAO = /\bart(?:igo)?s?\.?\s*(\d{1,3}(?:\.\d{3})*)[º°]?(?:\s*-\s*([A-Z])(?![A-Za-zÀ-ÿ]))?/gi
const JANELA = 70
const MESMA_NORMA = /\b(?:dest[ae]|nest[ae])\s+(?:lei|c[oó]digo|constitui|consolida|decreto|estatuto|ato)/i
const OUTRA_NORMA = /\b(?:lei(?:\s+complementar)?|decreto(?:-lei)?|medida\s+provis[oó]ria|emenda\s+constitucional)\s*n[ºo°.]/i

// undefined = sem pista; null = outra norma (sem link)
function pistaDaRemissao(resto, codigoAtual) {
  if (MESMA_NORMA.test(resto)) return codigoAtual
  const citado = detectarCodigoNoTexto(resto)
  if (citado) return citado
  if (OUTRA_NORMA.test(resto)) return null
  return undefined
}

// Ligação curta entre duas remissões de uma lista ("e do caput do", ", ", " ou "): sem ponto, ponto e vírgula ou parêntese.
const LIGACAO_DE_LISTA = /^[^.;()]{0,40}$/

/**
 * @param {string} texto texto do dispositivo
 * @param {{ codigo: string, numero: number, letra?: string|null }} atual artigo aberto
 * @returns {Array<{ texto: string } | { texto: string, codigo: string, numero: number, letra: string|null }>}
 */
export function trechosComRemissoes(texto, atual) {
  if (!texto) return []
  const achados = []
  for (const m of texto.matchAll(REGEX_REMISSAO)) {
    // rótulo do próprio dispositivo ("Art. 3º Fica ...")
    if (m.index === 0 && /^Art/.test(m[0])) continue
    achados.push({ inicio: m.index, fim: m.index + m[0].length, bruto: m[0], numero: Number.parseInt(m[1].replace(/\./g, ''), 10), letra: m[2] ? m[2].toUpperCase() : null })
  }
  achados.forEach((a, i) => {
    const limite = i + 1 < achados.length ? Math.min(achados[i + 1].inicio, a.fim + JANELA) : a.fim + JANELA
    a.pista = pistaDaRemissao(texto.slice(a.fim, limite), atual.codigo)
  })
  // Numa lista ("art. 198 e do caput do art. 212, da Constituição Federal"), o artigo sem pista herda a lei do seguinte.
  for (let i = achados.length - 1; i >= 0; i -= 1) {
    const a = achados[i]
    if (a.pista !== undefined) { a.codigo = a.pista; continue }
    const seguinte = achados[i + 1]
    a.codigo = seguinte && LIGACAO_DE_LISTA.test(texto.slice(a.fim, seguinte.inicio)) ? seguinte.codigo : atual.codigo
  }

  const trechos = []
  let posicao = 0
  for (const a of achados) {
    if (!a.codigo) continue
    if (a.codigo === atual.codigo && a.numero === atual.numero && a.letra === (atual.letra ?? null)) continue
    if (a.inicio > posicao) trechos.push({ texto: texto.slice(posicao, a.inicio) })
    trechos.push({ texto: a.bruto, codigo: a.codigo, numero: a.numero, letra: a.letra })
    posicao = a.fim
  }
  if (posicao < texto.length) trechos.push({ texto: texto.slice(posicao) })
  return trechos
}

/** Letra do artigo pelo título ("Art. 7-A" -> "A"); sem letra, null. */
export function letraDoTitulo(titulo) {
  return titulo?.match(/^Art\.\s*[\d.]+\s*[º°]?\s*-\s*([A-Z])\b/)?.[1] ?? null
}
