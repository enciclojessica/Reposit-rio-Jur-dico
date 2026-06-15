import { createClient } from '@supabase/supabase-js'

// POST /api/gerar-questoes
// Body: { user_id, disciplina, exame, quantidade }
// Gera questões FGV-padrão via Claude e salva no banco

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id, disciplina, exame, quantidade = 10 } = req.body || {}
  if (!user_id) return res.status(401).json({ error: 'user_id obrigatório.' })

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

  const { data: membro } = await supabase
    .from('membros').select('role').eq('user_id', user_id).single()
  if (!membro) return res.status(401).json({ error: 'Usuário não encontrado.' })

  // Verificar se já existem questões suficientes no banco para esse filtro
  let query = supabase.from('oab_questoes').select('id', { count: 'exact', head: true })
  if (disciplina && disciplina !== 'Todas') query = query.eq('disciplina', disciplina)
  if (exame && exame !== 'Todos') query = query.eq('exame', exame)
  const { count } = await query

  // Se já tem questões suficientes, não gera mais
  if (count >= quantidade * 2) {
    return res.status(200).json({ geradas: 0, total: count, msg: 'Banco já populado para este filtro.' })
  }

  const prompt = `Você é um especialista em questões da OAB - Exame da Ordem dos Advogados do Brasil, elaboradas pela FGV.

Gere ${quantidade} questões inéditas no padrão FGV para a OAB 1ª Fase.
${disciplina && disciplina !== 'Todas' ? `Disciplina: ${disciplina}` : 'Distribuídas entre as disciplinas da OAB 1ª Fase'}
${exame && exame !== 'Todos' ? `Padrão do exame: ${exame}º Exame` : 'Padrão dos exames 39º ao 48º'}

REGRAS OBRIGATÓRIAS:
- Questões de múltipla escolha com 4 alternativas (A, B, C, D)
- Apenas UMA alternativa correta
- Baseadas na legislação vigente (CC/02, CF/88, CPC/15, CP, CPP, CLT, CTN, etc.)
- Nível de dificuldade compatível com OAB 1ª Fase FGV
- Enunciados claros, sem dupla negação excessiva
- Fundamente o gabarito com base legal precisa

Retorne APENAS JSON válido no formato:
{
  "questoes": [
    {
      "disciplina": "nome da disciplina",
      "topico": "tópico específico dentro da disciplina",
      "exame": "padrão do exame (ex: 47)",
      "enunciado": "texto completo do enunciado",
      "alternativas": {
        "A": "texto da alternativa A",
        "B": "texto da alternativa B",
        "C": "texto da alternativa C",
        "D": "texto da alternativa D"
      },
      "gabarito": "A",
      "justificativa": "fundamento legal preciso da resposta correta e por que as demais estão erradas",
      "dispositivo": "Art. X, Lei Y / Súmula Z"
    }
  ]
}`

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: 'Você é um especialista em questões OAB/FGV. Retorne APENAS JSON válido, sem markdown.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const claudeData = await claudeRes.json()
    const texto = (claudeData.content || []).filter(b => b.type === 'text').map(b => b.text).join('')

    let parsed
    try {
      parsed = JSON.parse(texto.trim())
    } catch {
      const match = texto.match(/\{[\s\S]*\}/)
      parsed = match ? JSON.parse(match[0]) : { questoes: [] }
    }

    const questoes = parsed.questoes || []
    if (!questoes.length) return res.status(200).json({ geradas: 0, msg: 'Nenhuma questão gerada.' })

    // Inserir no banco
    const rows = questoes.map(q => ({
      disciplina:   q.disciplina || disciplina || 'Geral',
      topico:       q.topico || '',
      exame:        q.exame || exame || '47',
      enunciado:    q.enunciado,
      alternativa_a: q.alternativas?.A || '',
      alternativa_b: q.alternativas?.B || '',
      alternativa_c: q.alternativas?.C || '',
      alternativa_d: q.alternativas?.D || '',
      gabarito:     q.gabarito || 'A',
      justificativa: q.justificativa || '',
      dispositivo:  q.dispositivo || '',
      fonte:        'IA-FGV-padrao',
    }))

    const { error } = await supabase.from('oab_questoes').insert(rows)
    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ geradas: questoes.length, total: (count || 0) + questoes.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
