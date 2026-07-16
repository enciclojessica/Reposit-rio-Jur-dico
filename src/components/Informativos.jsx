import { useState, useEffect } from 'react'
import { useTheme } from '../theme'
import { AREAS, corDaArea } from '../shared'
import { TagPill } from './TagInput'
import { Lock } from 'lucide-react'
import { supabase } from '../supabase'

const TRIBUNAIS = [
  { id: 'STF', label: 'STF', sub: 'Supremo Tribunal Federal' },
  { id: 'STJ', label: 'STJ', sub: 'Superior Tribunal de Justiça' },
]

function DecisaoCard({ decisao, onImportar, importada }) {
  const { theme } = useTheme()
  const cor = corDaArea(decisao.area, theme)

  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${importada ? cor + '55' : theme.border}`,
      borderLeft: `3px solid ${cor}`,
      borderRadius: 10, padding: '14px 18px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ background: cor + '22', color: cor, border: `1px solid ${cor}44`, borderRadius: 4, padding: '1px 7px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            {decisao.area || 'Informativo'}
          </span>
          {decisao.orgao && (
            <span style={{ background: theme.raised, color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 4, padding: '1px 7px', fontSize: 10 }}>
              {decisao.orgao}
            </span>
          )}
          {decisao.numero && (
            <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'monospace' }}>{decisao.numero}</span>
          )}
        </div>

        {/* Título */}
        <div style={{ fontSize: 14, color: theme.text, fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>
          {decisao.titulo}
        </div>

        {/* Tese */}
        {decisao.tese && (
          <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.6, marginBottom: 6 }}>
            {decisao.tese}
          </div>
        )}

        {/* Detalhes */}
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: theme.muted, flexWrap: 'wrap' }}>
          {decisao.relator && <span>Rel. {decisao.relator}</span>}
          {decisao.fundamentacao && <span>· {decisao.fundamentacao.slice(0, 60)}{decisao.fundamentacao.length > 60 ? '…' : ''}</span>}
        </div>

        {decisao.url && (
          <a href={decisao.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: theme.gold, textDecoration: 'none', display: 'inline-block', marginTop: 6 }}>
            ↗ Ver no portal
          </a>
        )}
      </div>

      {/* Botão importar */}
      <button onClick={() => onImportar(decisao)} disabled={importada}
        style={{
          flexShrink: 0,
          background: importada ? (theme.success + '22') : theme.gold,
          color: importada ? theme.success : '#0b0f1a',
          border: `1px solid ${importada ? theme.success + '55' : theme.gold}`,
          borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700,
          cursor: importada ? 'default' : 'pointer',
          fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap',
        }}>
        {importada ? '✓ Importada' : '+ Importar'}
      </button>
    </div>
  )
}

export default function Informativos({ onImportar, isEditor, todasEntradas, userId, onAtualizar }) {
  const { theme, mode } = useTheme()
  const [tribunal, setTribunal]   = useState('STF')
  const [dados, setDados]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')
  const [importadas, setImportadas] = useState(new Set())
  const [edicao, setEdicao]         = useState('')
  const [autoImportando, setAutoImportando] = useState(false)
  const [autoResultado, setAutoResultado]   = useState(null)

  async function autoImportar() {
    if (!isEditor || autoImportando) return
    setAutoImportando(true)
    setAutoResultado(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faça login novamente.')
      const res = await fetch('/api/auto-importar-informativos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({
          tribunal,
          entradas: todasEntradas || [],
          modo: 'manual',
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setAutoResultado(json)
      if (json.salvas > 0 && onAtualizar) onAtualizar()
    } catch (err) {
      setAutoResultado({ erro: err.message })
    }
    setAutoImportando(false)
  }

  // Carregar automaticamente ao montar e ao trocar tribunal
  useEffect(() => { buscar() }, [tribunal])

  async function buscar() {
    setLoading(true)
    setDados(null)
    setErro('')
    setImportadas(new Set())
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faça login novamente.')
      const params = new URLSearchParams({ tribunal })
      if (edicao.trim()) params.set('edicao', edicao.trim())
      const res  = await fetch(`/api/informativos?${params}`, {
        headers: { 'Authorization': 'Bearer ' + session.access_token },
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setDados(json)
    } catch (err) {
      setErro('Erro ao carregar informativo: ' + err.message)
    }
    setLoading(false)
  }

  function handleImportar(decisao) {
    if (!isEditor) return
    const entrada = {
      area:      AREAS[decisao.area] ? decisao.area : 'Informativo',
      tipo:      'jurisprudência',
      tema:      decisao.titulo || '',
      fonte:     tribunal,
      referencia:decisao.numero || '',
      url:       decisao.url || '',
      status:    'vigente',
      tags:      ['informativo', tribunal.toLowerCase()],
      teses: [{
        tese_assunto:        decisao.tese || '',
        fundamentacao_legal: decisao.fundamentacao || '',
        precedente_sumula:   decisao.numero || '',
        ratio_decidendi:     '',
        aplicacao_pratica:   '',
      }],
      _zotero: {
        tipo_item:      `Informativo ${tribunal} nº ${dados?.edicao || ''}`,
        titulo_ementa:  decisao.tese || '',
        autor_tribunal: tribunal,
        relator:        decisao.relator || '',
        data:           dados?.data || '',
        url:            dados?.url_fonte || '',
      },
    }
    onImportar(entrada)
    setImportadas(prev => new Set([...prev, decisao.numero || decisao.titulo]))
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Informativos de Jurisprudência
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>
          Últimas decisões do STF e STJ, extraídas diretamente dos portais oficiais.
        </div>
      </div>

      {/* Seletor de tribunal + edição */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {TRIBUNAIS.map(t => (
          <button key={t.id} onClick={() => { setTribunal(t.id); setEdicao('') }}
            style={{
              background: tribunal === t.id ? theme.gold + '22' : theme.raised,
              color: tribunal === t.id ? theme.gold : theme.muted,
              border: `1px solid ${tribunal === t.id ? theme.gold + '55' : theme.border}`,
              borderRadius: 8, padding: '8px 20px', fontSize: 13,
              fontWeight: tribunal === t.id ? 700 : 400,
              cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
            }}>
            {t.label}
            <span style={{ display: 'block', fontSize: 9, opacity: 0.6, marginTop: 1 }}>{t.sub}</span>
          </button>
        ))}

        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
          <input
            value={edicao}
            onChange={e => setEdicao(e.target.value)}
            placeholder="Edição (opcional)"
            style={{ width: 150, fontSize: 12 }}
            onKeyDown={e => e.key === 'Enter' && buscar()}
          />
          <button onClick={buscar} disabled={loading}
            style={{ background: loading ? theme.border : theme.raised, color: loading ? theme.muted : theme.muted, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 16px', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>
            {loading ? '⟳' : '↻ Atualizar'}
          </button>
          {isEditor && (
            <button onClick={autoImportar} disabled={autoImportando}
              style={{ background: autoImportando ? theme.border : `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`, color: autoImportando ? theme.muted : '#0b0f1a', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 700, cursor: autoImportando ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>
              {autoImportando ? '⟳ Analisando...' : '✦ Auto-importar relevantes'}
            </button>
          )}
        </div>
      </div>

      {/* Resultado auto-importação */}
      {autoResultado && (
        <div style={{
          background: autoResultado.erro
            ? (mode === 'dark' ? '#3b0f0f' : '#fef2f2')
            : (mode === 'dark' ? '#0f2b1a' : '#f0fdf4'),
          border: `1px solid ${autoResultado.erro ? theme.error : theme.success}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            {autoResultado.erro ? (
              <div style={{ fontSize: 13, color: theme.error }}>✕ {autoResultado.erro}</div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: theme.success, fontWeight: 700, marginBottom: 2 }}>
                  {autoResultado.salvas > 0
                    ? `✓ ${autoResultado.salvas} decisão(ões) salva(s) automaticamente`
                    : '— ' + (autoResultado.mensagem || 'Nenhuma decisão relevante encontrada.')}
                </div>
                {autoResultado.salvas > 0 && (
                  <div style={{ fontSize: 11, color: theme.muted }}>
                    Analisadas {autoResultado.total_analisadas} · Tag "auto-importado" adicionada
                  </div>
                )}
              </>
            )}
          </div>
          <button onClick={() => setAutoResultado(null)}
            style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div style={{ background: mode === 'dark' ? '#3b0f0f' : '#fef2f2', border: `1px solid ${theme.error}`, borderRadius: 10, padding: 14, fontSize: 13, color: theme.error, marginBottom: 16 }}>
          ✕ {erro}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 18, opacity: 0.5 }}>
              <div style={{ height: 10, background: theme.border, borderRadius: 4, width: '30%', marginBottom: 10 }} />
              <div style={{ height: 14, background: theme.border, borderRadius: 4, width: '80%', marginBottom: 8 }} />
              <div style={{ height: 10, background: theme.border, borderRadius: 4, width: '60%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Resultado */}
      {!loading && dados && (
        <>
          {/* Meta do informativo */}
          <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 13, color: theme.text, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>
                Informativo {dados.tribunal} nº {dados.edicao}
              </span>
              {dados.data && (
                <span style={{ fontSize: 12, color: theme.muted, marginLeft: 10 }}>
                  · {new Date(dados.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <a href={dados.url_fonte} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: theme.gold, textDecoration: 'none' }}>
              ↗ Portal oficial
            </a>
          </div>

          {/* Aviso para não-editores */}
          {!isEditor && (
            <div style={{ background: mode === 'dark' ? '#1a1a0a' : '#fffbf0', border: `1px solid ${theme.gold}44`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: theme.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={13} /> Faça login como editor para importar decisões para o repositório.
            </div>
          )}

          {/* Decisões */}
          {dados.decisoes?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: theme.muted, fontSize: 13 }}>
              Nenhuma decisão extraída desta edição.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(dados.decisoes || []).map((d, i) => (
                <DecisaoCard
                  key={i}
                  decisao={d}
                  onImportar={isEditor ? handleImportar : () => {}}
                  importada={importadas.has(d.numero || d.titulo)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
