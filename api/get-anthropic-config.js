// Repassa a ANTHROPIC_API_KEY para o browser de forma segura
// Só funciona para usuários autenticados via Supabase
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id } = req.body || {}
  if (!user_id) return res.status(401).json({ error: 'Não autenticado.' })

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  // Verificar se o user_id é válido no Supabase
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  const { data: membro } = await supabase
    .from('membros')
    .select('id')
    .eq('user_id', user_id)
    .single()

  if (!membro) return res.status(403).json({ error: 'Acesso não autorizado.' })

  return res.status(200).json({ key })
}
