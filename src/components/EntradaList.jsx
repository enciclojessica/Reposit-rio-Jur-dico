import { useState } from 'react'
import { AREAS, corDaArea, AreaDot } from '../shared'
import { TagPill } from './TagInput'
import { tagsVisiveis } from '../utils/tagsVisiveis'
import { useTheme } from '../theme'
import { Trash2, Square, CheckSquare } from 'lucide-react'

function IaStatusLabel({ status, theme }) {
  if (!status || status === 'manual') return null
  if (status === 'ia_revisado') {
    return (
      <span style={{ fontSize: 11, fontStyle: 'italic', color: theme.success || '#065f46', fontFamily: theme.fontSerif }}>
        Revisado por IA
      </span>
    )
  }
  return (
    <span style={{ fontSize: 11, fontStyle: 'italic', color: theme.gold, fontFamily: theme.fontSerif }}>
      Sugerido por IA — revisar
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
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10, gap: 16, fontFamily: theme.fontSerif }}>
      <span onClick={() => setModoTabela(false)}
        style={{ color: !modoTabela ? theme.text : theme.muted, borderBottom: !modoTabela ? `1.5px solid ${theme.gold}` : '1.5px solid transparent', paddingBottom: 4, fontSize: 13, cursor: 'pointer', fontStyle: !modoTabela ? 'normal' : 'italic' }}>
        Lista
      </span>
      <span onClick={() => setModoTabela(true)}
        style={{ color: modoTabela ? theme.text : theme.muted, borderBottom: modoTabela ? `1.5px solid ${theme.gold}` : '1.5px solid transparent', paddingBottom: 4, fontSize: 13, cursor: 'pointer', fontStyle: modoTabela ? 'normal' : 'italic' }}>
        Tabela
      </span>
    </div>
  )

  if (entradas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 20, opacity: 0.2 }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: theme.gold }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ fontSize: 17, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 8 }}>
          Repositório vazio
        </div>
        <div style={{ fontSize: 13, color: theme.muted, marginBottom: 28, fontFamily: theme.fontSerif, fontStyle: 'italic', lineHeight: 1.6 }}>
          Nenhuma tese, jurisprudência ou doutrina cadastrada ainda.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 280, margin: '0 auto' }}>
          {[
            { label: 'Importar via planilha', aba: 'planilha' },
            { label: 'Importar via petição', aba: 'peticao' },
            { label: 'Importar legislação', aba: 'legislacao' },
          ].map(item => (
            <button key={item.aba} onClick={() => onImportar && onImportar(item.aba)}
              style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '10px 16px', color: theme.textSub, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '8px 4px', borderBottom: `1px solid ${theme.border}` }}>
          <button onClick={toggleTodos} style={{ background: 'none', border: 'none', color: selecionados.size === entradas.length && entradas.length > 0 ? theme.gold : theme.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: theme.fontSerif, fontStyle: 'italic', padding: 0 }}>
            {selecionados.size === entradas.length && entradas.length > 0 ? <CheckSquare size={15} /> : <Square size={15} />}
            {selecionados.size > 0 ? selecionados.size + ' selecionada(s)' : 'Selecionar tudo'}
          </button>
          {selecionados.size > 0 && (
            <button onClick={confirmarExclusao}
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${theme.penal}66`, borderRadius: 6, padding: '5px 14px', color: theme.penal, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              <Trash2 size={13} /> Excluir selecionadas
            </button>
          )}
        </div>
      )}

      {modoTabela ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: theme.fontSerif }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.text}` }}>
                {isAdmin && <th style={{ width: 32, padding: '8px 4px' }}></th>}
                {['Área', 'Tipo', 'Tema', 'Tribunal', 'Data', 'Teses'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: theme.text, fontWeight: 600, fontStyle: 'italic', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entradas.map(e => {
                const checked = selecionados.has(e.id)
                return (
                  <tr key={e.id} onClick={() => onSelect(e)}
                    style={{ borderBottom: `0.5px solid ${theme.border}`, cursor: 'pointer', background: checked ? theme.gold + '0c' : 'transparent' }}>
                    {isAdmin && (
                      <td style={{ padding: '8px 4px' }} onClick={ev => toggleSelect(e.id, ev)}>
                        {checked ? <CheckSquare size={14} color={theme.gold} /> : <Square size={14} color={theme.muted} />}
                      </td>
                    )}
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <AreaDot area={e.area} theme={theme} size={7} />
                        {e.area}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: theme.muted, fontStyle: 'italic' }}>{e.tipo}</td>
                    <td style={{ padding: '8px 12px', color: theme.text, fontWeight: 600, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.tema}</td>
                    <td style={{ padding: '8px 12px', color: theme.muted }}>{e.tribunal}</td>
                    <td style={{ padding: '8px 12px', color: theme.muted }}>{e.data_julgamento ? new Date(e.data_julgamento).toLocaleDateString('pt-BR') : '—'}</td>
                    <td style={{ padding: '8px 12px', color: theme.muted }}>{(Array.isArray(e.teses) ? e.teses : []).length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {entradas.map((e, i) => {
            const checked = selecionados.has(e.id)
            const numTeses = (Array.isArray(e.teses) ? e.teses : []).length
            const partesCitacao = [e.tribunal, e.tipo, e.data_julgamento ? new Date(e.data_julgamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : null].filter(Boolean)

            return (
              <div key={e.id}
                onClick={() => onSelect(e)}
                style={{
                  display: 'flex', gap: 10, padding: '16px 4px',
                  borderBottom: `0.5px solid ${theme.border}`,
                  cursor: 'pointer',
                  background: checked ? theme.gold + '0a' : 'transparent',
                }}>

                {isAdmin && (
                  <div onClick={ev => toggleSelect(e.id, ev)} style={{ paddingTop: 3, flexShrink: 0 }}>
                    {checked ? <CheckSquare size={15} color={theme.gold} /> : <Square size={15} color={theme.muted} />}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 3, flexShrink: 0, paddingTop: 4 }}>
                  <AreaDot area={e.area} theme={theme} />
                </div>
                <div style={{ fontSize: 13, color: theme.muted, flexShrink: 0, width: 22, paddingTop: 2, fontFamily: theme.fontSerif }}>{i + 1}.</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, lineHeight: 1.4 }}>{e.tema}</div>

                  {e.ementa && (
                    <div style={{ fontSize: 13, color: theme.textSub, fontFamily: theme.fontSerif, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{e.ementa}</div>
                  )}

                  <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.fontSerif, fontStyle: 'italic', marginTop: 6 }}>
                    {partesCitacao.join(', ')}
                    {partesCitacao.length > 0 && numTeses > 0 ? ' — ' : ''}
                    {numTeses > 0 && `${numTeses} ${numTeses === 1 ? 'tese' : 'teses'}`}
                  </div>

                  {(tagsVisiveis(e).length > 0 || e.ia_status) && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                      <IaStatusLabel status={e.ia_status} theme={theme} />
                      {tagsVisiveis(e).map(t => <TagPill key={t} tag={t} pequena />)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
