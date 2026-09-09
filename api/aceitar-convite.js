import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Falha corrigida: antes, user_id vinha direto do corpo da requisição,
  // sem checar quem estava chamando o endpoint — qualquer pessoa com um
  // link de convite válido (mesmo endereçado a outra pessoa) conseguia
  // inserir QUALQUER user_id à sua escolha, potencialmente virando admin
  // em nome de outra conta. Agora exige o token de sessão de verdade, e
  // usa o user_id/e-mail verificados por ele, nunca o que vem no body.
  const authHeader = req.headers.authorization?.replace('Bearer ', '')
  if (!authHeader) return res.status(401).json({ error: 'Não autenticado.' })

  const { token, nome, telefone } = req.body
  if (!token) return res.status(400).json({ error: 'Dados incompletos.' })

  // Service role — bypassa RLS para inserir o novo membro
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })
  const user_id = user.id
  const email = user.email

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
    telefone: telefone || null,
    email: email || convite.email || null,
    invited_by: convite.invited_by,
  })

  if (insertErr) return res.status(500).json({ error: insertErr.message })

  // 4. Marcar convite como aceito
  await supabase.from('convites').update({ status: 'aceito' }).eq('id', convite.id)

  return res.status(200).json({ ok: true, role: convite.role })
}
