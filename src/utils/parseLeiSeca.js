// Extrai menções a código + intervalo de artigos do texto livre do tópico
// do cronograma (ex: "CC/02 arts. 1–78: pessoas naturais... arts. 79–103: bens").
// Só reconhece os códigos que existem na tabela `legislacao` — CP, CLT, CTN e
// leis avulsas não têm banco próprio ainda, então são ignorados (sem inventar).

const MAPA_CODIGO = {
  CC:  'cc',
  CPC: 'cpc',
  CDC: 'cdc',
  CF:  'cf',
  CPP: 'cpp',
  CTB: 'ctb',
}

const REGEX_CODIGO = /\b(CC|CPC|CDC|CF|CPP|CTB)(?:\/\d{2,4})?\b/g

// Extrai todos os pares "arts. N–M" (ou "art. N") de um trecho de texto
function extrairIntervalos(trecho) {
  const intervalos = []
  const re = /art(?:igo)?s?\.?\s*([\d.]+)(?:\s*[–\-—a]\s*([\d.]+))?/gi
  let m
  while ((m = re.exec(trecho))) {
    const min = parseInt(m[1].replace(/\./g, ''), 10)
    const max = m[2] ? parseInt(m[2].replace(/\./g, ''), 10) : min
    if (!isNaN(min) && !isNaN(max) && max >= min) intervalos.push([min, max])
  }
  return intervalos
}

// Retorna array de { codigo, min, max } encontrados no texto do tópico.
export function parseLeiSeca(topico) {
  if (!topico) return []
  const marcas = [...topico.matchAll(REGEX_CODIGO)]
  if (!marcas.length) return []

  const resultado = []
  for (let i = 0; i < marcas.length; i++) {
    const atual = marcas[i]
    const codigoSigla = atual[1]
    const codigo = MAPA_CODIGO[codigoSigla]
    if (!codigo) continue // CP, CLT, CTN etc. — sem banco próprio ainda

    const inicioTrecho = atual.index + atual[0].length
    const fimTrecho = i + 1 < marcas.length ? marcas[i + 1].index : topico.length
    const trecho = topico.slice(inicioTrecho, fimTrecho)

    for (const [min, max] of extrairIntervalos(trecho)) {
      resultado.push({ codigo, min, max })
    }
  }
  return resultado
}
