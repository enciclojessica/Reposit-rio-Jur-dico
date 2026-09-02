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
