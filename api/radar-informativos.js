import { createClient } from '@supabase/supabase-js'

// Radar de Informativos STJ + STF
// Chamado pelo cron toda segunda-feira
// Também pode ser chamado manualmente por admin via POST /api/radar-informativos

const TRIBUNAIS = {
  STJ: {
    nome: 'STJ',
    urlInformativo: (n) => `https://scon.stj.jus.br/SCON/GetPDF/informativo/informativo${String(n).padStart(3,'0')}.pdf`,
    urlLista: 'https://scon.stj.jus.br/SCON/informativo/toc.jsp',
    area: 'Cível',
  },
  STF: {
    nome: 'STF',
    urlInformativo: (n) => `https://portal.stf.jus.br/textos/verTexto.asp?servico=informativoStf&pagina=informativo${String(n).padStart(4,'0')}`,
    urlLista: 'https://portal.stf.jus.br/textos/verTexto.asp?servico=informativoStf',
    area: 'Constitucional',
  },
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers['authorization']?.replace('Bearer ', '')
  const isCron = process.env.CRON_SECRET && authHeader === process.env.CRON_SECRET

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // Se não é cron, verificar se é admin
  if (!isCron) {
    const userId = req.body?.user_id
    if (!userId) return res.status(401).json({ error: 'user_id obrigatório.' })

    // Verificar usuário via Auth Admin (usa service key, independe de RLS)
    const { data: authData, error: authErr } = await supabase.auth.admin.getUserById(userId)

    if (authErr || !authData?.user) {
      return res.status(401).json({ error: `Erro de autenticação: ${authErr?.message || 'usuário não encontrado'}` })
    }

    const userEmail = authData.user.email
    const ADMIN_EMAILS = ['foxjessica01@gmail.com']

    if (!ADMIN_EMAILS.includes(userEmail)) {
      // Para outros usuários, verificar role na tabela membros
      const { data: membro, error: membroErr } = await supabase
        .from('membros').select('role').eq('user_id', userId).single()
      if (membroErr) return res.status(401).json({ error: `Erro DB: ${membroErr.message}` })
      if (!membro || membro.role !== 'admin') return res.status(403).json({ error: 'Apenas admins podem executar o radar.' })
    }
  }

  // Buscar último informativo processado por tribunal
  const { data: ultimosProcessados } = await supabase
    .from('radar_informativos')
    .select('tribunal, ultimo_numero')
    .in('tribunal', ['STJ', 'STF'])

  const ultimosPorTribunal = {}
  for (const r of (ultimosProcessados || [])) {
    ultimosPorTribunal[r.tribunal] = r.ultimo_numero
  }

  const resultado = { processados: [], erros: [] }

  for (const [sigla, config] of Object.entries(TRIBUNAIS)) {
    try {
      const ultimoSalvo = ultimosPorTribunal[sigla] || 0

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 200,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          system: 'Você é um assistente técnico. Retorne APENAS o número inteiro do último informativo publicado, sem texto adicional.',
          messages: [{
            role: 'user',
            content: `Qual é o número do informativo jurisprudencial mais recente publicado pelo ${sigla}? Busque em ${config.urlLista} e retorne apenas o número.`
          }]
        })
      })

      const claudeData = await claudeRes.json()
      const textoResposta = (claudeData.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text).join('')
        .trim()

      const ultimoDisponivel = parseInt(textoResposta.match(/\d+/)?.[0] || '0')

      if (!ultimoDisponivel || ultimoDisponivel <= ultimoSalvo) {
        resultado.processados.push({ tribunal: sigla, status: 'sem_novidades', ultimo: ultimoSalvo })
        continue
      }

      const novos = []
      const inicio = ultimoSalvo + 1
      const fim = Math.min(ultimoDisponivel, ultimoSalvo + 3)

      for (let num = inicio; num <= fim; num++) {
        try {
          const urlPdf = config.urlInformativo(num)

          const extrairRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5',
              max_tokens: 4000,
              tools: [{ type: 'web_search_20250305', name: 'web_search' }],
              system: `Você é um assistente de curadoria jurídica. Acesse o informativo ${sigla} nº ${num} e extraia as teses jurídicas principais.
Para cada tese retorne JSON no formato:
{
  "teses": [
    {
      "area": "Cível|Penal|Constitucional|Trabalhista|Tributário|Administrativo|Família|Consumidor",
      "tema": "título objetivo da tese em até 120 caracteres",
      "tipo": "jurisprudência",
      "fonte": "${sigla}",
      "referencia": "número do processo ou acórdão",
      "tese_assunto": "enunciado da tese",
      "fundamentacao_legal": "artigos e dispositivos aplicados",
      "aplicacao_pratica": "[IA] como utilizar esta tese em peças processuais"
    }
  ]
}
Retorne APENAS o JSON, sem markdown.`,
              messages: [{
                role: 'user',
                content: `Acesse e processe o Informativo ${sigla} nº ${num}. URL de referência: ${urlPdf}`
              }]
            })
          })

          const extrairData = await extrairRes.json()
          const textoExtrair = (extrairData.content || [])
            .filter(b => b.type === 'text')
            .map(b => b.text).join('')

          let parsed
          try {
            const match = textoExtrair.match(/\{[\s\S]*\}/)
            parsed = JSON.parse(match?.[0] || '{}')
          } catch {
            parsed = { teses: [] }
          }

          if (parsed.teses?.length) {
            for (const t of parsed.teses) {
              await supabase.from('entradas').insert({
                area:       t.area || config.area,
                tipo:       'jurisprudência',
                tema:       t.tema || `${sigla} Informativo ${num}`,
                fonte:      t.fonte || sigla,
                referencia: t.referencia || `Informativo ${sigla} nº ${num}`,
                tags:       [`informativo`, sigla.toLowerCase(), `inf-${num}`],
                ia_status:  'ia_pendente',
                teses: [{
                  tese_assunto:        t.tese_assunto || '',
                  fundamentacao_legal: t.fundamentacao_legal || '',
                  precedente_sumula:   t.referencia || '',
                  ratio_decidendi:     '',
                  aplicacao_pratica:   t.aplicacao_pratica || '',
                }],
                criado_por: null,
              })
            }
            novos.push({ numero: num, teses: parsed.teses.length })
          }
        } catch (err) {
          resultado.erros.push({ tribunal: sigla, numero: num, erro: err.message })
        }
      }

      await supabase.from('radar_informativos').upsert({
        tribunal: sigla,
        ultimo_numero: fim,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: 'tribunal' })

      resultado.processados.push({ tribunal: sigla, novos, ultimoAnterior: ultimoSalvo, ultimoAtual: fim })

    } catch (err) {
      resultado.erros.push({ tribunal: sigla, erro: err.message })
    }
  }

  const totalTeses = resultado.processados
    .flatMap(p => p.novos || [])
    .reduce((acc, n) => acc + (n.teses || 0), 0)

  if (totalTeses > 0 && ADMIN_EMAIL && process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Lex.IA Radar <radar@lexiajur.com.br>',
        to: ADMIN_EMAIL,
        subject: `Lex.IA · Radar de Informativos — ${totalTeses} novas teses`,
        html: `
          <h2>Radar de Informativos STJ + STF</h2>
          <p>${totalTeses} teses novas foram adicionadas ao repositório com status <b>IA · Pendente de revisão</b>.</p>
          <ul>
            ${resultado.processados.map(p =>
              (p.novos || []).map(n =>
                `<li><b>${p.tribunal}</b> Informativo nº ${n.numero} — ${n.teses} teses</li>`
              ).join('')
            ).join('')}
          </ul>
          <p>Acesse o repositório para revisar: <a href="https://reposit-rio-jur-dico.vercel.app">Lex.IA</a></p>
        `
      })
    })
  }

  return res.status(200).json(resultado)
}fix: auth radar admin
