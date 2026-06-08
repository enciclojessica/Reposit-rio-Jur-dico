// api/radar-informativos.js v3-debug
import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "metodo nao permitido" })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
  const SUPA_URL = process.env.SUPABASE_URL

  const debug = {
    has_anthropic: !!ANTHROPIC_KEY,
    has_service_key: !!SERVICE_KEY,
    service_key_inicio: SERVICE_KEY ? SERVICE_KEY.slice(0,30) : "AUSENTE",
    has_url: !!SUPA_URL,
    body: req.body,
    user_id: req.body?.user_id,
    content_type: req.headers["content-type"],
  }

  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "sem ANTHROPIC_API_KEY", debug })
  if (!SERVICE_KEY) return res.status(500).json({ error: "sem SUPABASE_SERVICE_KEY", debug })

  const userId = req.body?.user_id
  if (!userId) return res.status(400).json({ error: "user_id ausente", debug })

  const supabase = createClient(SUPA_URL, SERVICE_KEY)
  const { data: membro, error: err } = await supabase
    .from("membros").select("role").eq("user_id", userId).single()

  if (err || !membro) {
    return res.status(401).json({ error: "usuario nao encontrado", debug, supa_err: err?.message, supa_code: err?.code })
  }

  if (membro.role !== "admin") return res.status(403).json({ error: "nao admin", debug })

  return res.status(200).json({ success: true, debug })
}
