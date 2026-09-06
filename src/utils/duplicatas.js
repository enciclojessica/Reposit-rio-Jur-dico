// Detector de possível duplicata ao criar/editar uma entrada, comparando
// o tema digitado com os temas já existentes no acervo. Similaridade por
// Jaccard sobre o conjunto de palavras (sem stopwords, sem acento) — leve
// o bastante pra rodar a cada tecla, sem precisar de biblioteca externa
// nem de round-trip ao banco.

const STOPWORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'para',
  'com', 'sem', 'por', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'um', 'uma',
  'que', 'se', 'sua', 'seu',
])

function palavrasRelevantes(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
}

export function similaridadeTemas(a, b) {
  const palavrasA = new Set(palavrasRelevantes(a))
  const palavrasB = new Set(palavrasRelevantes(b))
  if (palavrasA.size === 0 || palavrasB.size === 0) return 0
  const intersecao = [...palavrasA].filter(w => palavrasB.has(w)).length
  const uniao = new Set([...palavrasA, ...palavrasB]).size
  return uniao === 0 ? 0 : intersecao / uniao
}

function ultimoSobrenome(fonte) {
  const partes = (fonte || '').trim().split(/\s+/).filter(Boolean)
  return partes[partes.length - 1] || ''
}

// Duas entradas de doutrina com o tema exatamente igual, mas de autores
// diferentes, não são duplicata (são autoridades diferentes definindo o
// mesmo conceito) — mas ficam impossíveis de distinguir numa lista sem
// abrir cada uma. Achado real no acervo: três entradas com o mesmo tema
// (Noronha, Masson, Bitencourt, todos sobre "meio cruel" no homicídio
// qualificado), só diferenciáveis pelo campo fonte. Esta função garante
// que, daqui pra frente, o sobrenome do autor entra no tema automaticamente
// sempre que essa colisão específica acontecer — não roda pra outros
// tipos (jurisprudência já se diferencia pelo número do processo, que
// normalmente já está no tema) nem se o tema já menciona o autor.
export function diferenciarTemaSeNecessario(tema, fonte, tipo, entradas, idExcluir) {
  const temaLimpo = (tema || '').trim()
  const fonteLimpa = (fonte || '').trim()
  if (tipo !== 'doutrina' || !temaLimpo || !fonteLimpa || !entradas?.length) return temaLimpo

  const temaNorm = temaLimpo.toLowerCase()
  const colisao = entradas.some(e =>
    e.id !== idExcluir &&
    e.tipo === 'doutrina' &&
    (e.fonte || '').trim() !== fonteLimpa &&
    (e.tema || '').trim().toLowerCase() === temaNorm
  )
  if (!colisao) return temaLimpo

  const autor = ultimoSobrenome(fonteLimpa)
  if (!autor || temaNorm.includes(autor.toLowerCase())) return temaLimpo
  return `${temaLimpo} (${autor})`
}

// Retorna até 3 entradas existentes com tema parecido, da mais parecida
// pra menos. idExcluir evita comparar uma entrada em edição com ela mesma.
// Não roda pra temas muito curtos (< 8 caracteres): tema curto tem palavra
// demais em comum com qualquer coisa só por acaso.
//
// Limiar calibrado contra dados reais do acervo: 0.6, não 0.4. Em 0.4,
// pares como "STJ REsp 1.955.890/SP — Responsabilidade objetiva do
// fornecedor" e "STJ REsp 2.077.278/SP — Responsabilidade objetiva do
// fornecedor" davam falso positivo (~0.55) — são precedentes DIFERENTES
// sobre o mesmo tema, o normal num repositório de jurisprudência, não
// duplicata. Em 0.6, esse par fica de fora, mas duplicata de verdade
// continua pegando (ex: mesmo tema copiado 2x, ~1.0 de similaridade).
export function encontrarPossiveisDuplicatas(tema, entradas, idExcluir, limiar = 0.6) {
  if (!tema || tema.trim().length < 8 || !entradas?.length) return []
  return entradas
    .filter(e => e.id !== idExcluir && e.tema)
    .map(e => ({ entrada: e, score: similaridadeTemas(tema, e.tema) }))
    .filter(x => x.score >= limiar)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
