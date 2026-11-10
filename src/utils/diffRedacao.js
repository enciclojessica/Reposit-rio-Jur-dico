// Compara duas redações de um dispositivo palavra a palavra (maior subsequência comum) e devolve os trechos na ordem
// do texto: { tipo: 'igual' | 'removido' | 'incluido', texto }. Espaços ficam presos à palavra anterior, então juntar
// os trechos 'igual' + 'removido' devolve a redação anterior, e 'igual' + 'incluido' devolve a atual.

const TOKEN = /\S+\s*/g

function tokens(texto) {
  const lista = String(texto || '').match(TOKEN) || []
  const inicio = String(texto || '').match(/^\s*/)[0]
  if (inicio && lista.length) lista[0] = inicio + lista[0]
  return lista
}

const normal = (t) => t.trim()

/** Trechos com o que saiu e o que entrou. Textos muito longos (mais de 2.000 palavras cada) voltam inteiros, sem diff. */
export function compararRedacoes(anterior, atual) {
  const a = tokens(anterior)
  const b = tokens(atual)
  if (a.length > 2000 || b.length > 2000) {
    return [{ tipo: 'removido', texto: String(anterior || '') }, { tipo: 'incluido', texto: String(atual || '') }].filter(t => t.texto)
  }
  // tabela da maior subsequência comum, de trás para a frente
  const n = a.length
  const m = b.length
  const lcs = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      lcs[i][j] = normal(a[i]) === normal(b[j]) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }
  const trechos = []
  const empurrar = (tipo, texto) => {
    const ultimo = trechos[trechos.length - 1]
    if (ultimo && ultimo.tipo === tipo) ultimo.texto += texto
    else trechos.push({ tipo, texto })
  }
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (normal(a[i]) === normal(b[j])) { empurrar('igual', b[j]); i += 1; j += 1 }
    else if (lcs[i + 1][j] >= lcs[i][j + 1]) { empurrar('removido', a[i]); i += 1 }
    else { empurrar('incluido', b[j]); j += 1 }
  }
  while (i < n) { empurrar('removido', a[i]); i += 1 }
  while (j < m) { empurrar('incluido', b[j]); j += 1 }
  return trechos
}

/** A redação atual do mesmo dispositivo (mesmo parágrafo e inciso) entre as linhas do artigo; sem ela, null. */
export function redacaoAtual(alteracao, itens) {
  const item = (itens || []).find(i => (i.paragrafo ?? null) === (alteracao.paragrafo ?? null) && (i.inciso ?? null) === (alteracao.inciso ?? null))
  return item ? item.texto : null
}
