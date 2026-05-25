import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, entradas } = await req.json()
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key não configurada.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const ctx = JSON.stringify(entradas.map((e: any) => ({
      area: e.area, tema: e.tema, tipo: e.tipo,
      fonte: e.fonte, referencia: e.referencia, teses: e.teses,
    })))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: 'Você é um assistente de prática jurídica. Dado um repositório de teses em JSON, selecione as mais relevantes para a peça indicada. Para cada tese: (1) tese/assunto, (2) fundamentação legal, (3) precedente, (4) como aplicar especificamente na peça. Técnico e objetivo. Markdown. Se faltar cobertura, aponte lacunas.',
        messages: [{ role: 'user', content: `Repositório:\n${ctx}\n\nPeça: ${query}` }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || 'Sem resposta.'

    return new Response(JSON.stringify({ result: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
