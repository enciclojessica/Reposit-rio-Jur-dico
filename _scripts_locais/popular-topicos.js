// api/popular-topicos.js — Lex.IA (endpoint temporário, admin only)
// Classifica e salva tópicos das questões OAB sem tópico
// POST /api/popular-topicos { user_id, lote_inicio?, lote_tamanho? }

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const EXEMPLOS = `
Direito Administrativo: "Atos Administrativos", "Lei de Improbidade", "Licitações e Contratos", "Servidores Públicos", "Responsabilidade do Estado"
Direito Ambiental: "Licenciamento Ambiental", "Responsabilidade Ambiental", "Crimes Ambientais"
Direito Civil: "Responsabilidade Civil", "Negócio Jurídico", "Contratos em Espécie", "Obrigações", "Direito de Família", "Sucessões", "Posse e Propriedade", "Pessoas e Capacidade"
Direito Constitucional: "Controle de Constitucionalidade", "Direitos Fundamentais", "Organização dos Poderes", "Remédios Constitucionais", "Competências Legislativas"
Direito do Trabalho: "Contrato de Trabalho", "Rescisão Contratual", "FGTS e Verbas", "Jornada e Salário", "Processo do Trabalho"
Direito Eleitoral: "Inelegibilidade", "Propaganda Eleitoral", "Crimes Eleitorais"
Direito Empresarial: "Títulos de Crédito", "Sociedades Empresariais", "Recuperação Judicial", "Falência"
Direito Internacional: "Cooperação Jurídica Internacional", "Extradição e Deportação", "Tratados Internacionais"
Direito Penal: "Teoria do Crime", "Extinção da Punibilidade", "Crimes contra a Pessoa", "Crimes contra o Patrimônio", "Crimes contra a Administração", "Penas e Medidas"
Direito Previdenciário: "Benefícios Previdenciários", "Custeio da Previdência", "Regime Geral de Previdência"
Direito Processual Civil: "Competência", "Tutelas Provisórias", "Recursos Cíveis", "Cumprimento de Sentença", "Provas", "Petição Inicial e Citação"
Direito Processual Penal: "Prisão Cautelar", "Provas no Processo Penal", "Procedimentos Penais", "Recursos Penais", "Ação Penal"
Direito Tributário: "Competência Tributária", "Crédito Tributário", "Obrigação Tributária", "Impostos Federais", "Limitações ao Poder de Tributar"
Ética Profissional: "Deveres do Advogado", "Honorários Advocatícios", "Sigilo Profissional", "Incompatibilidades e Impedimentos", "Infrações e Sanções"
`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY ausente' })

  const { user_id, lote_inicio = 0, lote_tamanho = 20 } = req.body || {}
  if (!user_id) return res.status(400).json({ error: 'user_id obrigatório' })

  // Verificar admin
  const { data: membro } = await supabase.from('membros').select('role').eq('user_id', user_id).single()
  if (!membro || membro.role !== 'admin') return res.status(403).json({ error: 'Admin only' })

  // Buscar questões sem tópico neste lote
  const { data: questoes, error: qErr, count } = await supabase
    .from('oab_questoes')
    .select('id, exame, disciplina, enunciado', { count: 'estimated' })
    .is('topico', null)
    .order('exame')
    .order('disciplina')
    .range(lote_inicio, lote_inicio + lote_tamanho - 1)

  if (qErr) return res.status(500).json({ error: qErr.message })
  if (!questoes?.length) return res.status(200).json({ concluido: true, restantes: 0 })

  // Montar prompt
  const lista = questoes.map((q, i) =>
    `[${i}] ID:${q.id}\nDisciplina: ${q.disciplina}\nEnunciado: ${q.enunciado.slice(0, 400)}`
  ).join('\n\n---\n\n')

  const prompt = `Classifique cada questão jurídica com um tópico específico (máximo 5 palavras). Use substantivos jurídicos precisos. Não repita a disciplina no tópico.

PADRÃO DE TÓPICOS:
${EXEMPLOS}

QUESTÕES:
${lista}

Responda SOMENTE com JSON:
{"resultados": [{"id": "uuid", "topico": "Tópico Preciso"}, ...]}`

  let classificados
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const raw = await claudeRes.text()
      return res.status(500).json({ error: `Anthropic HTTP ${claudeRes.status}`, detalhe: raw.slice(0, 200) })
    }

    const data = await claudeRes.json()
    const text = data.content?.find(b => b.type === 'text')?.text || ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    classificados = JSON.parse(clean).resultados
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao classificar: ' + err.message })
  }

  // Salvar no banco
  let salvos = 0
  const erros = []
  for (const r of classificados) {
    if (!r.id || !r.topico) continue
    const { error } = await supabase.from('oab_questoes').update({ topico: r.topico }).eq('id', r.id)
    if (error) erros.push(r.id)
    else salvos++
  }

  // Contar restantes
  const { count: restantes } = await supabase
    .from('oab_questoes')
    .select('*', { count: 'exact', head: true })
    .is('topico', null)

  return res.status(200).json({
    salvos,
    erros: erros.length,
    restantes,
    proximo_inicio: lote_inicio + lote_tamanho,
    concluido: restantes === 0,
  })
}
