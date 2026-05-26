import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { tribunal = 'STF', entradas = [], user_id, modo = 'manual' } = req.body

  // Para o cron, usa service role. Para chamada do browser, valida token.
  let userId = user_id
  if (modo === 'cron') {
    const cronSecret = req.headers['authorization']?.replace('Bearer ', '')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Não autorizado.' })
    }
    userId = process.env.SUPABASE_ADMIN_USER_ID || user_id
  }

  if (!userId) return res.status(400).json({ error: 'user_id obrigatório.' })

  // ── 1. Buscar informativo via web search ────────────────────────────
  // (fetch direto ao portal do STF/STJ é bloqueado por servidores externos)
  const query = `último informativo ${tribunal} jurisprudência decisões recentes 2026`
  // textoInformativo será buscado pelo Claude com web_search no passo 3
  const textoInformativo = query

  // ── 2. Resumo do repositório para contexto ───────────────────────────
  const resumoRepo = entradas.slice(0, 60).map(e => ({
    area: e.area, tema: e.tema, fonte: e.fonte,
    teses: e.teses?.map(t => t.tese_assunto).filter(Boolean).slice(0, 2),
    tags: e.tags || [],
  }))

  // ── 3. Claude analisa e seleciona decisões relevantes ────────────────
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system: `Você é um assistente de curadoria jurídica. 
Dado o texto de um informativo (STF ou STJ) e um resumo do repositório de teses do usuário, identifique as decisões do informativo que são relevantes para ampliar ou complementar o repositório.

Critérios de relevância:
- Decisões sobre temas já presentes no repositório (complementam ou atualizam)
- Decisões sobre temas próximos aos do repositório (mesmo ramo do direito)
- Decisões vinculantes, súmulas, temas repetitivos ou repercussão geral

Retorne APENAS um array JSON, sem markdown:
[
  {
    "titulo": "tema em até 80 chars",
    "orgao": "Plenário / Primeira Turma etc",
    "relator": "nome do relator",
    "numero": "número do processo",
    "area": "Cível ou Penal ou Informativo",
    "tese": "enunciado da tese",
    "fundamentacao": "artigos ou dispositivos",
    "relevancia": 0-100,
    "motivo_relevancia": "por que é relevante para este repositório",
    "url": ""
  }
]

Inclua no máximo 8 decisões. Apenas as com relevância >= 60. Se nenhuma for relevante, retorne [].`,
      messages: [{
        role: 'user',
        content: `Tribunal: ${tribunal}

Repositório atual do usuário (resumo):
${JSON.stringify(resumoRepo, null, 2)}

Texto do informativo:
${textoInformativo}`,
      }],
    }),
  })

  const json = await response.json()
  if (json.error) return res.status(500).json({ error: json.error.message })

  const text = (json.content || []).find(b => b.type === 'text')?.text || '[]'
  const match = text.match(/\[[\s\S]*\]/)
  const decisoes = match ? JSON.parse(match[0]) : []

  if (!decisoes.length) {
    return res.status(200).json({ salvas: 0, decisoes: [], mensagem: 'Nenhuma decisão relevante encontrada nesta edição.' })
  }

  // ── 4. Salvar no Supabase ────────────────────────────────────────────
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  let salvas = 0
  const erros = []

  for (const d of decisoes) {
    const payload = {
      area:       ['Cível','Penal','Informativo','Doutrina'].includes(d.area) ? d.area : 'Informativo',
      tipo:       'jurisprudência',
      tema:       d.titulo || '',
      fonte:      tribunal,
      referencia: d.numero || '',
      url:        d.url || '',
      status:     'vigente',
      tags:       ['informativo', tribunal.toLowerCase(), 'auto-importado'],
      teses: [{
        tese_assunto:        d.tese || '',
        fundamentacao_legal: d.fundamentacao || '',
        precedente_sumula:   d.numero || '',
        ratio_decidendi:     d.motivo_relevancia || '',
        aplicacao_pratica:   '',
      }],
      criado_por: userId,
    }
    const { error } = await supabase.from('entradas').insert(payload)
    if (error) erros.push(d.titulo)
    else salvas++
  }

  return res.status(200).json({ salvas, total_analisadas: decisoes.length, erros, decisoes })
}
