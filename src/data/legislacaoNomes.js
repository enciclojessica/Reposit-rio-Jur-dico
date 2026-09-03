// Nomes completos dos diplomas legais já presentes no banco de legislação,
// e um detector de menção natural a eles no texto (para o autocompletar de
// artigos do Editor). São apenas nomes oficiais e públicos de leis — não é
// conteúdo jurídico gerado, então não fere o rigor de fonte primária.

export const NOME_CODIGO = {
  cc:      'Código Civil (Lei 10.406/2002)',
  cdc:     'Código de Defesa do Consumidor (Lei 8.078/1990)',
  cf:      'Constituição Federal',
  cpc:     'Código de Processo Civil (Lei 13.105/2015)',
  cpp:     'Código de Processo Penal (Decreto-Lei 3.689/1941)',
  ctb:     'Código de Trânsito Brasileiro (Lei 9.503/1997)',
  lei9099: 'Lei 9.099/1995 (Juizados Especiais)',
}

// Palavras-chave (case-insensitive) que indicam menção a cada diploma.
const PISTAS_CODIGO = [
  ['cc',      /\bc[oó]digo\s+civil\b|\bcc\b/i],
  ['cdc',     /\bc[oó]digo\s+de\s+defesa\s+do\s+consumidor\b|\bcdc\b/i],
  ['cf',      /\bconstitui[cç][aã]o\s+federal\b|\bcf\b/i],
  ['cpc',     /\bc[oó]digo\s+de\s+processo\s+civil\b|\bcpc\b/i],
  ['cpp',     /\bc[oó]digo\s+de\s+processo\s+penal\b|\bcpp\b/i],
  ['ctb',     /\bc[oó]digo\s+de\s+tr[aâ]nsito\b|\bctb\b/i],
  ['lei9099', /\blei\s*9\.?099\b|\bjuizados?\s+especiais?\b/i],
]

// Detecta um diploma mencionado numa janela de texto (ex: os ~80 caracteres
// antes do cursor). Retorna o código ('cc', 'cpc'...) ou null.
export function detectarCodigoNoTexto(janela) {
  for (const [codigo, regex] of PISTAS_CODIGO) {
    if (regex.test(janela)) return codigo
  }
  return null
}

// Encontra menções a "art. N" / "artigo N" num texto livre, e tenta casar
// cada uma com o diploma mencionado por perto (antes ou depois, numa janela
// de ~60 caracteres — cobre tanto "art. 5º, LVII, da CF" quanto "CDC, art. 6º").
// Só retorna o número inteiro do artigo (sem sufixo tipo "-A"): é o que a
// coluna legislacao.numero armazena, o sufixo mora em "titulo".
// Usado para linkar citações de lei dentro de uma tese ao artigo real, se
// ele já estiver importado no repositório.
const REGEX_ARTIGO = /art(?:igo)?\.?\s*(\d+)[º°]?/gi

export function extrairReferenciasLegais(texto) {
  if (!texto) return []

  // Primeiro localiza todas as ocorrências de "art. N", sem resolver
  // diploma ainda — precisamos das posições de todas pra não deixar a
  // janela de uma vazar pra outra.
  const ocorrencias = []
  let m
  REGEX_ARTIGO.lastIndex = 0
  while ((m = REGEX_ARTIGO.exec(texto)) !== null) {
    const numero = parseInt(m[1], 10)
    if (numero) ocorrencias.push({ numero, matchTexto: m[0], start: m.index, end: m.index + m[0].length })
  }

  const refs = []
  ocorrencias.forEach((oc, i) => {
    // Janela "depois" (mais comum: "art. N do/da <Código>"), sem invadir a
    // próxima ocorrência de artigo.
    const limiteDepois = i + 1 < ocorrencias.length ? ocorrencias[i + 1].start : texto.length
    const janelaDepois = texto.slice(oc.end, Math.min(limiteDepois, oc.end + 40))
    // Janela "antes", curta (cobre "CDC, art. N"), sem invadir a ocorrência anterior.
    const limiteAntes = i > 0 ? ocorrencias[i - 1].end : 0
    const janelaAntes = texto.slice(Math.max(limiteAntes, oc.start - 25), oc.start)

    const codigo = detectarCodigoNoTexto(janelaDepois) || detectarCodigoNoTexto(janelaAntes)
    if (!codigo) return // sem diploma identificado sem ambiguidade, não arrisca link errado

    refs.push({ codigo, numero: oc.numero, matchTexto: oc.matchTexto, start: oc.start, end: oc.end })
  })
  return refs
}
