import { createClient } from '@supabase/supabase-js'
import { checarRateLimit } from '../lib/rateLimit.js'

export default async function handler(req, res) {
  // Autenticar via JWT do Supabase enviado no header
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // Verificar usuário pelo token
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido.' })

  const { permitido } = await checarRateLimit(supabase, { userId: user.id }, 'alertas', { limite: 30, janelaMs: 60_000 })
  if (!permitido) return res.status(429).json({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('alertas').select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ alertas: data })
  }

  if (req.method === 'POST') {
    const { tema, tribunal } = req.body || {}
    if (typeof tema !== 'string' || !tema.trim()) return res.status(400).json({ error: 'tema é obrigatório.' })
    if (tema.length > 200) return res.status(400).json({ error: 'tema muito longo (máx. 200 caracteres).' })
    // O alerta só pode ser enviado ao e-mail da própria conta: aceitar um
    // e-mail arbitrário permitiria usar o domínio para spam contra terceiros.
    if (!user.email) return res.status(400).json({ error: 'Conta sem e-mail verificado.' })
    const tribunais = (Array.isArray(tribunal) ? tribunal : [])
      .filter(t => typeof t === 'string' && t.length <= 20).slice(0, 10)
    const { count } = await supabase.from('alertas')
      .select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((count ?? 0) >= 20) return res.status(400).json({ error: 'Limite de 20 alertas por conta.' })
    const { data, error } = await supabase.from('alertas').insert({
      user_id: user.id, tema: tema.trim(), tribunal: tribunais.length ? tribunais : ['todos'], email: user.email,
    }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ alerta: data })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'id obrigatório.' })
    const { error } = await supabase.from('alertas')
      .delete().eq('id', id).eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'PATCH') {
    // Ativar/desativar
    const { id, ativo } = req.body || {}
    if (!id || typeof ativo !== 'boolean') return res.status(400).json({ error: 'id e ativo (booleano) são obrigatórios.' })
    const { error } = await supabase.from('alertas')
      .update({ ativo }).eq('id', id).eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
