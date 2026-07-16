// Extrai quantidade de questões e lista de disciplinas do texto livre do
// tópico de uma sessão "Simulado Geral" do cronograma (ex: "Simulado
// FGV-padrão: 30 questões — Ética + Civil + Processo Civil").
// Se nenhuma disciplina específica for mencionada (ou o texto disser
// "todas as disciplinas"/"revisão geral"), retorna disciplinas: [] (= todas).

// Ordem importa: nomes compostos ("Processo Civil") devem ser checados
// antes das abreviações simples ("Civil") para não haver dupla contagem.
const ABREV_DISCIPLINA = [
  ['Processo Civil', 'Direito Processual Civil'],
  ['Processo Penal', 'Direito Processual Penal'],
  ['Ética',          'Ética Profissional'],
  ['Constitucional', 'Direito Constitucional'],
  ['Civil',          'Direito Civil'],
  ['Penal',          'Direito Penal'],
]

export function parseSimuladoTopico(topico) {
  if (!topico) return { quantidade: 80, disciplinas: [] }

  const mQtd = topico.match(/(\d+)\s*quest/i)
  const quantidade = mQtd ? parseInt(mQtd[1], 10) : 80

  if (/todas as disciplinas|revis[ãa]o geral/i.test(topico)) {
    return { quantidade, disciplinas: [] }
  }

  const disciplinas = []
  let restante = topico
  for (const [abrev, nomeCompleto] of ABREV_DISCIPLINA) {
    // (?<![\p{L}]) / (?![\p{L}]) no lugar de \b — \b não reconhece letras
    // acentuadas (ex.: "É" de "Ética") como caractere de palavra em JS.
    const re = new RegExp(`(?<![\\p{L}])${abrev}(?![\\p{L}])`, 'iu')
    if (re.test(restante)) {
      disciplinas.push(nomeCompleto)
      restante = restante.replace(re, '')
    }
  }
  return { quantidade, disciplinas }
}
