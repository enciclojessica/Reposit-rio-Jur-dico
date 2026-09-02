// api/verificar-alertas.js — Themis Jur
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

  // Lacunas de cobertura — mesma lógica do card "Lacunas de cobertura" do
  // Dashboard (áreas com menos de 5 entradas). Calculado uma vez só, é dado
  // compartilhado do repositório, não muda por usuário.
  const AREAS_LISTA = [
    'Cível', 'Penal', 'Constitucional', 'Trabalhista', 'Tributário',
    'Administrativo', 'Consumidor', 'Família', 'Previdenciário',
    'Ambiental', 'Internacional', 'Digital',
  ]
  const { data: todasEntradas } = await supabase.from('entradas').select('area, teses, criado_por')
  const lacunas = AREAS_LISTA
    .map(area => ({ area, valor: (todasEntradas || []).filter(e => e.area === area).length }))
    .filter(l => l.valor < 5)

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
      const userId = temasDoUsuario[0]?.user_id
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

      // Flashcards pendentes de revisão — mesma lógica da tela Hoje/Dashboard
      let cardsPendentes = 0
      if (userId) {
        const { data: flashcardsUsuario } = await supabase
          .from('flashcards').select('entrada_id, proxima_revisao').eq('user_id', userId)
        const revisaoMap = {}
        ;(flashcardsUsuario || []).forEach(r => { revisaoMap[r.entrada_id] = r })
        const agora = new Date()
        cardsPendentes = (todasEntradas || [])
          .filter(e => Array.isArray(e.teses) && e.teses.some(t => t.tese_assunto?.trim()))
          .filter(e => {
            const r = revisaoMap[e.id]
            return !r || new Date(r.proxima_revisao) <= agora
          }).length
      }

      // Só envia se houver algo de fato novo/pendente — lacunas sozinhas não
      // disparam e-mail toda semana (é dado estático, viraria spam).
      if (!resultadosPorTema.length && !cardsPendentes) {
        console.log(`[verificar-alertas] ${email}: nada novo nem pendente esta semana.`)
        continue
      }

      const html = montarEmail(resultadosPorTema, { cardsPendentes, lacunas })

      const envio = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Themis Jur <alertas@themisjur.com.br>',
          to: [email],
          subject: resultadosPorTema.length
            ? `Atualização jurisprudencial — ${new Date().toLocaleDateString('pt-BR')}`
            : `Boletim semanal Themis Jur — ${new Date().toLocaleDateString('pt-BR')}`,
          html,
        }),
      })

      if (envio.ok) {
        console.log(`[verificar-alertas] E-mail enviado com sucesso para ${email}.`)
        enviados++
        const resumoTemas = resultadosPorTema.map(t => t.tema).join(', ')
        const totalDecisoes = resultadosPorTema.reduce((s, t) => s + t.resultados.length, 0)
        const titulo = totalDecisoes > 0
          ? `${totalDecisoes} nova(s) decisão(ões) para seus alertas`
          : `Boletim semanal: ${cardsPendentes} card(s) de flashcard pendente(s)`
        const corpo = totalDecisoes > 0
          ? `Temas monitorados com novidades: ${resumoTemas}`
          : 'Sem decisão nova esta semana, mas você tem flashcards pendentes de revisão.'
        const uid = userId
        if (uid) {
          await supabase.from('notificacoes').insert({
            user_id: uid,
            tipo: 'alerta',
            titulo,
            corpo,
            dados: { temas: resultadosPorTema.map(t => t.tema), total: totalDecisoes, cardsPendentes },
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

  // ── Importação de informativos NÃO faz mais parte do disparo automático ──
  // Decisão de custo (16/07/2026): rodava toda semana sem necessariamente
  // ter novidade relevante, gastando 2 chamadas de IA com busca na web por
  // disparo. Continua disponível manualmente em Importar > Informativos.

  console.log(`[verificar-alertas] Concluído — ${enviados} e-mail(s) enviado(s), ${erros.length} erro(s).`)
  return res.status(200).json({ ok: true, enviados, erros })
}

function montarEmail(resultadosPorTema, { cardsPendentes = 0, lacunas = [] } = {}) {
  const linhasTemas = resultadosPorTema.map(({ tema, tribunal, resultados }) => {
    const linhasResultados = resultados.map(r => `
      <div style="border-left:3px solid #c9a452;padding:10px 14px;margin-bottom:10px;background:#ffffff;border:1px solid #e8e3dc;border-left:3px solid #c9a452;border-radius:0 6px 6px 0;">
        <div style="font-size:11px;color:#736b62;margin-bottom:4px;font-family:monospace;">
          ${r.tribunal || ''} ${r.numero ? '· ' + r.numero : ''} ${r.data ? '· ' + r.data : ''}
          ${r.relator ? '· Rel. ' + r.relator : ''}
        </div>
        <div style="font-size:13px;color:#2c241b;line-height:1.6;margin-bottom:6px;">
          ${r.ementa?.slice(0, 300)}${r.ementa?.length > 300 ? '...' : ''}
        </div>
        ${r.url ? `<a href="${r.url}" style="font-size:11px;color:#800020;text-decoration:none;">Acessar decisão &rarr;</a>` : ''}
      </div>
    `).join('')

    const tribunais = Array.isArray(tribunal) ? tribunal : (tribunal ? [tribunal] : ['todos'])
    const filtro = tribunais.length && !tribunais.includes('todos') ? ` · Filtro: ${tribunais.join(', ')}` : ''
    return `
      <div style="margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:#800020;font-family:'IBM Plex Mono',monospace;
                    text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;
                    border-bottom:1px solid #e8e3dc;padding-bottom:8px;">
          ${tema}${filtro}
        </div>
        ${linhasResultados}
      </div>
    `
  }).join('')

  const secaoPendencias = cardsPendentes > 0 ? `
    <div style="margin-bottom:28px;">
      <div style="font-size:13px;font-weight:700;color:#800020;font-family:'IBM Plex Mono',monospace;
                  text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;
                  border-bottom:1px solid #e8e3dc;padding-bottom:8px;">
        Pendências desta semana
      </div>
      <div style="border-left:3px solid #c9a452;padding:10px 14px;background:#ffffff;border:1px solid #e8e3dc;border-left:3px solid #c9a452;border-radius:0 6px 6px 0;">
        <div style="font-size:13px;color:#2c241b;line-height:1.6;">
          ${cardsPendentes} card${cardsPendentes !== 1 ? 's' : ''} de flashcard${cardsPendentes !== 1 ? 's' : ''} pendente${cardsPendentes !== 1 ? 's' : ''} de revisão, gerado${cardsPendentes !== 1 ? 's' : ''} a partir das teses do seu repositório.
        </div>
      </div>
    </div>
  ` : ''

  const secaoLacunas = lacunas.length > 0 ? `
    <div style="margin-bottom:28px;">
      <div style="font-size:13px;font-weight:700;color:#800020;font-family:'IBM Plex Mono',monospace;
                  text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;
                  border-bottom:1px solid #e8e3dc;padding-bottom:8px;">
        Lacunas de cobertura
      </div>
      <div style="border-left:3px solid #b45309;padding:10px 14px;background:#ffffff;border:1px solid #e8e3dc;border-left:3px solid #b45309;border-radius:0 6px 6px 0;">
        <div style="font-size:13px;color:#2c241b;line-height:1.8;">
          ${lacunas.map(l => `${l.area} <span style="color:#736b62;">(${l.valor} entrada${l.valor !== 1 ? 's' : ''})</span>`).join('<br>')}
        </div>
      </div>
    </div>
  ` : ''

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f5f1ea;font-family:'IBM Plex Mono',monospace;">
      <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

        <div style="text-align:center;margin-bottom:32px;">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;
                      font-weight:700;color:#800020;margin-bottom:4px;">
            Themis Jur
          </div>
          <div style="font-size:11px;color:#736b62;text-transform:uppercase;letter-spacing:2px;">
            Boletim Semanal · ${new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
          </div>
        </div>

        <div style="font-size:13px;color:#4a3f35;margin-bottom:24px;line-height:1.6;
                    padding:14px;background:#ffffff;border:1px solid #e8e3dc;border-radius:8px;
                    border-left:3px solid #800020;">
          ${resultadosPorTema.length
            ? 'Encontramos novas decisões relevantes para os temas que você monitora. Revise, importe para o repositório ou descarte conforme necessário.'
            : 'Nenhuma decisão nova esta semana para os temas monitorados, mas veja o que está pendente abaixo.'}
        </div>

        ${secaoPendencias}
        ${secaoLacunas}
        ${linhasTemas}

        <div style="border-top:1px solid #e8e3dc;padding-top:20px;margin-top:8px;
                    font-size:11px;color:#736b62;text-align:center;line-height:1.7;">
          Você recebe este e-mail porque cadastrou alertas no Themis Jur.<br>
          <a href="https://themisjur.com.br" style="color:#800020;text-decoration:none;">
            Acessar o Themis Jur
          </a>
        </div>
      </div>
    </body>
    </html>
  `
}
