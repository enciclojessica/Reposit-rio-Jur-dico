import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada.' })

  const { tribunal = 'STF', entradas = [], user_id, modo = 'manual' } = req.body

  let userId = user_id
  if (modo === 'cron') {
    const cronSecret = req.headers['authorization']?.replace('Bearer ', '')
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET)
      return res.status(401).json({ error: 'Não autorizado.' })
    userId = process.env.SUPABASE_ADMIN_USER_ID || user_id
  }
  if (!userId) return res.status(400).json({ error: 'user_id obrigatório.' })

  const resumoRepo = entradas.slice(0, 60).map(e => ({
    area: e.area, tema: e.tema, fonte: e.fonte,
    teses: e.teses?.map(t => t.tese_assunto).filter(Boolean).slice(0, 2),
    tags: e.tags || [],
  }))

  const prompt = `Você é um assistente de curadoria jurídica.
Pesquise o último informativo do ${tribunal} (2026) e identifique as decisões mais relevantes para o repositório abaixo.

Critérios de relevância:
- Decisões sobre temas já presentes no repositório (complementam ou atualizam)
- Decisões sobre temas próximos (mesmo ramo do direito)
- Decisões vinculantes, súmulas, temas repetitivos ou repercussão geral

Retorne APENAS um array JSON, sem markdown:
[{"titulo":"","orgao":"","relator":"","numero":"","area":"Cível|Penal|Doutrina","tese":"","fundamentacao":"","relevancia":0,"motivo_relevancia":"","url":""}]

Inclua no máximo 8 decisões com relevância >= 60. Se nenhuma for relevante, retorne [].

Repositório atual (resumo):
${JSON.stringify(resumoRepo, null, 2)}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { maxOutputTokens: 3000, temperature: 0.2 },
      }),
    }
  )

  const json = await response.json()
  if (json.error) return res.status(500).json({ error: json.error.message })

  const text = (json.candidates?.[0]?.content?.parts || [])
    .filter(p => p.text).map(p => p.text).join('')
  const match = text.match(/\[[\s\S]*\]/)
  const decisoes = match ? JSON.parse(match[0]) : []

  if (!decisoes.length)
    return res.status(200).json({ salvas: 0, decisoes: [], mensagem: 'Nenhuma decisão relevante encontrada.' })

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  let salvas = 0
  const erros = []

  for (const d of decisoes) {
    const { error } = await supabase.from('entradas').insert({
      area:       ['Cível','Penal','Doutrina'].includes(d.area) ? d.area : 'Cível',
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
    })
    if (error) erros.push(d.titulo)
    else salvas++
  }

  return res.status(200).json({ salvas, total_analisadas: decisoes.length, erros, decisoes })
}
