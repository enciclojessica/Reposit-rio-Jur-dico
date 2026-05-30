import { useState, useRef } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { Upload, FileText, Check, X, AlertCircle, RotateCcw } from 'lucide-react'

// Extrair texto de .docx no browser usando FileReader + DOMParser
async function extrairTextoDocx(file) {
  const arrayBuffer = await file.arrayBuffer()
  // mammoth não roda no browser — usar abordagem simples de XML
  // O .docx é um zip; vamos usar a API nativa do browser
  const { default: JSZip } = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js').catch(() => null)

  if (JSZip) {
    try {
      const zip  = await JSZip.loadAsync(arrayBuffer)
      const xml  = await zip.file('word/document.xml')?.async('text')
      if (xml) {
        // Extrair texto puro removendo tags XML
        return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      }
    } catch {}
  }

  // Fallback: tentar como texto puro
  return new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer)
    .replace(/[^\x20-\x7E\u00C0-\u024F\u0080-\u00FF\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 50000)
}

// Converter para base64
async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ExtrairPeticao() {
  const { theme, mode } = useTheme()
  const fileRef = useRef()
  const [etapa, setEtapa]       = useState('upload')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro]         = useState('')
  const [arquivo, setArquivo]   = useState(null)
  const [progresso, setProgresso] = useState('')

  async function processar() {
    if (!arquivo) return
    setEtapa('processando')
    setErro('')
    setProgresso('Lendo o documento...')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setErro('Faça login para continuar.'); setEtapa('erro'); return }

      const anthropicKey = null // chave não disponível no browser — usar via servidor
      const ext = arquivo.name.split('.').pop().toLowerCase()
      const isDocx = ext === 'docx' || ext === 'doc'

      setProgresso('Preparando o arquivo...')
      const base64 = await toBase64(arquivo)

      setProgresso('Analisando o documento com IA...')

      // Chamar Anthropic diretamente do browser (sem passar pelo servidor Vercel)
      // Isso evita o timeout de 10s do Hobby plan
      const SYSTEM_PROMPT = `Você é um Doutrinador e Estrategista Processual. Analise o documento e extraia conhecimento jurídico universal e abstrato, completamente desvinculado dos fatos concretos do caso.

REGRA ABSOLUTA: Jamais mencione fatos específicos do caso (partes, valores, eventos concretos). Todo conteúdo deve ser reutilizável em qualquer demanda futura.

Retorne SOMENTE um objeto JSON válido, sem markdown, sem código, sem texto antes ou depois:
{"meta":{"tipo_peca":"string","numero_processo":"string ou null","resultado":"string ou null"},"teses":[{"area":"Cível","tipo":"jurisprudência","tema":"string","fonte":"string","referencia":"string","tese_assunto":"string","fundamentacao_legal":"string","precedente_sumula":"string","ratio_decidendi":"string","aplicacao_pratica":"string"}],"artigos":[{"codigo":"cpc","numero":300,"inciso":null,"paragrafo":null,"texto":"string","aplicacao_pratica":"string","contexto":"string"}]}`

      const userContent = isDocx
        ? [{ type: 'text', text: `Extraia o conhecimento jurídico desta peça (${arquivo.name}). Retorne APENAS o JSON.\n\n[Documento Word — texto extraído pelo cliente]` }]
        : [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            { type: 'text', text: `Extraia o conhecimento jurídico desta peça (${arquivo.name}). Retorne APENAS o JSON.` },
          ]

      // Para .docx, extrair texto no browser antes de enviar
      let finalContent = userContent
      if (isDocx) {
        setProgresso('Extraindo texto do Word...')
        const texto = await extrairTextoDocx(arquivo)
        if (!texto || texto.length < 50) {
          setErro('Não foi possível extrair texto do arquivo Word. Tente converter para PDF.')
          setEtapa('erro'); return
        }
        finalContent = [{ type: 'text', text: `Extraia o conhecimento jurídico desta peça (${arquivo.name}). Retorne APENAS o JSON.\n\n${texto.slice(0, 40000)}` }]
      }

      setProgresso('Claude está lendo o documento...')
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: finalContent }],
        }),
        signal: AbortSignal.timeout(120000),
      })

      const claudeJson = await anthropicRes.json()
      if (claudeJson.error) { setErro(claudeJson.error.message); setEtapa('erro'); return }

      setProgresso('Salvando no repositório...')
      const text = (claudeJson.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      let dados
      try { dados = JSON.parse(text.trim()) }
      catch {
        const match = text.match(/\{[\s\S]*\}/)
        if (!match) { setErro('A IA não retornou JSON válido. Tente novamente.'); setEtapa('erro'); return }
        try { dados = JSON.parse(match[0]) }
        catch (e) { setErro(`Erro no JSON: ${e.message}`); setEtapa('erro'); return }
      }

      // Salvar via endpoint leve (só persiste, não chama IA)
      const saveRes = await fetch('/api/salvar-extracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dados, filename: arquivo.name, user_id: session.user.id }),
        signal: AbortSignal.timeout(30000),
      })
      const json = await saveRes.json()
      if (json.error) { setErro(json.error); setEtapa('erro'); return }

      setResultado(json)
      setEtapa('concluido')
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setErro('Tempo limite excedido. O arquivo pode ser muito grande. Tente um arquivo menor ou use "Importar Planilha".')
      } else {
        setErro(err.message)
      }
      setEtapa('erro')
    }
  }

  function reiniciar() {
    setEtapa('upload'); setArquivo(null)
    setResultado(null); setErro('')
    setProgresso('')
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
          Suba uma petição em PDF ou Word (.docx). O sistema extrai teses jurídicas e artigos citados e salva diretamente no repositório.
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
                PDF ou Word (.docx) · Petições, contestações, recursos, memoriais
              </div>
              <label style={{ background: theme.gold, border: 'none', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'inline-block' }}>
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
                <button onClick={reiniciar} style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '9px 18px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Trocar arquivo
                </button>
                <button onClick={processar} style={{ background: theme.gold, border: 'none', color: '#fff', borderRadius: 8, padding: '9px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
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
          <RotateCcw size={32} color={theme.gold} style={{ animation: 'spin 1.5s linear infinite', display: 'block', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 14, color: theme.text, marginBottom: 8, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            Lendo a petição...
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
            {progresso}
          </div>
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif', opacity: 0.7 }}>
            O Claude está extraindo as teses e os artigos. Não saia desta tela.
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

          {resultado.meta && (
            <div style={{ background: theme.raised, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
              {resultado.meta.tipo_peca && (
                <div style={{ fontSize: 12, color: theme.text, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                  <span style={{ color: theme.muted }}>Tipo: </span>{resultado.meta.tipo_peca}
                </div>
              )}
              {resultado.meta.resultado && (
                <div style={{ fontSize: 12, color: theme.success, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  <span style={{ color: theme.muted, fontWeight: 400 }}>Resultado: </span>{resultado.meta.resultado}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: theme.raised, border: `1px solid ${theme.success}44`, borderLeft: `3px solid ${theme.success}`, borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.success, fontFamily: 'Inter, sans-serif' }}>{resultado.teses_salvas}</div>
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
                tese{resultado.teses_salvas !== 1 ? 's' : ''} no repositório
              </div>
            </div>
            <div style={{ flex: 1, background: theme.raised, border: `1px solid #0ea5e944`, borderLeft: '3px solid #0ea5e9', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0ea5e9', fontFamily: 'Inter, sans-serif' }}>{resultado.artigos_salvos}</div>
              <div style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
                artigo{resultado.artigos_salvos !== 1 ? 's' : ''} na legislação
              </div>
            </div>
          </div>

          {resultado.erros?.length > 0 && (
            <div style={{ background: mode === 'dark' ? '#2a1a0a' : '#fff7ed', border: `1px solid #f59e0b44`, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
                {resultado.erros.length} item(s) não salvos:
              </div>
              {resultado.erros.slice(0, 3).map((e, i) => (
                <div key={i} style={{ fontSize: 11, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>{e}</div>
              ))}
            </div>
          )}

          <button onClick={reiniciar} style={{ background: theme.gold, border: 'none', color: '#fff', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Processar outra petição
          </button>
        </div>
      )}

      {/* Erro */}
      {etapa === 'erro' && (
        <div style={{ ...card, borderColor: theme.error + '44' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertCircle size={16} color={theme.error} />
            <div style={{ fontSize: 14, color: theme.error, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>Erro na extração</div>
          </div>
          <div style={{ fontSize: 13, color: theme.muted, marginBottom: 16, lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
            {erro}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={reiniciar} style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
