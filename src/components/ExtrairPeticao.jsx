import { useState, useRef } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { Upload, FileText, Check, AlertCircle, RotateCcw } from 'lucide-react'

// Extrair texto de .docx no browser via JSZip + parse de XML
async function extrairTextoDocx(file) {
  const arrayBuffer = await file.arrayBuffer()

  if (!window._JSZip) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
    window._JSZip = window.JSZip
  }

  const zip = await window._JSZip.loadAsync(arrayBuffer)
  const xmlFile = zip.file('word/document.xml')
  if (!xmlFile) throw new Error('Arquivo Word inválido — word/document.xml ausente.')

  const xml = await xmlFile.async('text')
  const paragraphs = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const pNodes = doc.querySelectorAll('p')

  pNodes.forEach(p => {
    const textos = []
    p.querySelectorAll('t').forEach(t => {
      const txt = t.textContent?.trim()
      if (txt) textos.push(txt)
    })
    const linha = textos.join(' ').trim()
    if (linha) paragraphs.push(linha)
  })

  return paragraphs.join('\n').slice(0, 40000)
}

async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Fetch seguro: lê o corpo como texto antes do parse, expõe erro HTTP detalhado
async function fetchSeguro(url, opts) {
  const res = await fetch(url, opts)
  const texto = await res.text()

  if (!res.ok) {
    // Corpo pode ser HTML de erro (Nginx/Vercel) ou JSON com mensagem
    let detalhe = texto.slice(0, 300)
    try {
      const j = JSON.parse(texto)
      detalhe = j.error?.message || j.error || j.message || detalhe
    } catch {}
    throw new Error(`HTTP ${res.status} em ${url.split('?')[0]}: ${detalhe}`)
  }

  if (!texto || !texto.trim()) {
    throw new Error(`Resposta vazia de ${url.split('?')[0]} (HTTP ${res.status})`)
  }

  try {
    return JSON.parse(texto)
  } catch (e) {
    throw new Error(`JSON inválido de ${url.split('?')[0]}: ${e.message} — início da resposta: ${texto.slice(0, 120)}`)
  }
}

export default function ExtrairPeticao() {
  const { theme } = useTheme()
  const fileRef = useRef()
  const [etapa, setEtapa]         = useState('upload')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro]           = useState('')
  const [arquivo, setArquivo]     = useState(null)
  const [progresso, setProgresso] = useState('')

  async function processar() {
    if (!arquivo) return
    setEtapa('processando')
    setErro('')
    setProgresso('Verificando sessão...')

    try {
      // ── 1. Sessão ──────────────────────────────────────────────────────
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setErro('Sessão expirada. Faça login novamente.')
        setEtapa('erro'); return
      }

      // ── 2. API key via endpoint seguro ─────────────────────────────────
      setProgresso('Obtendo configuração da API...')
      let apiKey
      try {
        const keyJson = await fetchSeguro('/api/get-anthropic-config?t=' + Date.now(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store' },
          body: JSON.stringify({ user_id: session.user.id }),
        })
        apiKey = keyJson.key
        if (!apiKey) throw new Error('Chave não retornada pelo servidor.')
      } catch (e) {
        setErro('Falha ao obter configuração: ' + e.message)
        setEtapa('erro'); return
      }

      // ── 3. Preparar conteúdo do arquivo ────────────────────────────────
      const ext    = arquivo.name.split('.').pop().toLowerCase()
      const isDocx = ext === 'docx' || ext === 'doc'
      let userContent

      const SYSTEM = `Você é um Doutrinador e Estrategista Processual. Analise o documento e extraia conhecimento jurídico universal e abstrato, completamente desvinculado dos fatos concretos do caso.

REGRA ABSOLUTA: Jamais mencione fatos específicos do caso (partes, valores, eventos concretos). Todo conteúdo deve ser reutilizável em qualquer demanda futura.

Retorne SOMENTE um objeto JSON válido, sem markdown, sem código, sem texto antes ou depois:
{"meta":{"tipo_peca":"string","numero_processo":"string ou null","resultado":"string ou null"},"teses":[{"area":"Cível","tipo":"jurisprudência","tema":"string","fonte":"string","referencia":"string","tese_assunto":"string","fundamentacao_legal":"string","precedente_sumula":"string","ratio_decidendi":"string","aplicacao_pratica":"string"}],"artigos":[{"codigo":"cpc","numero":300,"inciso":null,"paragrafo":null,"texto":"string","aplicacao_pratica":"string","contexto":"string"}]}`

      if (isDocx) {
        setProgresso('Lendo o arquivo Word...')
        let texto
        try {
          texto = await extrairTextoDocx(arquivo)
        } catch (e) {
          setErro('Falha ao ler o .docx: ' + e.message)
          setEtapa('erro'); return
        }

        if (!texto || texto.trim().length < 30) {
          setErro('O arquivo Word não continha texto legível (extraído: ' + (texto?.length ?? 0) + ' caracteres). Tente converter para PDF.')
          setEtapa('erro'); return
        }

        console.log('[ExtrairPeticao] DOCX extraído:', texto.length, 'chars. Início:', texto.slice(0, 100))
        userContent = [{ type: 'text', text: `Extraia o conhecimento jurídico desta peça (${arquivo.name}). Retorne APENAS o JSON.\n\n${texto.slice(0, 40000)}` }]
        setProgresso('Texto extraído (' + texto.length + ' chars). Analisando com IA...')

      } else {
        // PDF
        if (arquivo.size > 10 * 1024 * 1024) {
          setErro('PDF muito grande (' + (arquivo.size / 1024 / 1024).toFixed(1) + ' MB). Limite: 10 MB.')
          setEtapa('erro'); return
        }

        setProgresso('Lendo o PDF (' + (arquivo.size / 1024).toFixed(0) + ' KB)...')
        let base64Data
        try {
          base64Data = await toBase64(arquivo)
        } catch (e) {
          setErro('Falha ao ler o PDF: ' + e.message)
          setEtapa('erro'); return
        }

        if (!base64Data || base64Data.length < 100) {
          setErro('PDF resultou em base64 vazio ou corrompido (' + (base64Data?.length ?? 0) + ' chars).')
          setEtapa('erro'); return
        }

        console.log('[ExtrairPeticao] PDF convertido para base64:', base64Data.length, 'chars')
        userContent = [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } },
          { type: 'text', text: `Extraia o conhecimento jurídico desta peça (${arquivo.name}). Retorne APENAS o JSON.` },
        ]
        setProgresso('PDF pronto. Enviando para análise — pode levar até 40 segundos...')
      }

      // ── 4. Chamar Claude diretamente no browser ────────────────────────
      console.log('[ExtrairPeticao] Chamando api.anthropic.com...')
      let claudeJson
      try {
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type':                              'application/json',
            'x-api-key':                                 apiKey,
            'anthropic-version':                         '2023-06-01',
            'anthropic-beta':                            'pdfs-2024-09-25',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model:      'claude-sonnet-4-20250514',
            max_tokens: 8000,
            system:     SYSTEM,
            messages:   [{ role: 'user', content: userContent }],
          }),
        })

        setProgresso('Processando resposta da IA...')
        const claudeRaw = await claudeRes.text()
        console.log('[ExtrairPeticao] Claude HTTP', claudeRes.status, '— resposta:', claudeRaw.length, 'chars. Início:', claudeRaw.slice(0, 200))

        if (!claudeRes.ok) {
          let detalhe = claudeRaw.slice(0, 300)
          try { detalhe = JSON.parse(claudeRaw)?.error?.message || detalhe } catch {}
          throw new Error(`Claude HTTP ${claudeRes.status}: ${detalhe}`)
        }

        if (!claudeRaw || !claudeRaw.trim()) {
          throw new Error('Claude retornou resposta vazia (possível timeout de rede no mobile).')
        }

        claudeJson = JSON.parse(claudeRaw)
        if (claudeJson.error) throw new Error('Claude API error: ' + (claudeJson.error.message || JSON.stringify(claudeJson.error)))

      } catch (e) {
        setErro('Falha na chamada à IA: ' + e.message)
        setEtapa('erro'); return
      }

      // ── 5. Extrair JSON do texto retornado ─────────────────────────────
      setProgresso('Interpretando resultado...')
      const rawText = (claudeJson.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      console.log('[ExtrairPeticao] Texto bruto do Claude:', rawText.length, 'chars. Início:', rawText.slice(0, 200))

      let dados
      try {
        dados = JSON.parse(rawText.trim())
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/)
        if (!match) {
          setErro('A IA não retornou JSON válido. Texto recebido: ' + rawText.slice(0, 200))
          setEtapa('erro'); return
        }
        try {
          dados = JSON.parse(match[0])
        } catch (e) {
          setErro('JSON malformado na resposta da IA: ' + e.message + ' — trecho: ' + match[0].slice(0, 150))
          setEtapa('erro'); return
        }
      }

      // ── 6. Persistir via endpoint leve ─────────────────────────────────
      setProgresso('Salvando no repositório...')
      let saveJson
      try {
        saveJson = await fetchSeguro('/api/salvar-extracao', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ dados, filename: arquivo.name, user_id: session.user.id }),
        })
      } catch (e) {
        setErro('Falha ao salvar no repositório: ' + e.message)
        setEtapa('erro'); return
      }

      console.log('[ExtrairPeticao] Salvo com sucesso:', saveJson)
      setResultado(saveJson)
      setEtapa('concluido')

    } catch (err) {
      console.error('[ExtrairPeticao] Erro não capturado:', err)
      setErro('Erro inesperado: ' + (err.message || String(err)))
      setEtapa('erro')
    }
  }

  function reiniciar() {
    setEtapa('upload'); setArquivo(null)
    setResultado(null); setErro(''); setProgresso('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const card = {
    background: theme.cardBg, border: `1px solid ${theme.border}`,
    borderRadius: 12, padding: 20, marginBottom: 16,
  }

  return (
    <div style={{ paddingBottom: 40, maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Extrair de Petição
        </div>
        <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
          Suba uma petição em PDF ou Word (.docx). O sistema extrai teses jurídicas e artigos e salva no repositório.
        </div>
      </div>

      {/* Upload */}
      {etapa === 'upload' && (
        <div style={{ ...card, borderStyle: arquivo ? 'solid' : 'dashed', textAlign: 'center', padding: 40 }}>
          {!arquivo ? (
            <>
              <div style={{ marginBottom: 12, opacity: 0.25, display: 'flex', justifyContent: 'center' }}>
                <Upload size={44} color={theme.gold} />
              </div>
              <div style={{ fontSize: 14, color: theme.text, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>
                Selecione a petição
              </div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
                PDF ou Word (.docx) · máx. 10 MB
              </div>
              <label style={{ background: theme.gold, color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
                + Selecionar arquivo
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc"
                  onChange={e => setArquivo(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </label>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                <FileText size={36} color={theme.gold} />
              </div>
              <div style={{ fontSize: 14, color: theme.text, fontWeight: 600, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                {arquivo.name}
              </div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
                {(arquivo.size / 1024).toFixed(0)} KB
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={reiniciar}
                  style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '9px 18px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Trocar
                </button>
                <button onClick={processar}
                  style={{ background: theme.gold, border: 'none', color: '#fff', borderRadius: 8, padding: '9px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Extrair e salvar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Processando */}
      {etapa === 'processando' && (
        <div style={{ ...card, textAlign: 'center', padding: 60 }}>
          <RotateCcw size={32} color={theme.gold}
            style={{ animation: 'spin 1.5s linear infinite', display: 'block', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: theme.text, marginBottom: 8, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            Analisando petição...
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
            {progresso}
          </div>
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif', opacity: 0.7 }}>
            Não saia desta tela durante o processamento.
          </div>
        </div>
      )}

      {/* Concluído */}
      {etapa === 'concluido' && resultado && (
        <div style={{ ...card, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Check size={20} color={theme.success} />
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>
              Extração concluída
            </div>
          </div>
          {resultado.meta?.tipo_peca && (
            <div style={{ background: theme.raised, borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: theme.text, fontFamily: 'Inter, sans-serif' }}>
              <span style={{ color: theme.muted }}>Tipo: </span>{resultado.meta.tipo_peca}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 100, background: theme.raised, border: `1px solid ${theme.success}44`, borderLeft: `3px solid ${theme.success}`, borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.success, fontFamily: 'Inter, sans-serif' }}>
                {resultado.teses_salvas ?? 0}
              </div>
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>tese(s) adicionadas</div>
            </div>
            <div style={{ flex: 1, minWidth: 100, background: theme.raised, border: '1px solid #0ea5e944', borderLeft: '3px solid #0ea5e9', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0ea5e9', fontFamily: 'Inter, sans-serif' }}>
                {resultado.artigos_salvos ?? 0}
              </div>
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>artigo(s) na legislação</div>
            </div>
            {((resultado.juris_salvas ?? 0) + (resultado.juris_atualizadas ?? 0)) > 0 && (
              <div style={{ flex: 1, minWidth: 100, background: theme.raised, border: '1px solid #a78bfa44', borderLeft: '3px solid #a78bfa', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#a78bfa', fontFamily: 'Inter, sans-serif' }}>
                  {(resultado.juris_salvas ?? 0) + (resultado.juris_atualizadas ?? 0)}
                </div>
                <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
                  jurisprudência(s)
                  {resultado.juris_atualizadas > 0 && ` (${resultado.juris_atualizadas} com novo contexto)`}
                </div>
              </div>
            )}
          </div>
          {resultado.erros?.length > 0 && (
            <div style={{ background: '#fff7ed', border: '1px solid #f59e0b44', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#92400e', fontFamily: 'Inter, sans-serif' }}>
              {resultado.erros.slice(0, 3).map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
          <button onClick={reiniciar}
            style={{ background: theme.gold, border: 'none', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Processar outra petição
          </button>
        </div>
      )}

      {/* Erro */}
      {etapa === 'erro' && (
        <div style={{ ...card, borderColor: `${theme.error}44` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertCircle size={16} color={theme.error} />
            <div style={{ fontSize: 14, color: theme.error, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Erro na extração</div>
          </div>
          <div style={{ fontSize: 13, color: theme.muted, marginBottom: 16, lineHeight: 1.6, fontFamily: 'Inter, sans-serif', wordBreak: 'break-word' }}>
            {erro}
          </div>
          <button onClick={reiniciar}
            style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
