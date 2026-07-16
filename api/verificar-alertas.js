// api/verificar-alertas.js — Lex.IA
// Radar de Atualizações: varre os alertas ativos, pesquisa jurisprudência
// nova via /api/pesquisa-juri e envia um e-mail semanal por usuário via
// Resend. Disparado pelo Vercel Cron (ver vercel.json) — protegido por
// CRON_SECRET, não é chamável publicamente sem o segredo.
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Autenticação: CRON_SECRET (disparo automático) OU admin logado (teste manual)
  const secret = req.headers['authorization']?.replace('Bearer ', '')
  const isCron = process.env.CRON_SECRET && secret === process.env.CRON_SECRET

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  if (!isCron) {
    if (!secret) return res.status(401).json({ error: 'Não autorizado.' })
    const { data: { user }, error: authErr } = await supabase.auth.getUser(secret)
    if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })
    const { data: membro } = await supabase.from('membros').select('role').eq('user_id', user.id).single()
    if (membro?.role !== 'admin') return res.status(403).json({ error: 'Somente administradores podem disparar o radar manualmente.' })
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY não configurada.' })
  }

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

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
    console.log(`[verificar-alertas] Processando ${temasDoUsuario.length} tema(s) para ${email}...`)
    try {
      const resultadosPorTema = []

      for (const alerta of temasDoUsuario) {
        const res2 = await fetch(`${baseUrl}/api/pesquisa-juri`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
          },
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

        await supabase.from('alertas')
          .update({ ultima_verificacao: new Date().toISOString() })
          .eq('id', alerta.id)
      }

      if (!resultadosPorTema.length) {
        console.log(`[verificar-alertas] ${email}: nenhum resultado novo para os temas monitorados.`)
        continue
      }

      const html = montarEmail(resultadosPorTema)

      const envio = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Lex.IA <alertas@lexiajur.com.br>',
          to: [email],
          subject: `Atualização jurisprudencial — ${new Date().toLocaleDateString('pt-BR')}`,
          html,
        }),
      })

      if (envio.ok) {
        console.log(`[verificar-alertas] E-mail enviado com sucesso para ${email}.`)
        enviados++
        const resumoTemas = resultadosPorTema.map(t => t.tema).join(', ')
        const totalDecisoes = resultadosPorTema.reduce((s, t) => s + t.resultados.length, 0)
        const { data: alertasUsuario } = await supabase
          .from('alertas').select('user_id').eq('email', email).limit(1)
        const uid = alertasUsuario?.[0]?.user_id
        if (uid) {
          await supabase.from('notificacoes').insert({
            user_id: uid,
            tipo: 'alerta',
            titulo: `${totalDecisoes} nova(s) decisão(ões) para seus alertas`,
            corpo: `Temas monitorados com novidades: ${resumoTemas}`,
            dados: { temas: resultadosPorTema.map(t => t.tema), total: totalDecisoes },
          })
        }
      } else {
        const erroTexto = await envio.text().catch(() => '')
        console.error(`[verificar-alertas] Resend recusou o envio para ${email}: HTTP ${envio.status} — ${erroTexto.slice(0, 500)}`)
        erros.push({ email, status: envio.status, detalhe: erroTexto.slice(0, 300) })
      }

    } catch (err) {
      erros.push({ email, err: err.message })
    }
  }

  // ── Auto-importar informativos relevantes (STF e STJ) ──────────────────
  try {
    const { data: todasEntradas } = await supabase.from('entradas').select('area,tema,fonte,teses,tags').limit(80)
    const { data: admins } = await supabase.from('membros').select('user_id').eq('role', 'admin').limit(1)
    const adminId = admins?.[0]?.user_id

    if (adminId && todasEntradas?.length) {
      for (const tribunal of ['STF', 'STJ']) {
        await fetch(`${baseUrl}/api/auto-importar-informativos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            tribunal,
            entradas: todasEntradas,
            user_id: adminId,
            modo: 'cron',
          }),
        })
      }
    }
  } catch (err) {
    erros.push({ cron: 'auto-importar', err: err.message })
  }

  console.log(`[verificar-alertas] Concluído — ${enviados} e-mail(s) enviado(s), ${erros.length} erro(s).`)
  return res.status(200).json({ ok: true, enviados, erros })
}

function montarEmail(resultadosPorTema) {
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
        ${r.url ? `<a href="${r.url}" style="font-size:11px;color:#c9a452;text-decoration:none;">Acessar decisão &rarr;</a>` : ''}
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

        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;
                      font-weight:700;color:#c9a452;margin-bottom:4px;">
            Lex.IA
          </div>
          <div style="font-size:11px;color:#6b7fa3;text-transform:uppercase;letter-spacing:2px;">
            Radar de Atualizações · ${new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
          </div>
        </div>

        <div style="font-size:13px;color:#6b7fa3;margin-bottom:24px;line-height:1.6;
                    padding:14px;background:#111827;border-radius:8px;
                    border-left:3px solid #c9a452;">
          Encontramos novas decisões relevantes para os temas que você monitora.
          Revise, importe para o repositório ou descarte conforme necessário.
        </div>

        ${linhasTemas}

        <div style="border-top:1px solid #1e2d45;padding-top:20px;margin-top:8px;
                    font-size:11px;color:#6b7fa3;text-align:center;line-height:1.7;">
          Você recebe este e-mail porque cadastrou alertas no Lex.IA.<br>
          <a href="https://lexiajur.com.br" style="color:#c9a452;text-decoration:none;">
            Acessar o Lex.IA
          </a>
        </div>
      </div>
    </body>
    </html>
  `
}
