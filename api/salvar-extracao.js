// Endpoint leve: apenas persiste os dados extraídos pelo browser
// Sem chamada à IA — sem risco de timeout
import { createClient } from '@supabase/supabase-js'
import { normalizarArea } from '../lib/normalizarArea.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  if (!serviceKey) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY não configurada.' })

  // ── Autenticar via JWT do Supabase enviado no header ──────────────────
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })

  const supabase = createClient(supabaseUrl, serviceKey)
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })

  const { dados } = req.body
  if (!dados) return res.status(400).json({ error: 'Dados ausentes.' })

  // LGPD: nunca usar o nome do arquivo como origem — o nome do arquivo de
  // uma petição real quase sempre contém nome de cliente/parte contrária
  // (ex: "PETIÇÃO - Fulano x Empresa.docx"). Usa só o tipo de peça, que é
  // informação genérica e reaproveitável.
  const origem = dados.meta?.tipo_peca ? `Extraído de ${dados.meta.tipo_peca}` : 'Extraído de petição processual'

  let tesesSalvas = 0, artigosSalvos = 0
  const erros = []
  const detalheTeses = []
  const detalheArtigos = []

  for (const t of (dados.teses || [])) {
    if (!t.tema?.trim()) continue
    const { error } = await supabase.from('entradas').insert({
      area:       normalizarArea(t.area),
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
      criado_por: user.id,
    })
    if (error) erros.push(`Tese "${t.tema}": ${error.message}`)
    else { tesesSalvas++; detalheTeses.push({ tema: t.tema, area: normalizarArea(t.area), tipo: t.tipo || 'jurisprudência', status: 'novo' }) }
  }

  for (const a of (dados.artigos || [])) {
    if (!a.codigo?.trim() || !a.numero) continue
    const codigo = a.codigo.toLowerCase()
    const numero = parseInt(a.numero)

    const { data: existiaAntes } = await supabase.from('legislacao')
      .select('id').eq('codigo', codigo).eq('numero', numero).limit(1)
    const jaExistia = (existiaAntes?.length || 0) > 0

    await supabase.from('legislacao').delete().eq('codigo', codigo).eq('numero', numero)

    const { error } = await supabase.from('legislacao').insert({
      codigo, numero,
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
    else { artigosSalvos++; detalheArtigos.push({ codigo, numero, status: jaExistia ? 'atualizado' : 'novo' }) }
  }

  // Salvar jurisprudências extraídas da peça
  // — se já existe: adiciona novo contexto nas teses existentes (sem duplicar)
  // — se não existe: cria entrada nova
  let jurisSalvas = 0, jurisAtualizadas = 0
  const detalheJuris = []
  for (const j of (dados.jurisprudencias || [])) {
    if (!j.numero?.trim() || !j.tribunal) continue
    const ref = `${j.tipo || ''} ${j.numero}`.trim()
    const novaAplicacao = `Citado em peça processual — ${origem}`

    const { data: existentes } = await supabase.from('entradas')
      .select('id, teses').eq('referencia', ref).limit(1)

    if (existentes?.length > 0) {
      // Já existe — verificar se o contexto atual já foi registrado
      const entrada = existentes[0]
      const tesesTodas = Array.isArray(entrada.teses) ? entrada.teses : []
      const jaTemContexto = tesesTodas.some(t =>
        (t.aplicacao_pratica || '').includes(origem) ||
        (t.ratio_decidendi || '') === (j.ementa || '')
      )
      if (jaTemContexto) continue // contexto idêntico, pular

      // Adicionar novo contexto como nova tese dentro da entrada
      const novasTeses = [...tesesTodas, {
        tese_assunto: j.ementa ? j.ementa.slice(0, 120) + '...' : ref,
        fundamentacao_legal: j.fundamento || '',
        precedente_sumula: ref,
        ratio_decidendi: j.ementa || '',
        aplicacao_pratica: novaAplicacao,
      }]
      const { error } = await supabase.from('entradas')
        .update({ teses: novasTeses })
        .eq('id', entrada.id)
      if (error) erros.push(`Juris ${ref} (atualizar): ${error.message}`)
      else { jurisAtualizadas++; detalheJuris.push({ ref, tribunal: j.tribunal, status: 'atualizado' }) }
    } else {
      // Não existe — criar entrada nova
      const { error } = await supabase.from('entradas').insert({
        area: normalizarArea(j.area),
        tipo: 'jurisprudência',
        tema: `${j.tribunal} ${ref}`,
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
          aplicacao_pratica: novaAplicacao,
        }],
        criado_por: user.id,
      })
      if (error) erros.push(`Juris ${ref}: ${error.message}`)
      else { jurisSalvas++; detalheJuris.push({ ref, tribunal: j.tribunal, status: 'novo' }) }
    }
  }

  return res.status(200).json({
    ok: true, meta: dados.meta,
    teses_salvas: tesesSalvas, artigos_salvos: artigosSalvos,
    juris_salvas: jurisSalvas, juris_atualizadas: jurisAtualizadas,
    detalhes: { teses: detalheTeses, artigos: detalheArtigos, juris: detalheJuris },
    erros,
  })
}
