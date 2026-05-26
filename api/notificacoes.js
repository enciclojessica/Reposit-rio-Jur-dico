import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido.' })

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

  return res.status(405).json({ error: 'Method not allowed' })
}
