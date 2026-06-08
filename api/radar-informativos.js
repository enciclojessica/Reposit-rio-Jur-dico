// api/radar-informativos.js v4-debug
import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ""
  const SUPA_URL = process.env.SUPABASE_URL || ""
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ""

  // Retornar debug independente do método ou body
  const debugInfo = {
    method: req.method,
    has_service_key: !!SERVICE_KEY,
    service_key_prefix: SERVICE_KEY.slice(0, 25),
    has_url: !!SUPA_URL,
    url_value: SUPA_URL,
    has_anthropic: !!ANTHROPIC_KEY,
    body: req.body,
    user_id: req.body?.user_id,
    content_type: req.headers["content-type"],
    host: req.headers["host"],
  }

  if (req.method !== "POST") {
    return res.status(200).json({ msg: "use POST", debug: debugInfo })
  }

  const userId = req.body?.user_id
  if (!userId) {
    return res.status(400).json({ error: "user_id ausente", debug: debugInfo })
  }

  const supabase = createClient(SUPA_URL, SERVICE_KEY)
  const { data, error } = await supabase
    .from("membros").select("role").eq("user_id", userId).single()

  return res.status(200).json({
    supabase_data: data,
    supabase_error: error?.message,
    supabase_code: error?.code,
    debug: debugInfo
  })
}
