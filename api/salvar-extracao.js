// Endpoint leve: apenas persiste os dados extraídos pelo browser
// Sem chamada à IA — sem risco de timeout
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  if (!serviceKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY não configurada.' })

  const { dados, filename, user_id } = req.body
  if (!dados || !user_id) return res.status(400).json({ error: 'Dados ou user_id ausentes.' })

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
    await supabase.from('legislacao')
      .delete()
      .eq('codigo', a.codigo.toLowerCase())
      .eq('numero', parseInt(a.numero))

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

  // Salvar jurisprudências extraídas da peça (novas apenas)
  let jurisSalvas = 0
  for (const j of (dados.jurisprudencias || [])) {
    if (!j.numero?.trim() || !j.tribunal) continue
    // Verificar se já existe no repositório
    const ref = `${j.tipo || ''} ${j.numero}`.trim()
    const { data: existe } = await supabase.from('entradas')
      .select('id').eq('referencia', ref).limit(1)
    if (existe?.length > 0) continue // já existe, pular
    const { error } = await supabase.from('entradas').insert({
      area: j.area || 'Cível',
      tipo: 'jurisprudência',
      tema: `${j.tribunal} ${ref} — extraído de peça`,
      fonte: j.tribunal,
      referencia: ref,
      url: '',
      status: 'vigente',
      tags: ['extraído-de-peça', 'jurisprudência', j.tribunal?.toLowerCase()].filter(Boolean),
      teses: [{
        tese_assunto: j.ementa || '',
        fundamentacao_legal: j.fundamento || '',
        precedente_sumula: ref,
        ratio_decidendi: j.ementa || '',
        aplicacao_pratica: `Citado em peça processual — ${origem}`,
      }],
      criado_por: user_id,
    })
    if (error) erros.push(`Juris ${ref}: ${error.message}`)
    else jurisSalvas++
  }

  return res.status(200).json({ ok: true, meta: dados.meta, teses_salvas: tesesSalvas, artigos_salvos: artigosSalvos, juris_salvas: jurisSalvas, erros })
}
