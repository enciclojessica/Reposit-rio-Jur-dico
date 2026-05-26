import { createClient } from '@supabase/supabase-js'

// Vercel chama este endpoint via cron — protegido por CRON_SECRET
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificar secret do cron
  const secret = req.headers['authorization']?.replace('Bearer ', '')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Não autorizado.' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // Buscar todos os alertas ativos
  const { data: alertas, error } = await supabase
    .from('alertas').select('*').eq('ativo', true)

  if (error) return res.status(500).json({ error: error.message })
  if (!alertas?.length) return res.status(200).json({ ok: true, processados: 0 })

  // Agrupar por email para enviar um único e-mail por usuário
  const porEmail = {}
  for (const a of alertas) {
    if (!porEmail[a.email]) porEmail[a.email] = []
    porEmail[a.email].push(a)
  }

  let enviados = 0
  const erros  = []

  for (const [email, temasDoUsuario] of Object.entries(porEmail)) {
    try {
      // Pesquisar cada tema via Claude com web search
      const resultadosPorTema = []

      for (const alerta of temasDoUsuario) {
        const res2 = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/pesquisa-juri`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: alerta.tema, tribunal: alerta.tribunal }),
        })
        const json = await res2.json()

        if (json.resultados?.length) {
          resultadosPorTema.push({
            tema: alerta.tema,
            tribunal: alerta.tribunal,
            resultados: json.resultados.slice(0, 3), // máx. 3 por tema
          })
        }

        // Atualizar ultima_verificacao
        await supabase.from('alertas')
          .update({ ultima_verificacao: new Date().toISOString() })
          .eq('id', alerta.id)
      }

      if (!resultadosPorTema.length) continue

      // Montar HTML do e-mail
      const html = montarEmail(email, resultadosPorTema)

      // Enviar via Resend
      const envio = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Repositório Jurídico <alertas@repositoriojuridico.com.br>',
          to: [email],
          subject: `📋 Atualização jurisprudencial — ${new Date().toLocaleDateString('pt-BR')}`,
          html,
        }),
      })

      if (envio.ok) enviados++
      else erros.push({ email, status: envio.status })

    } catch (err) {
      erros.push({ email, err: err.message })
    }
  }

  return res.status(200).json({ ok: true, enviados, erros })
}

function montarEmail(email, resultadosPorTema) {
  const linhasTemas = resultadosPorTema.map(({ tema, tribunal, resultados }) => {
    const linhasResultados = resultados.map(r => `
      <div style="border-left:3px solid #c9a452;padding:10px 14px;margin-bottom:10px;background:#1a2236;border-radius:0 6px 6px 0;">
        <div style="font-size:11px;color:#6b7fa3;margin-bottom:4px;font-family:monospace;">
          ${r.tribunal || ''} ${r.numero ? '· ' + r.numero : ''} ${r.data ? '· ' + r.data : ''}
          ${r.relator ? '· Rel. ' + r.relator : ''}
        </div>
        <div style="font-size:13px;color:#e8dfc8;line-height:1.6;margin-bottom:6px;">
          ${r.ementa?.slice(0, 300)}${r.ementa?.length > 300 ? '...' : ''}
        </div>
        ${r.url ? `<a href="${r.url}" style="font-size:11px;color:#c9a452;text-decoration:none;">↗ Acessar decisão</a>` : ''}
      </div>
    `).join('')

    const filtro = tribunal !== 'todos' ? ` · Filtro: ${tribunal}` : ''
    return `
      <div style="margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:#c9a452;font-family:'IBM Plex Mono',monospace;
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;
                    border-bottom:1px solid #1e2d45;padding-bottom:8px;">
          ${tema}${filtro}
        </div>
        ${linhasResultados}
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#0b0f1a;font-family:'IBM Plex Mono',monospace;">
      <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

        <!-- Cabeçalho -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;
                      font-weight:700;color:#c9a452;margin-bottom:4px;">
            Repositório Jurídico
          </div>
          <div style="font-size:11px;color:#6b7fa3;text-transform:uppercase;letter-spacing:2px;">
            Atualização Semanal · ${new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
          </div>
        </div>

        <!-- Intro -->
        <div style="font-size:13px;color:#6b7fa3;margin-bottom:24px;line-height:1.6;
                    padding:14px;background:#111827;border-radius:8px;
                    border-left:3px solid #c9a452;">
          Encontramos novas decisões relevantes para os temas que você monitora.
          Revise, importe para o repositório ou descarte conforme necessário.
        </div>

        <!-- Resultados por tema -->
        ${linhasTemas}

        <!-- Rodapé -->
        <div style="border-top:1px solid #1e2d45;padding-top:20px;margin-top:8px;
                    font-size:11px;color:#6b7fa3;text-align:center;line-height:1.7;">
          Você recebe este e-mail porque cadastrou alertas no Repositório Jurídico.<br>
          <a href="https://reposit-rio-jur-dico.vercel.app" style="color:#c9a452;text-decoration:none;">
            Acessar o repositório
          </a>
        </div>
      </div>
    </body>
    </html>
  `
}
