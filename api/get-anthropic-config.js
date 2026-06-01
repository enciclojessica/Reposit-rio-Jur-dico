// Repassa a ANTHROPIC_API_KEY para o browser
// A sessao ja foi validada pelo Supabase Auth no frontend
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id } = req.body || {}
  if (!user_id) return res.status(401).json({ error: 'Nao autenticado.' })

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY nao configurada no servidor.' })

  return res.status(200).json({ key })
}
