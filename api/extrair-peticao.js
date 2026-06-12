import { createClient } from '@supabase/supabase-js'

// Plano Hobby: max 10s. Para docx enviamos texto puro (rápido).
// Para PDF enviamos base64 — documentos simples ficam abaixo de 10s.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const supabaseUrl  = process.env.SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_KEY

  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const { pdf_base64, texto, filename, user_id } = req.body
  if (!user_id) return res.status(400).json({ error: 'user_id obrigatório.' })
  if (!pdf_base64 && !texto) return res.status(400).json({ error: 'Arquivo ou texto obrigatório.' })

  // ── Montar conteúdo para o Claude ────────────────────────────────────
  const SYSTEM = `Você é um Doutrinador e Estrategista Processual. Analise o documento e extraia conhecimento jurídico universal e abstrato, completamente desvinculado dos fatos concretos do caso.

REGRA ABSOLUTA: Jamais mencione fatos específicos do caso (partes, valores, eventos concretos). Todo conteúdo deve ser reutilizável em qualquer demanda futura.

Retorne SOMENTE um objeto JSON válido, sem markdown, sem código, sem texto antes ou depois:
{"meta":{"tipo_peca":"string","numero_processo":"string ou null","resultado":"string ou null"},"teses":[{"area":"Cível","tipo":"jurisprudência","tema":"string","fonte":"string","referencia":"string","tese_assunto":"string","fundamentacao_legal":"string","precedente_sumula":"string","ratio_decidendi":"string","aplicacao_pratica":"string"}],"artigos":[{"codigo":"cpc","numero":300,"inciso":null,"paragrafo":null,"texto":"string","aplicacao_pratica":"string","contexto":"string"}]}`

  let userContent
  if (texto) {
    // Docx: texto extraído no browser
    userContent = [{ type: 'text', text: `Extraia o conhecimento jurídico desta peça${filename ? ` (${filename})` : ''}. Retorne APENAS o JSON.\n\n${texto.slice(0, 40000)}` }]
  } else {
    // PDF: base64
    userContent = [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf_base64 } },
      { type: 'text', text: `Extraia o conhecimento jurídico desta peça${filename ? ` (${filename})` : ''}. Retorne APENAS o JSON.` },
    ]
  }

  // ── Chamar Claude ─────────────────────────────────────────────────────
  let claudeRes
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userContent }],
      }),
    })
  } catch (err) {
    return res.status(500).json({ error: `Erro ao chamar IA: ${err.message}` })
  }

  // Resposta vazia = timeout da Vercel antes de o Claude responder
  const rawBody = await claudeRes.text()
  if (!rawBody || !rawBody.trim()) {
    return res.status(504).json({ error: 'Tempo excedido. O PDF é muito grande — converta para texto (.docx) ou divida em partes menores.' })
  }
  let claudeJson
  try { claudeJson = JSON.parse(rawBody) }
  catch (e) { return res.status(500).json({ error: `Resposta inválida da IA: ${e.message}` }) }
  if (claudeJson.error) return res.status(500).json({ error: claudeJson.error.message })

  // ── Parser defensivo ──────────────────────────────────────────────────
  const rawText = (claudeJson.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  let dados
  try { dados = JSON.parse(rawText.trim()) }
  catch {
    const match = rawText.match(/\{[\s\S]*\}/)
    if (!match) return res.status(422).json({ error: 'A IA não retornou JSON válido. Tente novamente.' })
    try { dados = JSON.parse(match[0]) }
    catch (e) { return res.status(422).json({ error: `JSON inválido: ${e.message}` }) }
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
    await supabase.from('legislacao').delete()
      .eq('codigo', a.codigo.toLowerCase()).eq('numero', parseInt(a.numero))

    const { error } = await supabase.from('legislacao').insert({
      codigo:            a.codigo.toLowerCase(),
      numero:            parseInt(a.numero),
      inciso:            a.inciso    || null,
      paragrafo:         a.paragrafo || null,
      texto:             a.texto     || '',
      aplicacao_pratica: a.aplicacao_pratica || null,
      contexto:          a.contexto  || null,
      origem,
      vigente: true,
    })
    if (error) erros.push(`Art. ${a.numero} ${a.codigo}: ${error.message}`)
    else artigosSalvos++
  }

  return res.status(200).json({ ok: true, meta: dados.meta, teses_salvas: tesesSalvas, artigos_salvos: artigosSalvos, erros })
}
