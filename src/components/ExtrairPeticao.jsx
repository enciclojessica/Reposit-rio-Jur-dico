import { useState, useRef } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

export default function ExtrairPeticao() {
  const { theme, mode } = useTheme()
  const fileRef = useRef()
  const [etapa, setEtapa]       = useState('upload') // upload | processando | concluido | erro
  const [resultado, setResultado] = useState(null)
  const [erro, setErro]         = useState('')
  const [arquivo, setArquivo]   = useState(null)

  async function processar() {
    if (!arquivo) return
    setEtapa('processando')
    setErro('')

    try {
      // Obter user_id
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setErro('Faça login para continuar.'); setEtapa('erro'); return }

      // Converter PDF para base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = e => resolve(e.target.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(arquivo)
      })

      const res  = await fetch('/api/extrair-peticao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdf_base64: base64,
          filename:   arquivo.name,
          user_id:    session.user.id,
        }),
      })

      const json = await res.json()
      if (json.error) throw new Error(json.error)

      setResultado(json)
      setEtapa('concluido')
    } catch (err) {
      setErro(err.message)
      setEtapa('erro')
    }
  }

  function reiniciar() {
    setEtapa('upload'); setArquivo(null)
    setResultado(null); setErro('')
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
        <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6 }}>
          Suba uma petição em PDF. O sistema extrai as teses jurídicas e os artigos citados e salva diretamente no repositório e na legislação.
        </div>
      </div>

      {/* Upload */}
      {etapa === 'upload' && (
        <div style={{ ...card, borderStyle: arquivo ? 'solid' : 'dashed', textAlign: 'center', padding: 40 }}>
          {!arquivo ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📄</div>
              <div style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>
                Selecione a petição em PDF
              </div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>
                Petições iniciais, contestações, recursos, memoriais...
              </div>
              <label style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 24px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                + Selecionar PDF
                <input ref={fileRef} type="file" accept=".pdf" onChange={e => setArquivo(e.target.files?.[0] || null)} style={{ display: 'none' }} />
              </label>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
              <div style={{ fontSize: 14, color: theme.text, fontWeight: 700, marginBottom: 4 }}>{arquivo.name}</div>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>
                {(arquivo.size / 1024).toFixed(0)} KB
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={reiniciar}
                  style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '10px 20px', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                  Trocar arquivo
                </button>
                <button onClick={processar}
                  style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                  ✦ Extrair e salvar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Processando */}
      {etapa === 'processando' && (
        <div style={{ ...card, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 16, animation: 'spin 2s linear infinite', display: 'inline-block' }}>⟳</div>
          <div style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>Lendo a petição...</div>
          <div style={{ fontSize: 12, color: theme.muted }}>O Claude está extraindo as teses e os artigos. Pode levar até 30 segundos.</div>
        </div>
      )}

      {/* Concluído */}
      {etapa === 'concluido' && resultado && (
        <div style={{ ...card, padding: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 16 }}>
            ✓ Extração concluída
          </div>

          {/* Meta da peça */}
          {resultado.meta && (
            <div style={{ background: theme.raised, borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {resultado.meta.tipo_peca && (
                <div>
                  <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3, fontFamily: 'IBM Plex Mono, monospace' }}>Tipo</div>
                  <div style={{ fontSize: 13, color: theme.text }}>{resultado.meta.tipo_peca}</div>
                </div>
              )}
              {resultado.meta.resultado && (
                <div>
                  <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3, fontFamily: 'IBM Plex Mono, monospace' }}>Resultado</div>
                  <div style={{ fontSize: 13, color: theme.success, fontWeight: 700 }}>{resultado.meta.resultado}</div>
                </div>
              )}
              {resultado.meta.numero_processo && (
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3, fontFamily: 'IBM Plex Mono, monospace' }}>Processo</div>
                  <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{resultado.meta.numero_processo}</div>
                </div>
              )}
            </div>
          )}

          {/* Contadores */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: theme.raised, border: `1px solid ${theme.success}44`, borderLeft: `3px solid ${theme.success}`, borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: theme.success, fontFamily: 'IBM Plex Mono, monospace' }}>{resultado.teses_salvas}</div>
              <div style={{ fontSize: 11, color: theme.muted }}>tese{resultado.teses_salvas !== 1 ? 's' : ''} salva{resultado.teses_salvas !== 1 ? 's' : ''} no repositório</div>
            </div>
            <div style={{ flex: 1, background: theme.raised, border: `1px solid #0ea5e944`, borderLeft: '3px solid #0ea5e9', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0ea5e9', fontFamily: 'IBM Plex Mono, monospace' }}>{resultado.artigos_salvos}</div>
              <div style={{ fontSize: 11, color: theme.muted }}>artigo{resultado.artigos_salvos !== 1 ? 's' : ''} salvo{resultado.artigos_salvos !== 1 ? 's' : ''} na legislação</div>
            </div>
          </div>

          {/* Erros se houver */}
          {resultado.erros?.length > 0 && (
            <div style={{ background: mode === 'dark' ? '#2a1a0a' : '#fff7ed', border: `1px solid #f59e0b55`, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>⚠ {resultado.erros.length} item(s) não salvos:</div>
              {resultado.erros.map((e, i) => <div key={i} style={{ fontSize: 11, color: theme.muted }}>{e}</div>)}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={reiniciar}
              style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
              Processar outra petição
            </button>
          </div>
        </div>
      )}

      {/* Erro */}
      {etapa === 'erro' && (
        <div style={{ ...card, borderColor: theme.error }}>
          <div style={{ fontSize: 14, color: theme.error, fontWeight: 700, marginBottom: 8 }}>✕ Erro na extração</div>
          <div style={{ fontSize: 13, color: theme.muted, marginBottom: 16 }}>{erro}</div>
          <button onClick={reiniciar}
            style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
