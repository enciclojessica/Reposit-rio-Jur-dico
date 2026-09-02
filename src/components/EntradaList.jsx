import { useState } from 'react'
import { AREAS, corDaArea } from '../shared'
import { TagPill } from './TagInput'
import { tagsVisiveis } from '../utils/tagsVisiveis'
import { useTheme } from '../theme'
import { Trash2, Square, CheckSquare, AlertTriangle, CheckCircle } from 'lucide-react'

function IaStatusBadge({ status, theme }) {
  if (!status || status === 'manual') return null
  if (status === 'ia_revisado') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        background: (theme.success || '#10b981') + '18',
        color: theme.success || '#10b981',
        border: '1px solid ' + (theme.success || '#10b981') + '44',
        borderRadius: 4, padding: '2px 7px',
        fontSize: 9, fontFamily: 'IBM Plex Mono, monospace',
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        <CheckCircle size={9} /> IA Revisado
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: '#c9a45218', color: '#c9a452',
      border: '1px solid #c9a45244',
      borderRadius: 4, padding: '2px 7px',
      fontSize: 9, fontFamily: 'IBM Plex Mono, monospace',
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
    }}>
      <AlertTriangle size={9} /> IA - Revisar
    </span>
  )
}

export default function EntradaList({ entradas, onSelect, onImportar, onDeleteMultiple, isAdmin }) {
  const { theme } = useTheme()
  const [modoTabela, setModoTabela] = useState(false)
  const [selecionados, setSelecionados] = useState(new Set())

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    setSelecionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleTodos = () => {
    if (selecionados.size === entradas.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(entradas.map(e => e.id)))
    }
  }

  const confirmarExclusao = () => {
    if (selecionados.size === 0) return
    if (!window.confirm('Excluir ' + selecionados.size + ' entrada(s) selecionada(s)?')) return
    onDeleteMultiple([...selecionados])
    setSelecionados(new Set())
  }

  const ToggleModo = () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, gap: 4 }}>
      <button onClick={() => setModoTabela(false)}
        style={{ background: !modoTabela ? theme.gold + '22' : 'none', color: !modoTabela ? theme.gold : theme.muted, border: '1px solid ' + (!modoTabela ? theme.gold + '44' : theme.border), borderRadius: 6, padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
        Cards
      </button>
      <button onClick={() => setModoTabela(true)}
        style={{ background: modoTabela ? theme.gold + '22' : 'none', color: modoTabela ? theme.gold : theme.muted, border: '1px solid ' + (modoTabela ? theme.gold + '44' : theme.border), borderRadius: 6, padding: '4px 10px', fontSize: 10, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
        Tabela
      </button>
    </div>
  )

  if (entradas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 20, opacity: 0.15 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: theme.gold }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ fontSize: 16, color: theme.text, fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>
          Repositório vazio
        </div>
        <div style={{ fontSize: 13, color: theme.muted, marginBottom: 28, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
          Nenhuma tese, jurisprudência ou doutrina cadastrada ainda.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '0 auto' }}>
          {[
            { label: 'Importar via planilha', aba: 'planilha' },
            { label: 'Importar via petição', aba: 'peticao' },
            { label: 'Importar legislação', aba: 'legislacao' },
          ].map(item => (
            <button key={item.aba} onClick={() => onImportar && onImportar(item.aba)}
              style={{ background: theme.raised, border: '1px solid ' + theme.border, borderRadius: 8, padding: '10px 16px', color: theme.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s' }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <ToggleModo />

      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '8px 12px', background: selecionados.size > 0 ? '#1a0f00' : 'transparent', border: '1px solid ' + (selecionados.size > 0 ? theme.gold + '44' : 'transparent'), borderRadius: 8, transition: 'all .2s' }}>
          <button onClick={toggleTodos} style={{ background: 'none', border: 'none', color: selecionados.size === entradas.length && entradas.length > 0 ? theme.gold : theme.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', padding: 0 }}>
            {selecionados.size === entradas.length && entradas.length > 0 ? <CheckSquare size={15} /> : <Square size={15} />}
            {selecionados.size > 0 ? selecionados.size + ' selecionada(s)' : 'Selecionar tudo'}
          </button>
          {selecionados.size > 0 && (
            <button onClick={confirmarExclusao}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#2a0808', border: '1px solid #5a1010', borderRadius: 6, padding: '5px 14px', color: '#c0504d', fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
              <Trash2 size={13} /> Excluir selecionadas
            </button>
          )}
        </div>
      )}

      {modoTabela ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid ' + theme.border }}>
                {isAdmin && <th style={{ width: 32, padding: '8px 4px' }}></th>}
                {['Area', 'Tipo', 'Tema', 'Tribunal', 'Data', 'Teses', 'IA'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: theme.muted, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entradas.map(e => {
                const checked = selecionados.has(e.id)
                const cor     = corDaArea(e.area, theme)
                return (
                  <tr key={e.id} onClick={() => onSelect(e)}
                    style={{ borderBottom: '1px solid ' + theme.border + '55', cursor: 'pointer', background: checked ? theme.gold + '08' : 'transparent', transition: 'background .1s' }}>
                    {isAdmin && (
                      <td style={{ padding: '8px 4px' }} onClick={ev => toggleSelect(e.id, ev)}>
                        {checked ? <CheckSquare size={14} color={theme.gold} /> : <Square size={14} color={theme.muted} />}
                      </td>
                    )}
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: cor + '22', color: cor, border: '1px solid ' + cor + '44', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{e.area}</span>
                    </td>
                    <td style={{ padding: '8px 12px', color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>{e.tipo}</td>
                    <td style={{ padding: '8px 12px', color: theme.text, fontFamily: 'Playfair Display, serif', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.tema}</td>
                    <td style={{ padding: '8px 12px', color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>{e.tribunal}</td>
                    <td style={{ padding: '8px 12px', color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>{e.data_julgamento ? new Date(e.data_julgamento).toLocaleDateString('pt-BR') : '-'}</td>
                    <td style={{ padding: '8px 12px', color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>{(Array.isArray(e.teses) ? e.teses : []).length}</td>
                    <td style={{ padding: '8px 12px' }}><IaStatusBadge status={e.ia_status} theme={theme} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entradas.map(e => {
                const checked = selecionados.has(e.id)
                const cor     = corDaArea(e.area, theme)
            return (
              <div key={e.id}
                onClick={() => onSelect(e)}
                style={{ background: checked ? theme.gold + '08' : theme.raised, border: '1px solid ' + (checked ? theme.gold + '55' : theme.border), borderLeft: '3px solid ' + cor, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'flex-start', gap: 10 }}>

                {isAdmin && (
                  <div onClick={ev => toggleSelect(e.id, ev)} style={{ paddingTop: 2, flexShrink: 0 }}>
                    {checked ? <CheckSquare size={16} color={theme.gold} /> : <Square size={16} color={theme.muted} />}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ background: cor + '22', color: cor, border: '1px solid ' + cor + '44', borderRadius: 4, padding: '2px 7px', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{e.area}</span>
                    <span style={{ background: theme.muted + '18', color: theme.muted, border: '1px solid ' + theme.border, borderRadius: 4, padding: '2px 7px', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}>{e.tipo}</span>
                    {e.tribunal && <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{e.tribunal}</span>}
                    <IaStatusBadge status={e.ia_status} theme={theme} />
                    {tagsVisiveis(e).map(t => <TagPill key={t} tag={t} pequena />)}
                  </div>
                  <div style={{ fontSize: 15, color: theme.text, fontFamily: 'Playfair Display, serif', lineHeight: 1.4, marginBottom: 4 }}>{e.tema}</div>
                  {e.ementa && (
                    <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{e.ementa}</div>
                  )}
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{(Array.isArray(e.teses) ? e.teses : []).length} {(Array.isArray(e.teses) ? e.teses : []).length === 1 ? 'tese' : 'teses'}</span>
                    {e.criado_em && <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>{new Date(e.criado_em).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
