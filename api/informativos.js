// api/informativos.js — Lex.IA
// Busca informativos jurisprudenciais do STF e STJ
// Query params: tribunal (STF|STJ), edicao (opcional)
import { ANTHROPIC_MODEL } from '../lib/anthropicModel.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada.' })

  const tribunal = (req.query.tribunal || 'STF').toUpperCase()
  const edicao   = req.query.edicao?.trim() || ''

  if (!['STF', 'STJ'].includes(tribunal)) {
    return res.status(400).json({ error: 'tribunal deve ser STF ou STJ' })
  }

  const edicaoClause = edicao
    ? `Traga a edição número ${edicao} do Informativo ${tribunal}.`
    : `Traga o informativo mais recente disponível do ${tribunal}.`

  const prompt = `Você é um assistente jurídico. ${edicaoClause}
Use a ferramenta de busca para encontrar o informativo REAL no portal oficial:
- STF: https://portal.stf.jus.br/textos/verTexto.asp?servico=informativoSTF
- STJ: https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias-antigas/Informativos.aspx

Responda SOMENTE com JSON válido no formato:
{
  "tribunal": "${tribunal}",
  "edicao": "número da edição",
  "data": "YYYY-MM-DD",
  "url_fonte": "URL do portal oficial",
  "decisoes": [
    {
      "titulo": "Título da decisão",
      "tese": "Tese jurídica em 2-3 linhas",
      "orgao": "Turma ou Plenário",
      "numero": "Número do processo ou informativo",
      "relator": "Nome do relator",
      "fundamentacao": "Arts. relevantes ou temas",
      "area": "Cível|Penal|Trabalhista|Tributário|Constitucional|Administrativo",
      "url": "link direto se disponível"
    }
  ]
}`

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 4000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const raw = await claudeRes.text()
      console.error('[informativos] Anthropic HTTP', claudeRes.status, raw.slice(0, 300))
      return res.status(500).json({ error: `Falha na API: HTTP ${claudeRes.status}` })
    }

    const data = await claudeRes.json()
    const textBlocks = data.content?.filter(b => b.type === 'text') || []
    const textBlock = textBlocks[textBlocks.length - 1]  // último bloco — após o web_search
    if (!textBlock?.text) {
      return res.status(500).json({ error: 'Resposta sem bloco de texto' })
    }

    let parsed
    try {
      let clean = textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      // Remover qualquer texto explicativo antes/depois do JSON
      const inicioJson = clean.indexOf('{')
      const fimJson = clean.lastIndexOf('}')
      if (inicioJson >= 0 && fimJson > inicioJson) clean = clean.slice(inicioJson, fimJson + 1)
      parsed = JSON.parse(clean)
    } catch {
      console.error('[informativos] JSON inválido:', textBlock.text.slice(0, 300))
      return res.status(500).json({ error: 'Não foi possível estruturar o informativo.' })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('[informativos] Erro:', err)
    return res.status(500).json({ error: err.message })
  }
}
