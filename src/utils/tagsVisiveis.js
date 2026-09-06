// Filtra quais tags aparecem no card da lista — sem apagar nada do dado
// salvo, só reduz poluição visual. As tags continuam existindo de verdade
// para filtro/busca; isso só afeta o que é renderizado no card.

// Tags de origem/metadado interno — úteis pra filtrar, não pra mostrar
// toda vez que a entrada aparece na lista. 'jurisprudência' entra aqui
// também (não só via a checagem dinâmica contra o tipo): mesmo numa
// entrada de outro tipo, uma tag chamada 'jurisprudência' nunca ajuda
// a reconhecer do que a entrada trata.
export const TAGS_ORIGEM_OCULTAS = ['pesquisa-juri', 'extraído-de-peça', 'auto-importado', 'informativo', 'jurisprudência']

// Siglas de código/diploma legal — classificação estrutural, não conteúdo
// que ajuda a reconhecer a entrada de relance na lista.
export const CODIGOS_OCULTOS = ['cc', 'cpc', 'cdc', 'cf', 'cpp', 'cp', 'ctb', 'clt', 'ctn', 'lei9099']

// Tribunais — sigla de quem decidiu, não do que trata. Cobre as siglas
// conhecidas do acervo hoje, mais um padrão geral pra tribunais de
// justiça estaduais (tjXX) e regionais federais (trfN), sem precisar
// listar todo estado.
const TRIBUNAIS_CONHECIDOS = ['stf', 'stj', 'tst', 'tse', 'stm']
function ehTribunal(tl) {
  return TRIBUNAIS_CONHECIDOS.includes(tl) || /^tj[a-z]{2}$/.test(tl) || /^trf\d?$/.test(tl)
}

// Classifica uma tag (isolada, sem o contexto de uma entrada específica)
// pro Índice Remissivo: 'oculta' nunca aparece lá (é rastro técnico, tipo
// duplicado, não ajuda ninguém a navegar por assunto); 'legislacao' inclui
// código, artigo, número de lei, súmula e tribunal (é "de onde vem", não
// "do que trata"); o resto é 'assunto' de verdade.
export function classificarTagIndice(tag) {
  const tl = (tag || '').toLowerCase().trim()
  if (!tl) return 'oculta'
  if (TAGS_ORIGEM_OCULTAS.includes(tl)) return 'oculta'
  if (CODIGOS_OCULTOS.includes(tl)) return 'legislacao'
  if (/^lei\s*n?[ºo°]?\s*\d/.test(tl)) return 'legislacao'
  if (/^art\.?\s*\d/.test(tl)) return 'legislacao'
  if (/^súmula\s*\d/i.test(tl)) return 'legislacao'
  if (ehTribunal(tl)) return 'legislacao'
  return 'assunto'
}

// Formata uma tag pra exibição, sem alterar o dado salvo. Sigla de
// código/tribunal (cc, cpp, stj, tjrs...) vira caixa alta de verdade
// (é abreviação, não frase); o resto ganha só a inicial maiúscula, na
// norma culta usada no resto do app — o dado no banco costuma vir tudo
// minúsculo, mas exibir assim destoa do texto editorial ao redor.
export function formatarTagIndice(tag) {
  const tl = (tag || '').toLowerCase().trim()
  if (!tl) return tag
  if (CODIGOS_OCULTOS.includes(tl) || ehTribunal(tl)) return tag.toUpperCase()
  return tag.charAt(0).toUpperCase() + tag.slice(1)
}

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
