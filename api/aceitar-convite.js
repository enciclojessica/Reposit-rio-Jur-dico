import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { token, user_id, email, nome } = req.body
  if (!token || !user_id) return res.status(400).json({ error: 'Dados incompletos.' })

  // Service role — bypassa RLS para inserir o novo membro
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  // 1. Buscar e validar convite
  const { data: convite, error: conviteErr } = await supabase
    .from('convites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pendente')
    .single()

  if (conviteErr || !convite) {
    return res.status(404).json({ error: 'Convite inválido ou já utilizado.' })
  }

  if (new Date(convite.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Convite expirado.' })
  }

  // 2. Verificar se usuário já é membro
  const { data: existente } = await supabase
    .from('membros')
    .select('id, role')
    .eq('user_id', user_id)
    .single()

  if (existente) {
    // Já é membro — marcar convite como aceito mesmo assim
    await supabase.from('convites').update({ status: 'aceito' }).eq('id', convite.id)
    return res.status(200).json({ ok: true, role: existente.role, ja_membro: true })
  }

  // 3. Inserir como membro
  const { error: insertErr } = await supabase.from('membros').insert({
    user_id,
    role: convite.role,
    nome: nome || null,
    email: email || convite.email || null,
    invited_by: convite.invited_by,
  })

  if (insertErr) return res.status(500).json({ error: insertErr.message })

  // 4. Marcar convite como aceito
  await supabase.from('convites').update({ status: 'aceito' }).eq('id', convite.id)

  return res.status(200).json({ ok: true, role: convite.role })
}
