// Proxy Anthropic — usado por Busca para Peça, Editor, Busca Semântica e Extração de Documentos
// A chave da Anthropic NUNCA sai do servidor. O cliente autentica com o JWT do Supabase.
import { createClient } from '@supabase/supabase-js'
import { checarRateLimit } from '../lib/rateLimit.js'
import { ANTHROPIC_MODEL, ANTHROPIC_MODEL_RAPIDO } from '../lib/anthropicModel.js'

const MODELOS_PERMITIDOS = [ANTHROPIC_MODEL, ANTHROPIC_MODEL_RAPIDO]
const MAX_TOKENS_TETO = 10000 // maior uso legítimo hoje é 8000 (ExtrairPeticao); dá folga sem deixar em aberto

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // ── Autenticar via JWT do Supabase enviado no header ──────────────────
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Não autenticado.' })

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token inválido ou expirado.' })

  const { permitido } = await checarRateLimit(supabase, user.id, 'busca', { limite: 30, janelaMs: 5 * 60_000 })
  if (!permitido) return res.status(429).json({ error: 'Muitas requisições. Aguarde alguns minutos e tente novamente.' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  // 'beta' é um campo de controle nosso, não vai no corpo enviado à Anthropic
  const { beta, ...body } = req.body || {}

  if (!MODELOS_PERMITIDOS.includes(body.model)) {
    return res.status(400).json({ error: 'Modelo não permitido.' })
  }
  if (typeof body.max_tokens === 'number' && body.max_tokens > MAX_TOKENS_TETO) {
    body.max_tokens = MAX_TOKENS_TETO
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  }
  if (beta) headers['anthropic-beta'] = beta

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
