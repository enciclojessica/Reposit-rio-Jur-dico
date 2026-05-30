import { createClient } from '@supabase/supabase-js'

export const config = { maxDuration: 60 } // Vercel Pro/hobby max

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const supabaseUrl  = process.env.SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_KEY

  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })
  if (!serviceKey)   return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY não configurada.' })

  const { pdf_base64, media_type, filename, user_id } = req.body
  if (!pdf_base64) return res.status(400).json({ error: 'Arquivo não recebido.' })
  if (!user_id)    return res.status(400).json({ error: 'user_id obrigatório.' })

  // ── Chamar Claude ────────────────────────────────────────────────────
  let claudeRes
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: `Você é um Doutrinador e Estrategista Processual. Analise o documento e extraia conhecimento jurídico universal e abstrato, completamente desvinculado dos fatos concretos do caso.

REGRA ABSOLUTA: Jamais mencione fatos específicos do caso (partes, valores, eventos concretos). Todo conteúdo deve ser reutilizável em qualquer demanda futura.

Retorne SOMENTE um objeto JSON válido, sem markdown, sem código, sem texto antes ou depois:
{
  "meta": {
    "tipo_peca": "string",
    "numero_processo": "string ou null",
    "resultado": "string ou null"
  },
  "teses": [
    {
      "area": "Cível",
      "tipo": "jurisprudência",
      "tema": "string",
      "fonte": "string",
      "referencia": "string",
      "tese_assunto": "string",
      "fundamentacao_legal": "string",
      "precedente_sumula": "string",
      "ratio_decidendi": "string",
      "aplicacao_pratica": "string"
    }
  ],
  "artigos": [
    {
      "codigo": "cpc",
      "numero": 300,
      "inciso": null,
      "paragrafo": null,
      "texto": "string",
      "aplicacao_pratica": "string",
      "contexto": "string"
    }
  ]
}`,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: media_type || 'application/pdf', data: pdf_base64 } },
            { type: 'text', text: `Extraia o conhecimento jurídico desta peça${filename ? ` (${filename})` : ''}. Retorne APENAS o JSON, sem nenhum texto adicional.` },
          ],
        }],
      }),
    })
  } catch (err) {
    return res.status(500).json({ error: `Erro ao chamar IA: ${err.message}` })
  }

  const claudeJson = await claudeRes.json()
  if (claudeJson.error) return res.status(500).json({ error: claudeJson.error.message })

  // ── Parser defensivo — trata respostas não-JSON ───────────────────────
  const text = (claudeJson.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  let dados
  try {
    // Tentar parse direto
    dados = JSON.parse(text.trim())
  } catch {
    // Extrair JSON com regex
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      return res.status(422).json({
        error: 'A IA não retornou JSON válido. Tente com um PDF menor ou mais legível.',
        raw_preview: text.slice(0, 300),
      })
    }
    try {
      dados = JSON.parse(match[0])
    } catch (e2) {
      return res.status(422).json({
        error: `JSON inválido extraído: ${e2.message}. Tente com um PDF diferente.`,
        raw_preview: match[0].slice(0, 300),
      })
    }
  }

  // ── Salvar no Supabase ────────────────────────────────────────────────
  const supabase = createClient(supabaseUrl, serviceKey)
  const origem   = filename || dados.meta?.tipo_peca || 'Documento importado'

  let tesesSalvas = 0, artigosSalvos = 0
  const erros = []

  for (const t of (dados.teses || [])) {
    if (!t.tema?.trim()) continue
    const { error } = await supabase.from('entradas').insert({
      area:       ['Cível','Penal','Doutrina','Legislação'].includes(t.area) ? t.area : 'Cível',
      tipo:       t.tipo || 'jurisprudência',
      tema:       t.tema,
      fonte:      t.fonte || '',
      referencia: t.referencia || '',
      url:        '',
      status:     'vigente',
      tags:       ['extraído-de-peça'],
      teses: [{
        tese_assunto:        t.tese_assunto        || '',
        fundamentacao_legal: t.fundamentacao_legal || '',
        precedente_sumula:   t.precedente_sumula   || '',
        ratio_decidendi:     t.ratio_decidendi     || '',
        aplicacao_pratica:   t.aplicacao_pratica   || '',
      }],
      criado_por: user_id,
    })
    if (error) erros.push(`Tese "${t.tema}": ${error.message}`)
    else tesesSalvas++
  }

  for (const a of (dados.artigos || [])) {
    if (!a.codigo?.trim() || !a.numero) continue
    // Deduplicar
    await supabase.from('legislacao')
      .delete()
      .eq('codigo', a.codigo.toLowerCase())
      .eq('numero', parseInt(a.numero))
      .is('inciso', a.inciso || null)
      .is('paragrafo', a.paragrafo || null)

    const { error } = await supabase.from('legislacao').insert({
      codigo:            a.codigo.toLowerCase(),
      numero:            parseInt(a.numero),
      inciso:            a.inciso    || null,
      paragrafo:         a.paragrafo || null,
      texto:             a.texto     || '',
      aplicacao_pratica: a.aplicacao_pratica || null,
      contexto:          a.contexto  || null,
      resultado:         null,
      origem,
      vigente:           true,
    })
    if (error) erros.push(`Art. ${a.numero} ${a.codigo}: ${error.message}`)
    else artigosSalvos++
  }

  return res.status(200).json({
    ok: true,
    meta: dados.meta,
    teses_salvas:   tesesSalvas,
    artigos_salvos: artigosSalvos,
    erros,
  })
}
