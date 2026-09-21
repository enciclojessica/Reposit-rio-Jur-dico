import { createClient } from '@supabase/supabase-js'

// Hierarquia de papéis: um convite só pode elevar o papel, nunca rebaixar.
const NIVEL = { leitor: 0, editor: 1, admin: 2 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // A identidade vem sempre do token de sessão verificado, nunca do corpo.
  const authHeader = req.headers.authorization?.replace('Bearer ', '')
  if (!authHeader) return res.status(401).json({ error: 'Não autenticado.' })

  const { token, nome, telefone } = req.body || {}
  if (!token || typeof token !== 'string') return res.status(400).json({ error: 'Dados incompletos.' })

  // Service role: bypassa RLS para gravar o membro.
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

  const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })
  const user_id = user.id
  const email = user.email

  // 1. Buscar e validar o convite
  const { data: convite, error: conviteErr } = await supabase
    .from('convites').select('*').eq('token', token).eq('status', 'pendente').single()
  if (conviteErr || !convite) {
    return res.status(404).json({ error: 'Convite inválido ou já utilizado.' })
  }
  if (!convite.expires_at || new Date(convite.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Convite expirado.' })
  }

  // 2. Convite endereçado a um e-mail só vale para a conta desse e-mail.
  if (convite.email && (email || '').trim().toLowerCase() !== convite.email.trim().toLowerCase()) {
    return res.status(403).json({ error: 'Este convite foi emitido para outro e-mail.' })
  }

  // 3. Reserva atômica: só uma requisição consegue virar o convite de
  // "pendente" para "aceito". Impede uso duplo em chamadas paralelas.
  const { data: reservado } = await supabase
    .from('convites').update({ status: 'aceito' })
    .eq('id', convite.id).eq('status', 'pendente').select('id')
  if (!reservado || reservado.length === 0) {
    return res.status(409).json({ error: 'Convite já utilizado.' })
  }

  const desfazerReserva = () =>
    supabase.from('convites').update({ status: 'pendente' }).eq('id', convite.id)

  // 4. Já é membro (ex.: auto-cadastro como leitor): aplica o papel do convite
  // se for superior ao atual, em vez de descartá-lo.
  const { data: existente } = await supabase
    .from('membros').select('id, role').eq('user_id', user_id).maybeSingle()

  if (existente) {
    if ((NIVEL[convite.role] ?? 0) > (NIVEL[existente.role] ?? 0)) {
      const { error: upErr } = await supabase
        .from('membros').update({ role: convite.role, invited_by: convite.invited_by })
        .eq('user_id', user_id)
      if (upErr) {
        await desfazerReserva()
        return res.status(500).json({ error: 'Não foi possível aplicar o convite.' })
      }
      return res.status(200).json({ ok: true, role: convite.role, ja_membro: true })
    }
    return res.status(200).json({ ok: true, role: existente.role, ja_membro: true })
  }

  // 5. Novo membro
  const { error: insertErr } = await supabase.from('membros').insert({
    user_id,
    role: convite.role,
    nome: typeof nome === 'string' ? nome.slice(0, 120) : null,
    telefone: typeof telefone === 'string' ? telefone.slice(0, 30) : null,
    email: email || convite.email || null,
    invited_by: convite.invited_by,
  })
  if (insertErr) {
    await desfazerReserva()
    return res.status(500).json({ error: 'Não foi possível concluir o cadastro.' })
  }

  return res.status(200).json({ ok: true, role: convite.role })
}
