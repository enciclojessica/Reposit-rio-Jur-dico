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
      system: `Você é um Doutrinador e Estrategista Processual de alto rigor técnico. Sua missão ao analisar qualquer documento jurídico — seja uma petição inicial, sentença, acórdão, trecho doutrinário ou dispositivo legal — é extrair conhecimento jurídico universal e abstrato, completamente desvinculado dos fatos concretos narrados no documento.

REGRA ABSOLUTA: Jamais registre, resuma ou faça referência aos fatos específicos do caso (nomes das partes, endereços, valores envolvidos, descrições de eventos como acidentes, infiltrações, cancelamentos de voo, etc.). O produto final deve ser integralmente reutilizável em qualquer demanda futura que envolva os mesmos institutos jurídicos.

Retorne APENAS um objeto JSON válido, sem markdown:
{
  "meta": {
    "tipo_peca": "ex: Petição Inicial, Sentença, Acórdão, Artigo Doutrinário...",
    "numero_processo": "se houver, senão null",
    "resultado": "ex: Procedente, Improcedente, Acordo, Em andamento, Desconhecido"
  },
  "teses": [
    {
      "area": "Cível, Penal ou Doutrina",
      "tipo": "jurisprudência, doutrina, súmula ou lei",
      "tema": "tema jurídico abstrato e universal — ex: 'Responsabilidade civil extracontratual — configuração do nexo causal'",
      "fonte": "tribunal, autor ou órgão",
      "referencia": "número do processo, súmula, obra ou referência bibliográfica",
      "tese_assunto": "Enunciado da tese em linguagem universal e abstrata, pronta para uso em qualquer demanda",
      "fundamentacao_legal": "dispositivos legais e súmulas aplicáveis",
      "precedente_sumula": "precedente ou súmula vinculante se houver",
      "ratio_decidendi": "Fundamento determinante do entendimento, extraído em nível de princípio geral, sem menção ao caso concreto",
      "aplicacao_pratica": "Tese universal e abstrata: regra geral diretamente aplicável a múltiplos cenários e ritos processuais, ignorando integralmente os fatos específicos do documento analisado. Redigida como instrução tática pronta para uso imediato em demandas futuras."
    }
  ],
  "artigos": [
    {
      "codigo": "cpc, cdc, cc, cpp, cf, lei9099 ou código da lei (ex: lei8078)",
      "numero": 300,
      "inciso": "I, II... ou null",
      "paragrafo": "§1º... ou null",
      "texto": "Texto literal e íntegro do dispositivo legal conforme o documento",
      "aplicacao_pratica": "Tese processual ou material universal extraída deste dispositivo: regra abstrata e reutilizável que explica como e quando este artigo deve ser invocado, independentemente dos fatos concretos do documento analisado",
      "contexto": "COMENTÁRIO DIDÁTICO em duas camadas obrigatórias — Camada 1 (Clareza): explique a essência do dispositivo sem jargões, de forma que um estudante do primeiro semestre compreenda imediatamente sua função e seu propósito no sistema jurídico. Camada 2 (Profundidade Técnica): analise os requisitos materiais, exceções processuais, súmulas correlatas, entendimentos divergentes e armadilhas processuais que advogados seniores precisam dominar ao invocar este dispositivo em juízo.",
      "resultado": "null — não referenciar resultado de caso concreto"
    }
  ]
}

CRITÉRIOS DE QUALIDADE:
— Cada tese e cada artigo extraído deve ser um ativo de conhecimento autônomo, compreensível e aplicável sem qualquer referência ao documento de origem.
— O campo aplicacao_pratica deve ser redigido como uma regra geral (ex: 'Em ações de responsabilidade civil, o pedido de tutela de urgência exige...'), nunca como relato do que ocorreu no caso.
— O campo contexto dos artigos deve sempre ter as duas camadas: didática e técnica. Nunca omita nenhuma das duas.
— Extraia todas as teses identificáveis e todos os artigos legais citados ou fundamentantes no documento.`,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf_base64 } },
          { type: 'text', text: `Analise este documento jurídico${filename ? ` (${filename})` : ''} e extraia o conhecimento jurídico universal conforme as instruções. Retorne apenas o JSON.` },
        ],
      }],
    }),
  })

  const json = await response.json()
  if (json.error) return res.status(500).json({ error: json.error.message })

  const text  = (json.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return res.status(422).json({ error: 'Não foi possível extrair dados do documento.' })

  const dados    = JSON.parse(match[0])
  const supabase = createClient(supabaseUrl, serviceKey)
  const origem   = filename || dados.meta?.tipo_peca || 'Documento importado'

  let tesesSalvas   = 0
  let artigosSalvos = 0
  const erros = []

  // Salvar teses no repositório
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

  // Salvar artigos na legislação (com deduplicação)
  for (const a of (dados.artigos || [])) {
    if (!a.codigo?.trim() || !a.numero) continue

    // Deletar duplicata se existir
    const delQ = supabase.from('legislacao')
      .delete()
      .eq('codigo', a.codigo.toLowerCase())
      .eq('numero', parseInt(a.numero))
    if (a.inciso)    delQ.eq('inciso', a.inciso)
    else             delQ.is('inciso', null)
    if (a.paragrafo) delQ.eq('paragrafo', a.paragrafo)
    else             delQ.is('paragrafo', null)
    await delQ

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
