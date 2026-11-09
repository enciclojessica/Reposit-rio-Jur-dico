import { createClient } from '@supabase/supabase-js'

// Projeto do app irmão (Themis Jur Questões, "Simulado OAB", mytvweobktmqfrvsghxg), só leitura anônima da visão
// `artigos_cobrados_oab` (lei, artigo, nº de questões e exames; nada do conteúdo das questões). A chave publicável é
// pública por definição (o acesso é controlado pelo RLS), como a do Themis em `supabase.js`. Dá para trocar com
// VITE_QUESTOES_URL e VITE_QUESTOES_PUBLISHABLE_KEY.
const url = import.meta.env.VITE_QUESTOES_URL || 'https://mytvweobktmqfrvsghxg.supabase.co'
const chave = import.meta.env.VITE_QUESTOES_PUBLISHABLE_KEY || 'sb_publishable_pYzHIJIDks6J-H-N8GW22w_taQ0bIZA'

export const supabaseQuestoes = createClient(url, chave, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'themis-questoes-leitura' },
})

/**
 * Mapa "codigo|artigo" ("cf|5", "cpp|158-A") -> { questoes, exames } com os artigos citados pelas questões da OAB.
 * Falha (rede, visão ausente) devolve mapa vazio: o selo só não aparece.
 */
export async function carregarCobradosOab() {
  const mapa = new Map()
  for (let inicio = 0; ; inicio += 1000) {
    const { data, error } = await supabaseQuestoes
      .from('artigos_cobrados_oab')
      .select('codigo, artigo, questoes, exames')
      .order('codigo').order('artigo')
      .range(inicio, inicio + 999)
    if (error || !data) return mapa
    for (const l of data) mapa.set(`${l.codigo}|${l.artigo}`, { questoes: l.questoes, exames: l.exames || [] })
    if (data.length < 1000) return mapa
  }
}

/** "Cobrado em 3 questões da OAB (Exames 40, 43 e 46)". */
export function textoCobradoOab(info) {
  if (!info?.questoes) return ''
  const exames = [...info.exames].sort((a, b) => a - b).map(n => `${n}º`)
  const lista = exames.length > 1 ? `${exames.slice(0, -1).join(', ')} e ${exames[exames.length - 1]}` : exames[0]
  const q = info.questoes === 1 ? '1 questão' : `${info.questoes} questões`
  return `Cobrado em ${q} da OAB${exames.length ? ` (${exames.length === 1 ? 'Exame' : 'Exames'} ${lista})` : ''}`
}
