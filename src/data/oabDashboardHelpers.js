import { SESSIONS_PADRAO } from './oabCronograma'

export const DISCIPLINAS = [...new Set(SESSIONS_PADRAO.map(s => s.disciplina))]
export const MESES = [...new Set(SESSIONS_PADRAO.map(s => {
  const [y,m] = s.date.split('-')
  return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+m-1] + '/' + y.slice(2)
}))]

export const METODO_COR = {
  "Questões FGV":    { bg:"#eff6ff", text:"#1d4ed8" },
  "Lei Seca":        { bg:"#fff7ed", text:"#c2410c" },
  "Súmulas STJ/STF": { bg:"#f0ebf8", text:"#5b21b6" },
  "Simulado":        { bg:"#f0fdfa", text:"#0f766e" },
  "Peça Processual": { bg:"#f0fdf4", text:"#15803d" },
  "Discursiva":      { bg:"#fffbeb", text:"#b45309" },
}

export function fmt(ds) {
  const [y,m,d] = ds.split('-')
  return `${d}/${m}/${y.slice(2)}`
}
export function getMes(ds) {
  const [y,m] = ds.split('-')
  return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][+m-1] + '/' + y.slice(2)
}
export function diasAte(ds) {
  return Math.ceil((new Date(ds+'T12:00:00') - new Date()) / 86400000)
}
export function fmtTempo(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
}

// Ritmo real: sessões que já deveriam ter acontecido (data <= hoje) vs
// quantas dessas de fato foram concluídas.
export function calcularRitmo(sessions, dados, hojeStr = new Date().toISOString().split('T')[0]) {
  const esperadas = sessions.filter(s => s.date <= hojeStr).length
  const concEsperadas = sessions.filter(s => s.date <= hojeStr && dados[s.id]?.status === 'Concluído').length
  return { esperadas, concEsperadas, atraso: esperadas - concEsperadas }
}
