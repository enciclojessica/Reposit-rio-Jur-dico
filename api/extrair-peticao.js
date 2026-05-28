import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const supabaseUrl  = process.env.SUPABASE_URL
  const serviceKey   = process.env.SUPABASE_SERVICE_KEY

  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })
  if (!serviceKey)   return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY não configurada.' })

  const { pdf_base64, filename, user_id } = req.body
  if (!pdf_base64) return res.status(400).json({ error: 'PDF não recebido.' })
  if (!user_id)    return res.status(400).json({ error: 'user_id obrigatório.' })

  // ── 1. Claude lê o PDF e extrai tudo ────────────────────────────────
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: `Você é um extrator jurídico especializado. Leia a petição e extraia dois conjuntos de dados.

Retorne APENAS um objeto JSON válido, sem markdown:
{
  "meta": {
    "tipo_peca": "ex: Petição Inicial, Contestação, Recurso...",
    "numero_processo": "se houver",
    "vara": "se houver",
    "resultado": "ex: Procedente, Improcedente, Acordo, Em andamento, Desconhecido"
  },
  "teses": [
    {
      "area": "Cível ou Penal ou Doutrina",
      "tipo": "jurisprudência ou doutrina ou súmula ou lei",
      "tema": "tema principal da tese",
      "fonte": "tribunal ou autor",
      "referencia": "número do processo, súmula ou referência bibliográfica",
      "tese_assunto": "enunciado da tese",
      "fundamentacao_legal": "artigos e leis citados",
      "precedente_sumula": "precedente ou súmula se houver",
      "ratio_decidendi": "fundamento determinante",
      "aplicacao_pratica": "como foi usada nesta peça"
    }
  ],
  "artigos": [
    {
      "codigo": "cpc, cdc, cc, cpp, cf, lei9099 ou outro",
      "numero": 0,
      "inciso": "I, II... ou null",
      "paragrafo": "§1º... ou null",
      "texto": "texto literal do artigo conforme citado",
      "aplicacao_pratica": "como este artigo foi usado nesta peça",
      "contexto": "contexto fático que motivou a aplicação",
      "resultado": "resultado obtido com este argumento"
    }
  ]
}

Extraia todas as teses identificáveis e todos os artigos citados. Só dados reais presentes no documento.`,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf_base64 } },
          { type: 'text', text: `Extraia as teses jurídicas e os artigos de lei desta peça${filename ? ` (${filename})` : ''}.` },
        ],
      }],
    }),
  })

  const json = await response.json()
  if (json.error) return res.status(500).json({ error: json.error.message })

  const text  = (json.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return res.status(422).json({ error: 'Não foi possível extrair dados da peça.' })

  const dados = JSON.parse(match[0])
  const supabase = createClient(supabaseUrl, serviceKey)
  const origem   = filename || dados.meta?.tipo_peca || 'Petição importada'
  const resultado = dados.meta?.resultado || ''

  let tesesSalvas   = 0
  let artigosSalvos = 0
  const erros = []

  // ── 2. Salvar teses no repositório ──────────────────────────────────
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
    if (error) erros.push(`Tese: ${t.tema} — ${error.message}`)
    else tesesSalvas++
  }

  // ── 3. Salvar artigos na legislação ──────────────────────────────────
  for (const a of (dados.artigos || [])) {
    if (!a.codigo?.trim() || !a.numero) continue
    const { error } = await supabase.from('legislacao').insert({
      codigo:            a.codigo.toLowerCase(),
      numero:            parseInt(a.numero),
      inciso:            a.inciso    || null,
      paragrafo:         a.paragrafo || null,
      texto:             a.texto     || '',
      aplicacao_pratica: a.aplicacao_pratica || null,
      contexto:          a.contexto  || null,
      resultado:         resultado   || a.resultado || null,
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
