// Filtra quais tags aparecem no card da lista — sem apagar nada do dado
// salvo, só reduz poluição visual. As tags continuam existindo de verdade
// para filtro/busca; isso só afeta o que é renderizado no card.

// Tags de origem/metadado interno — úteis pra filtrar, não pra mostrar
// toda vez que a entrada aparece na lista.
const TAGS_ORIGEM_OCULTAS = ['pesquisa-juri', 'extraído-de-peça', 'auto-importado', 'informativo']

// Siglas de código/diploma legal — classificação estrutural, não conteúdo
// que ajuda a reconhecer a entrada de relance na lista.
const CODIGOS_OCULTOS = ['cc', 'cpc', 'cdc', 'cf', 'cpp', 'cp', 'ctb', 'clt', 'ctn', 'lei9099']

export function tagsVisiveis(entry) {
  const tags = entry?.tags || []
  if (!tags.length) return []

  const tipo = (entry.tipo || '').toLowerCase().trim()
  const contexto = `${entry.tema || ''} ${entry.fonte || ''} ${entry.tribunal || ''} ${entry.referencia || ''}`.toLowerCase()

  return tags.filter(t => {
    const tl = (t || '').toLowerCase().trim()
    if (!tl) return false
    if (TAGS_ORIGEM_OCULTAS.includes(tl)) return false          // metadado de origem
    if (CODIGOS_OCULTOS.includes(tl)) return false               // sigla de código/diploma
    if (/^lei\s*n?[ºo°]?\s*\d/.test(tl)) return false            // "lei 10.826", "lei nº 9.099" etc.
    if (tl === tipo) return false                                 // duplica o badge de tipo
    if (contexto.includes(tl)) return false                       // já aparece no texto visível do card
    return true
  })
}
