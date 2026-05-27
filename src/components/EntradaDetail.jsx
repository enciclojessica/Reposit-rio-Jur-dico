import { useState } from 'react'
import { AREAS, Badge, STATUS_META, StatusBadge } from '../shared'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { TagPill } from './TagInput'

function gerarCitacaoABNT(entry) {
  const fonteUpper = (entry.fonte || '').toUpperCase()
  const tipo = entry.tipo || 'jurisprudência'
  const acesso = new Date().toLocaleDateString('pt-BR')

  if (tipo === 'doutrina') {
    const partes = (entry.fonte || '').split(/[\s,]+/)
    const sobrenome = partes[0]?.toUpperCase() || fonteUpper
    return `${sobrenome}. ${entry.tema}. In: ${entry.referencia || entry.fonte}. ${entry.url ? `Disponível em: ${entry.url}.` : ''} Acesso em: ${acesso}.`
  }
  if (tipo === 'súmula')
    return `${fonteUpper}. ${entry.referencia || entry.tema}. ${entry.url ? `Disponível em: ${entry.url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'lei')
    return `BRASIL. ${entry.referencia || entry.tema}. ${entry.url ? `Disponível em: ${entry.url}.` : 'Disponível em: planalto.gov.br.'} Acesso em: ${acesso}.`

  const numProcesso = entry.referencia?.match(/[\d.]+[\/\-]\w+/)?.[0] || entry.referencia || ''
  const relator = entry.referencia?.match(/[Rr]el\.\s*([^,]+)/)?.[1]?.trim() || ''
  const data = entry.referencia?.match(/j\.\s*([\d\/]+)/)?.[1] || ''
  let c = `${fonteUpper}. ${entry.tema}.`
  if (numProcesso) c += ` ${numProcesso}.`
  if (relator)     c += ` Relator: ${relator}.`
  if (data)        c += ` Julgado em: ${data}.`
  if (entry.url)   c += ` Disponível em: ${entry.url}.`
  c += ` Acesso em: ${acesso}.`
  return c
}

// ── Campo editável inline ─────────────────────────────────────────────────
function CampoInline({ label, valor, onSalvar, multiline }) {
  const { theme } = useTheme()
  const [editando, setEditando] = useState(false)
  const [draft, setDraft]       = useState(valor || '')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    if (draft === valor) { setEditando(false); return }
    setSalvando(true)
    await onSalvar(draft)
    setSalvando(false)
    setEditando(false)
  }

  function cancelar() { setDraft(valor || ''); setEditando(false) }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          {label}
        </div>
        {!editando && (
          <button onClick={() => { setDraft(valor || ''); setEditando(true) }}
            style={{ background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: 11, opacity: 0.6, padding: 0 }}
            title="Editar">
            ✎
          </button>
        )}
      </div>

      {editando ? (
        <div>
          {multiline
            ? <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3} autoFocus
                style={{ width: '100%', marginBottom: 6, fontSize: 13 }} />
            : <input value={draft} onChange={e => setDraft(e.target.value)} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') salvar(); if (e.key === 'Escape') cancelar() }}
                style={{ width: '100%', marginBottom: 6, fontSize: 13 }} />
          }
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={salvar} disabled={salvando}
              style={{ background: theme.gold, border: 'none', color: '#000', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
              {salvando ? '...' : '✓ Salvar'}
            </button>
            <button onClick={cancelar}
              style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => { setDraft(valor || ''); setEditando(true) }}
          style={{ fontSize: 13, color: valor ? theme.text : theme.muted, lineHeight: 1.7, cursor: 'pointer', borderRadius: 6, padding: '4px 6px', margin: '-4px -6px' }}
          title="Clique para editar"
          onMouseEnter={ev => ev.currentTarget.style.background = theme.raised + '88'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
          {valor || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>— não preenchido (clique para editar)</span>}
        </div>
      )}
      {/* Histórico de alterações */}
      {!readOnly && (entry.historico || []).length > 0 && (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginTop: 8, opacity: 0.8 }}>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontFamily: 'IBM Plex Mono, monospace' }}>
            Histórico de alterações
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(entry.historico || []).slice(0, 10).map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <div style={{ fontSize: 10, color: theme.muted, whiteSpace: 'nowrap', fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
                  {new Date(h.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 12, color: theme.text }}>{h.descricao}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── EntradaDetail ─────────────────────────────────────────────────────────
export default function EntradaDetail({ entry: entryProp, onClose, onDelete, onEdit, readOnly, onStatusChange, onDuplicar }) {
  const { theme, mode } = useTheme()
  const [entry, setEntry]         = useState(entryProp)
  const [copied, setCopied]       = useState(false)
  const [copiedAbnt, setCopiedAbnt] = useState(false)
  const [status, setStatus]       = useState(entry.status || 'vigente')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [showPreviewABNT, setShowPreviewABNT] = useState(false)

  const am = AREAS[entry.area] || { color: theme.muted }

  function compartilhar() {
    navigator.clipboard.writeText(`${window.location.origin}/?entrada=${entry.id}`)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2500)
  }

  async function alterarStatus(novoStatus) {
    setSalvandoStatus(true)
    setShowStatusMenu(false)
    const { error } = await supabase.from('entradas').update({ status: novoStatus }).eq('id', entry.id)
    if (!error) {
      setStatus(novoStatus)
      if (onStatusChange) onStatusChange(entry.id, novoStatus)
    }
    setSalvandoStatus(false)
  }

  // Registrar no histórico
  async function registrarHistorico(descricao) {
    const novoEvento = {
      data: new Date().toISOString(),
      descricao,
    }
    const historicoAtual = entry.historico || []
    const novoHistorico = [novoEvento, ...historicoAtual].slice(0, 50)
    await supabase.from('entradas').update({ historico: novoHistorico }).eq('id', entry.id)
    setEntry(e => ({ ...e, historico: novoHistorico }))
  }

  // Salvar campo do cabeçalho inline
  async function salvarCampo(campo, valor) {
    const anterior = entry[campo]
    const { error } = await supabase.from('entradas').update({ [campo]: valor }).eq('id', entry.id)
    if (!error) {
      setEntry(e => ({ ...e, [campo]: valor }))
      await registrarHistorico(`${campo} alterado`)
    }
  }

  // Salvar campo de uma tese inline
  async function salvarCampoTese(tIdx, campo, valor) {
    const novasTeses = entry.teses.map((t, i) => i === tIdx ? { ...t, [campo]: valor } : t)
    const { error } = await supabase.from('entradas').update({ teses: novasTeses }).eq('id', entry.id)
    if (!error) {
      setEntry(e => ({ ...e, teses: novasTeses }))
      await registrarHistorico(`Tese ${tIdx + 1} · ${campo} atualizado`)
    }
  }

  function copyFichamento() {
    const lines = [
      `# ${entry.tema}`,
      `- Área: ${entry.area} | Tipo: ${entry.tipo}`,
      `- Fonte: ${entry.fonte}`,
      `- Referência: ${entry.referencia}`,
      entry.url ? `- URL: ${entry.url}` : '',
      '',
      ...(entry.teses || []).flatMap((t, i) => [
        `## Tese ${i + 1}: ${t.tese_assunto}`,
        `**Fundamentação:** ${t.fundamentacao_legal}`,
        `**Precedente:** ${t.precedente_sumula}`,
        `**Ratio Decidendi:** ${t.ratio_decidendi}`,
        `**Aplicação Prática:** ${t.aplicacao_pratica}`,
        '',
      ]),
    ].join('\n')
    navigator.clipboard.writeText(lines)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyABNT() {
    navigator.clipboard.writeText(gerarCitacaoABNT(entry))
    setCopiedAbnt(true)
    setTimeout(() => setCopiedAbnt(false), 2000)
  }

  const s = STATUS_META[status] || STATUS_META['vigente']

  const btnBase = {
    border: `1px solid ${theme.border}`, borderRadius: 8, padding: '8px 12px',
    fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
    display: 'flex', alignItems: 'center', gap: 6,
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Alerta de superada */}
      {status === 'superada' && (
        <div style={{ background: mode === 'dark' ? '#3b0f0f' : '#fef2f2', border: '1px solid #ef444466', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 18 }}>✗</span>
          <div>
            <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 700, marginBottom: 2 }}>Entendimento superado</div>
            <div style={{ fontSize: 12, color: theme.muted }}>Esta tese foi marcada como superada. Verifique o entendimento atual antes de usar.</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Badge label={entry.area} color={am.color} />
          <Badge label={entry.tipo} color={theme.muted} />
          {(entry.tags || []).map(t => <TagPill key={t} tag={t} pequena />)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, fontFamily: theme.fontTitle, lineHeight: 1.3, marginBottom: 6 }}>
          {entry.tema}
        </div>
        <div style={{ fontSize: 11, color: theme.muted }}>
          {entry.fonte}{entry.referencia ? ` · ${entry.referencia}` : ''}
        </div>
        {entry.url && (
          <a href={entry.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, color: theme.gold, wordBreak: 'break-all', display: 'block', marginTop: 4 }}>
            {entry.url}
          </a>
        )}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status */}
        <div style={{ position: 'relative' }}>
          <StatusBadge status={status} onClick={!readOnly ? () => setShowStatusMenu(m => !m) : undefined} />
          {showStatusMenu && (
            <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 50, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: theme.shadow, minWidth: 160 }}>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <button key={key} onClick={() => alterarStatus(key)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: status === key ? meta.cor + '22' : 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: status === key ? meta.cor : theme.text, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'left' }}>
                  <span style={{ color: meta.cor }}>{meta.icon}</span> {meta.label}
                  {status === key && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={copyFichamento} style={{ ...btnBase, background: copied ? theme.toastOk : theme.raised, color: copied ? theme.success : theme.muted, borderColor: copied ? theme.success : theme.border }}>
          {copied ? '✓' : '⎘'} {copied ? 'Copiado' : 'Fichamento'}
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={copyABNT} onMouseEnter={() => setShowPreviewABNT(true)} onMouseLeave={() => setShowPreviewABNT(false)}
            style={{ ...btnBase, background: copiedAbnt ? theme.toastOk : theme.raised, color: copiedAbnt ? theme.success : theme.gold, borderColor: copiedAbnt ? theme.success : theme.borderGold }}>
            {copiedAbnt ? '✓' : '§'} {copiedAbnt ? 'Copiado' : 'ABNT'}
          </button>
          {showPreviewABNT && !copiedAbnt && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: theme.surface, border: `1px solid ${theme.borderGold}`, borderRadius: 8, padding: '10px 14px', width: 340, fontSize: 11, color: theme.text, lineHeight: 1.7, fontFamily: 'Georgia, serif', boxShadow: theme.shadow, zIndex: 50 }}>
              <div style={{ fontSize: 9, color: theme.gold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>Prévia ABNT NBR 6023</div>
              {gerarCitacaoABNT(entry)}
            </div>
          )}
        </div>

        <button onClick={compartilhar} style={{ ...btnBase, background: linkCopiado ? theme.toastOk : theme.raised, color: linkCopiado ? theme.success : theme.muted, borderColor: linkCopiado ? theme.success : theme.border }}>
          {linkCopiado ? '✓ Link copiado!' : '🔗 Compartilhar'}
        </button>

        {!readOnly && (
          <>
            {onDuplicar && (
              <button onClick={() => onDuplicar(entry)}
                style={{ ...btnBase, background: theme.raised, color: theme.muted }}
                title="Duplicar esta entrada">
                ⧉ Duplicar
              </button>
            )}
            <button onClick={onEdit} style={{ ...btnBase, background: theme.raised, color: theme.muted, marginLeft: 'auto' }}>✎ Editar</button>
            <button onClick={onDelete} style={{ ...btnBase, background: mode === 'dark' ? '#2a0f0f' : '#fef2f2', color: theme.error, border: `1px solid ${mode === 'dark' ? '#5a1f1f' : '#fca5a5'}` }}>✕ Excluir</button>
          </>
        )}
      </div>

      {/* Metadados editáveis inline */}
      {!readOnly && (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }}>
            Metadados <span style={{ fontSize: 9, color: theme.muted, textTransform: 'none', letterSpacing: 0 }}>· clique em qualquer campo para editar</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <CampoInline label="Fonte / Tribunal" valor={entry.fonte} onSalvar={v => salvarCampo('fonte', v)} />
            <CampoInline label="Referência" valor={entry.referencia} onSalvar={v => salvarCampo('referencia', v)} />
          </div>
          <CampoInline label="URL" valor={entry.url} onSalvar={v => salvarCampo('url', v)} />
        </div>
      )}

      {/* Teses editáveis inline */}
      {(entry.teses || []).map((t, i) => (
        <div key={i} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }}>
            Tese {i + 1}
            {!readOnly && <span style={{ fontSize: 9, color: theme.muted, textTransform: 'none', letterSpacing: 0, marginLeft: 8 }}>· clique nos campos para editar</span>}
          </div>

          {readOnly ? (
            // Modo leitura — tabela simples
            [
              ['Tese / Assunto', t.tese_assunto],
              ['Fundamentação Legal', t.fundamentacao_legal],
              ['Precedente / Súmula', t.precedente_sumula],
              ['Ratio Decidendi', t.ratio_decidendi],
              ['Aplicação Prática', t.aplicacao_pratica],
            ].map(([label, val]) => val ? (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.7 }}>{val}</div>
              </div>
            ) : null)
          ) : (
            // Modo editor — campos inline
            <>
              <CampoInline label="Tese / Assunto" valor={t.tese_assunto} onSalvar={v => salvarCampoTese(i, 'tese_assunto', v)} multiline />
              <CampoInline label="Fundamentação Legal" valor={t.fundamentacao_legal} onSalvar={v => salvarCampoTese(i, 'fundamentacao_legal', v)} />
              <CampoInline label="Precedente / Súmula" valor={t.precedente_sumula} onSalvar={v => salvarCampoTese(i, 'precedente_sumula', v)} />
              <CampoInline label="Ratio Decidendi" valor={t.ratio_decidendi} onSalvar={v => salvarCampoTese(i, 'ratio_decidendi', v)} multiline />
              <CampoInline label="Aplicação Prática" valor={t.aplicacao_pratica} onSalvar={v => salvarCampoTese(i, 'aplicacao_pratica', v)} multiline />
            </>
          )}
        </div>
      ))}
      {/* Histórico de alterações */}
      {!readOnly && (entry.historico || []).length > 0 && (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginTop: 8, opacity: 0.8 }}>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontFamily: 'IBM Plex Mono, monospace' }}>
            Histórico de alterações
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(entry.historico || []).slice(0, 10).map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <div style={{ fontSize: 10, color: theme.muted, whiteSpace: 'nowrap', fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>
                  {new Date(h.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: 12, color: theme.text }}>{h.descricao}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
