// api/radar-v2.js — versao limpa sem cache
import { createClient } from "@supabase/supabase-js"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "metodo nao permitido" })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ""
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ""
  const SUPA_URL = process.env.SUPABASE_URL || ""

  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY ausente" })
  if (!SERVICE_KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_KEY ausente" })
  if (!SUPA_URL) return res.status(500).json({ error: "SUPABASE_URL ausente" })

  const userId = req.body?.user_id
  if (!userId) return res.status(400).json({ error: "user_id ausente" })

  const supabase = createClient(SUPA_URL, SERVICE_KEY)

  const { data: membro, error: membroErr } = await supabase
    .from("membros").select("role").eq("user_id", userId).single()

  if (membroErr || !membro) {
    return res.status(401).json({ error: "usuario nao encontrado", detalhe: membroErr?.message, code: membroErr?.code })
  }

  if (membro.role !== "admin") return res.status(403).json({ error: "apenas admins" })

  const { data: statusAtual } = await supabase
    .from("radar_informativos").select("tribunal, ultimo_numero")

  const ultimoSTJ = statusAtual?.find(r => r.tribunal === "STJ")?.ultimo_numero || 0
  const ultimoSTF = statusAtual?.find(r => r.tribunal === "STF")?.ultimo_numero || 0

  const prompt = "Pesquise os informativos juridicos mais recentes do STJ (apos no " + ultimoSTJ + ") e STF (apos no " + ultimoSTF + "). Ate 3 por tribunal. Para cada: numero, data_publicacao, teses [{ementa, area_direito, tipo_decisao}]. Responda SOMENTE JSON valido: {STJ:[...],STF:[...]}. Array vazio se nao houver novos."

  let claudeData
  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }]
      })
    })
    if (!claudeRes.ok) {
      const raw = await claudeRes.text()
      return res.status(500).json({ error: "Anthropic HTTP " + claudeRes.status, detalhe: raw.slice(0, 200) })
    }
    claudeData = await claudeRes.json()
  } catch (e) {
    return res.status(500).json({ error: "Erro de rede Anthropic", detalhe: e.message })
  }

  const textBlock = claudeData.content?.find(b => b.type === "text")
  if (!textBlock?.text) return res.status(500).json({ error: "Sem texto na resposta Anthropic" })

  let informativos
  try {
    informativos = JSON.parse(textBlock.text.replace(/```json
?/g,"").replace(/```
?/g,"").trim())
  } catch {
    return res.status(500).json({ error: "JSON invalido", resposta: textBlock.text.slice(0,300) })
  }

  const resultados = [], erros = []
  for (const tribunal of ["STJ","STF"]) {
    const ultimo = tribunal === "STJ" ? ultimoSTJ : ultimoSTF
    const novos = (informativos[tribunal] || []).filter(i => i.numero > ultimo)
    if (!novos.length) { resultados.push({ tribunal, novos: [], mensagem: "Sem novos" }); continue }
    const maiorNumero = Math.max(...novos.map(i => i.numero))
    const { error: uErr } = await supabase.from("radar_informativos").upsert(
      { tribunal, ultimo_numero: maiorNumero, atualizado_em: new Date().toISOString() },
      { onConflict: "tribunal" }
    )
    if (uErr) erros.push({ tribunal, erro: uErr.message })
    resultados.push({ tribunal, novos: novos.map(i => ({ numero: i.numero, teses: i.teses?.length || 0 })) })
  }

  return res.status(200).json({ success: true, processados: resultados, erros: erros.length ? erros : undefined })
}
