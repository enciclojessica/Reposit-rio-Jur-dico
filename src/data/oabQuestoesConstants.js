import { DISC_COR } from './disciplinas'

// "Simulado Geral" é tipo de sessão de estudo, não disciplina classificável
export const DISCIPLINAS = Object.keys(DISC_COR).filter(d => d !== 'Simulado Geral')

export const EXAMES = ['Todos','38','39','40','41','42','43','44','45']

export const MODOS = [
  { id: 'estudo',    label: 'Estudo',    desc: 'Uma por vez com feedback imediato' },
  { id: 'bloco',     label: 'Bloco',     desc: 'Responda todas e veja o resultado' },
  { id: 'revisao',   label: 'Revisão',   desc: 'Só questões que você errou antes' },
  { id: 'favoritas', label: 'Favoritas', desc: 'Questões que você marcou com ★' },
  { id: 'simulado',  label: 'Simulado',  desc: '80 questões cronometradas — condições reais' },
  { id: 'rapida',    label: 'Revisão Rápida', desc: 'Só justificativas — leitura sem responder' },
]

export const EXAME_ANO = {
  '38': '2023.1', '39': '2023.2', '40': '2024.1', '41': '2024.2',
  '42': '2024.3', '43': '2025.1', '44': '2025.2', '45': '2025.3',
}

export function fmtTempo(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
}

export function fmtData(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' })
}
