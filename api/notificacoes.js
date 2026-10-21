import { createClient } from '@supabase/supabase-js'
import { checarRateLimit } from '../lib/rateLimit.js'
import { montarEmailCadastroPendente } from '../lib/emailCadastroPendente.js'

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido.' })

  const { permitido } = await checarRateLimit(supabase, { userId: user.id }, 'notificacoes', { limite: 60, janelaMs: 60_000 })
  if (!permitido) return res.status(429).json({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' })

  // GET — listar notificações
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('notificacoes').select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(50)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ notificacoes: data })
  }

  // PATCH — marcar como lida(s)
  if (req.method === 'PATCH') {
    const { id, todas } = req.body
    const query = supabase.from('notificacoes').update({ lida: true }).eq('user_id', user.id)
    if (!todas) query.eq('id', id)
    const { error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // DELETE — apagar notificação
  if (req.method === 'DELETE') {
    const { id } = req.body
    const { error } = await supabase.from('notificacoes').delete().eq('id', id).eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  // POST: a própria pessoa avisa que acabou de se cadastrar e ficou aguardando aprovação. A identidade vem do token;
  // o aviso sai uma vez por cadastro (membros.notificado_em) e só para cadastro ainda não aprovado.
  if (req.method === 'POST') {
    if ((req.body || {}).acao !== 'novo_cadastro') return res.status(400).json({ error: 'Ação inválida.' })

    const { data: reservado } = await supabase
      .from('membros').update({ notificado_em: new Date().toISOString() })
      .eq('user_id', user.id).eq('aprovado', false).is('notificado_em', null)
      .select('nome, email, telefone')
    if (!reservado || reservado.length === 0) return res.status(200).json({ ok: true, notificado: false })
    const novo = reservado[0]

    const { data: admins } = await supabase
      .from('membros').select('user_id, email').eq('role', 'admin').eq('aprovado', true)
    const destinatarios = (admins || []).filter(a => a.user_id)

    // Notificação no sino de cada admin.
    if (destinatarios.length) {
      await supabase.from('notificacoes').insert(destinatarios.map(a => ({
        user_id: a.user_id,
        tipo: 'cadastro',
        titulo: 'Novo cadastro aguardando aprovação',
        corpo: `${novo.nome || 'Sem nome'} (${novo.email || 'sem e-mail'})`,
        dados: { email: novo.email },
      })))
    }

    // E-mail pelo Resend (mesmo remetente do Radar). Falha de envio não derruba o cadastro: a notificação do sino já saiu.
    let emailEnviado = false
    const emails = destinatarios.map(a => a.email).filter(Boolean)
    if (process.env.RESEND_API_KEY && emails.length) {
      try {
        const envio = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Themis Jur <alertas@themisjur.com.br>',
            to: emails,
            subject: 'Novo cadastro aguardando aprovação no Themis Jur',
            html: montarEmailCadastroPendente(novo),
          }),
        })
        emailEnviado = envio.ok
        if (!envio.ok) console.error(`[notificacoes] Resend recusou o aviso de cadastro: HTTP ${envio.status}`)
      } catch (err) {
        console.error('[notificacoes] Falha ao enviar o aviso de cadastro:', err.message)
      }
    }
    return res.status(200).json({ ok: true, notificado: true, email: emailEnviado })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
