import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { codigo, numero, q } = req.query

  // Busca por comando: /cpc 300
  if (codigo && numero) {
    const { data, error } = await supabase
      .from('legislacao')
      .select('*')
      .eq('codigo', codigo.toLowerCase())
      .eq('numero', parseInt(numero))
      .eq('vigente', true)
      .order('inciso', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ artigos: data || [] })
  }

  // Busca textual: /leg responsabilidade civil
  if (q) {
    const { data, error } = await supabase
      .from('legislacao')
      .select('*')
      .textSearch('texto', q, { type: 'websearch', config: 'portuguese' })
      .eq('vigente', true)
      .limit(8)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ artigos: data || [] })
  }

  // Listar códigos disponíveis
  const { data, error } = await supabase
    .from('legislacao')
    .select('codigo')
    .eq('vigente', true)

  if (error) return res.status(500).json({ error: error.message })

  const codigos = [...new Set((data || []).map(d => d.codigo))]
  const counts = {}
  for (const cod of codigos) {
    counts[cod] = (data || []).filter(d => d.codigo === cod).length
  }

  return res.status(200).json({ codigos: counts })
}
