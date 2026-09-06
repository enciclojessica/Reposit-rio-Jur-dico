// Normaliza um valor de área jurídica pra sempre bater com a lista oficial
// do app (as mesmas chaves de AREAS em src/shared.jsx — mantidas em sincronia
// manualmente aqui, já que serverless functions não importam de src/).
//
// Existe porque: o formulário manual (EntradaForm.jsx) sempre usou uma lista
// fechada (<select>), impossível digitar valor fora dela. Mas os fluxos de
// importação por IA (extração de petição, busca de jurisprudência) geram
// "area" como texto livre — o modelo tende a escrever o nome completo
// ("Direito Penal", "Direito Processual Penal") em vez do rótulo curto do
// app ("Penal"). Achado real no acervo: 7 entradas com área inválida por
// esse motivo, nunca apareciam certo no Dashboard nem tinham a cor certa
// na lista, porque "Direito Penal" não existe na lista oficial.
export const AREAS_VALIDAS = [
  'Cível', 'Penal', 'Constitucional', 'Trabalhista', 'Tributário',
  'Administrativo', 'Consumidor', 'Família', 'Previdenciário',
  'Ambiental', 'Internacional', 'Digital',
]

export function normalizarArea(area, fallback = 'Cível') {
  const a = (area || '').trim()
  if (!a) return fallback
  if (AREAS_VALIDAS.includes(a)) return a

  // "Direito Penal" → "Penal", "Direito do Trabalho" → "Trabalho" (não bate,
  // cai pro passo seguinte) — cobre o padrão mais comum de saída da IA.
  const semPrefixo = a.replace(/^direito\s+(do|da|de)?\s*/i, '').trim()
  const capitalizado = semPrefixo.charAt(0).toUpperCase() + semPrefixo.slice(1).toLowerCase()
  if (AREAS_VALIDAS.includes(capitalizado)) return capitalizado

  // Última tentativa: o texto original contém uma área válida em algum
  // lugar (ex: "Direito Processual Penal" contém "Penal").
  const porSubstring = AREAS_VALIDAS.find(v => a.toLowerCase().includes(v.toLowerCase()))
  if (porSubstring) return porSubstring

  return fallback
}
