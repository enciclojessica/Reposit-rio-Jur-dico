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
  lep:     'Lei de Execução Penal (Lei 7.210/1984)',
  clt:     'Consolidação das Leis do Trabalho (Decreto-Lei 5.452/1943)',
  ctn:     'Código Tributário Nacional (Lei 5.172/1966)',
  lei15040:'Marco Legal dos Seguros (Lei 15.040/2024)',
  cp:      'Código Penal (Decreto-Lei 2.848/1940)',
  adct:    'Ato das Disposições Constitucionais Transitórias',
  lei8906: 'Estatuto da Advocacia e a OAB (Lei 8.906/1994)',
  cedoab:  'Código de Ética e Disciplina da OAB',
}

// Palavras-chave (case-insensitive) que indicam menção a cada diploma.
// O ADCT vem antes da CF: "art. 76 do ADCT da CF" é do ADCT.
const PISTAS_CODIGO = [
  ['adct',    /\badct\b|\batos?\s+das?\s+disposi[cç][oõ]es\s+constitucionais\s+transit[oó]rias\b/i],
  ['cc',      /\bc[oó]digo\s+civil\b|\bcc\b/i],
  ['cp',      /\bc[oó]digo\s+penal\b|\bcp\b/i],
  ['cdc',     /\bc[oó]digo\s+de\s+defesa\s+do\s+consumidor\b|\bcdc\b/i],
  ['cf',      /\bconstitui[cç][aã]o\s+federal\b|\bcf\b/i],
  ['cpc',     /\bc[oó]digo\s+de\s+processo\s+civil\b|\bcpc\b/i],
  ['cpp',     /\bc[oó]digo\s+de\s+processo\s+penal\b|\bcpp\b/i],
  ['ctb',     /\bc[oó]digo\s+de\s+tr[aâ]nsito\b|\bctb\b/i],
  ['lei9099', /\blei\s*9\.?099\b|\bjuizados?\s+especiais?\b/i],
  ['lep',     /\blei\s+de\s+execu[cç][aã]o\s+penal\b|\blei\s*7\.?210\b|\blep\b/i],
  ['lei8906', /\bestatuto\s+da\s+advocacia\b|\blei\s*8\.?906\b|\beoab\b/i],
  ['cedoab',  /\bc[oó]digo\s+de\s+[eé]tica\b|\bced[-\s]?oab\b/i],
  ['clt',     /\bconsolida[cç][aã]o\s+das\s+leis\s+do\s+trabalho\b|\bdecreto[-\s]lei\s*(n[ºo°]\s*)?5\.?452\b|\bclt\b/i],
  ['ctn',     /\bc[oó]digo\s+tribut[aá]rio\s+nacional\b|\blei\s*5\.?172\b|\bctn\b/i],
  ['lei15040',/\bmarco\s+legal\s+dos\s+seguros\b|\blei\s*15\.?040\b/i],
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
// Números de artigo no formato brasileiro usam ponto como separador de
// milhar (ex: "art. 1.658"), não como fim de frase — sem tratar isso, "art.
// 1.658" era lido como artigo 1 (parando no primeiro ponto), colando a
// referência no artigo errado sempre que o número passava de 999.
const REGEX_ARTIGO = /art(?:igo)?\.?\s*(\d{1,3}(?:\.\d{3})*)[º°]?/gi

export function extrairReferenciasLegais(texto) {
  if (!texto) return []

  // Primeiro localiza todas as ocorrências de "art. N", sem resolver
  // diploma ainda — precisamos das posições de todas pra não deixar a
  // janela de uma vazar pra outra.
  const ocorrencias = []
  let m
  REGEX_ARTIGO.lastIndex = 0
  while ((m = REGEX_ARTIGO.exec(texto)) !== null) {
    const numero = parseInt(m[1].replace(/\./g, ''), 10)
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
