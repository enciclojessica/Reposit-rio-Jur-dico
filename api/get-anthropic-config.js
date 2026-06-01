// Repassa a ANTHROPIC_API_KEY para o browser de forma segura
// Qualquer usuario autenticado com sessao Supabase valida tem acesso
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id } = req.body || {}
  if (!user_id) return res.status(401).json({ error: 'Nao autenticado.' })

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY nao configurada.' })

  // Verificar se o user_id pertence a uma sessao ativa no Supabase
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  const { data: userData, error } = await supabase.auth.admin.getUserById(user_id)

  if (error || !userData?.user) {
    return res.status(403).json({ error: 'Sessao invalida.' })
  }

  return res.status(200).json({ key })
}
