import { createClient } from '@supabase/supabase-js'

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

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('alertas').select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ alertas: data })
  }

  if (req.method === 'POST') {
    const { tema, tribunal, email } = req.body
    if (!tema || !email) return res.status(400).json({ error: 'tema e email são obrigatórios.' })
    const tribunais = Array.isArray(tribunal) && tribunal.length ? tribunal : ['todos']
    const { data, error } = await supabase.from('alertas').insert({
      user_id: user.id, tema, tribunal: tribunais, email,
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
    const { id, ativo } = req.body
    const { error } = await supabase.from('alertas')
      .update({ ativo }).eq('id', id).eq('user_id', user.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
