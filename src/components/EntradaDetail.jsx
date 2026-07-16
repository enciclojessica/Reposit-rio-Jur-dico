import { useState } from 'react'
import { AlertTriangle, Check, Link2 } from 'lucide-react'
import { useTheme } from '../theme'
import { AREAS, Badge, STATUS_META } from '../shared'
import { supabase } from '../supabase'
import { TagPill } from './TagInput'
import AnotacaoPessoal from './AnotacaoPessoal'

// Garante string segura
const s = (v) => (v == null ? '' : String(v))

// Garante array seguro
function arr(v) {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.trim().startsWith('[')) {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}

function gerarABNT(entry) {
  try {
    const fonte = s(entry.fonte).toUpperCase()
    const tipo  = s(entry.tipo)
    const acesso = new Date().toLocaleDateString('pt-BR')
    const url   = s(entry.url)
    const ref   = s(entry.referencia)
    const tema  = s(entry.tema)
    if (tipo === 'lei')      return `BRASIL. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
    if (tipo === 'súmula')   return `${fonte}. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
    if (tipo === 'doutrina') return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
    return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  } catch { return '' }
}

export default function EntradaDetail({ entry: raw, onClose, onDelete, onEdit, readOnly, onStatusChange, onDuplicar }) {
  const { theme, mode } = useTheme()

  // Normalização defensiva total
  const entry = {
    id:         s(raw?.id),
    area:       s(raw?.area)       || 'Cível',
    tipo:       s(raw?.tipo)       || 'jurisprudência',
    tema:       s(raw?.tema)       || '',
    fonte:      s(raw?.fonte)      || '',
    referencia: s(raw?.referencia) || '',
    url:        s(raw?.url)        || '',
    status:     s(raw?.status)     || 'vigente',
    ia_status:  s(raw?.ia_status)  || 'manual',
    criado_em:  s(raw?.criado_em)  || '',
    teses:      arr(raw?.teses),
    historico:  arr(raw?.historico),
    tags:       arr(raw?.tags),
  }

  const iasPendente = entry.ia_status === 'ia_pendente'

  const [status, setStatus]               = useState(entry.status)
  const [showStatus, setShowStatus]       = useState(false)
  const [copied, setCopied]               = useState(false)
  const [copiedAbnt, setCopiedAbnt]       = useState(false)
  const [linkCopiado, setLinkCopiado]     = useState(false)
  const [showPreviewAbnt, setShowPreviewAbnt] = useState(false)
  const [salvandoStatus, setSalvandoStatus] = useState(false)

  const am = AREAS[entry.area] || { color: theme.muted }
  const abnt = gerarABNT(entry)

  async function alterarStatus(novo) {
    setSalvandoStatus(true)
    setShowStatus(false)
    const { error } = await supabase.from('entradas').update({ status: novo }).eq('id', entry.id)
    if (!error) {
      setStatus(novo)
      if (onStatusChange) onStatusChange(entry.id, novo)
    }
    setSalvandoStatus(false)
  }

  function copyFichamento() {
    const linhas = [
      `# ${entry.tema}`,
      `- Área: ${entry.area} | Tipo: ${entry.tipo}`,
      `- Fonte: ${entry.fonte}`,
      `- Referência: ${entry.referencia}`,
      entry.url ? `- URL: ${entry.url}` : '',
      '',
      ...entry.teses.flatMap((t, i) => [
        `## Tese ${i+1}: ${s(t?.tese_assunto)}`,
        `Fundamentação: ${s(t?.fundamentacao_legal)}`,
        `Precedente: ${s(t?.precedente_sumula)}`,
        `Fundamento: ${s(t?.ratio_decidendi)}`,
        `Aplicação: ${s(t?.aplicacao_pratica)}`,
        '',
      ]),
    ].join('\n')
    navigator.clipboard.writeText(linhas)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyAbnt() {
    navigator.clipboard.writeText(abnt)
    setCopiedAbnt(true)
    setTimeout(() => setCopiedAbnt(false), 2000)
  }

  function compartilhar() {
    navigator.clipboard.writeText(`${window.location.origin}/?entrada=${entry.id}`)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2500)
  }

  const btn = (cor) => ({
    border: `1px solid ${theme.border}`, borderRadius: 8, padding: '7px 12px',
    fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
    display: 'flex', alignItems: 'center', gap: 6,
    background: cor || theme.raised, color: theme.muted,
  })

  const sm = STATUS_META[status] || STATUS_META['vigente']

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Badge label={entry.area} color={am.color} />
          <Badge label={entry.tipo} color={theme.muted} />
          {entry.tags.map(t => <TagPill key={t} tag={t} pequena />)}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, fontFamily: theme.fontTitle, lineHeight: 1.3, marginBottom: 6 }}>
          {entry.tema}
        </div>
        {(entry.fonte || entry.referencia) && (
          <div style={{ fontSize: 11, color: theme.muted }}>
            {entry.fonte}{entry.referencia ? ` · ${entry.referencia}` : ''}
          </div>
        )}
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
        {!readOnly && (
          <div style={{ position: 'relative' }}>
            <span onClick={() => setShowStatus(m => !m)}
              style={{ background: sm.cor+'22', color: sm.cor, border: `1px solid ${sm.cor}44`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', cursor: 'pointer', userSelect: 'none' }}>
              {sm.icon} {sm.label}
            </span>
            {showStatus && (
              <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 50, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: theme.shadow, minWidth: 160 }}>
                {Object.entries(STATUS_META).map(([k, meta]) => (
                  <button key={k} onClick={() => alterarStatus(k)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: status === k ? meta.cor+'22' : 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: status === k ? meta.cor : theme.text, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'left' }}>
                    <span style={{ color: meta.cor }}>{meta.icon}</span> {meta.label}
                    {status === k && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={copyFichamento} style={{ ...btn(), color: copied ? theme.success : theme.muted }}>
          {copied ? '✓' : '⎘'} {copied ? 'Copiado' : 'Fichamento'}
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={copyAbnt}
            onMouseEnter={() => setShowPreviewAbnt(true)}
            onMouseLeave={() => setShowPreviewAbnt(false)}
            style={{ ...btn(), color: copiedAbnt ? theme.success : theme.gold }}>
            {copiedAbnt ? '✓' : '§'} {copiedAbnt ? 'Copiado' : 'ABNT'}
          </button>
          {showPreviewAbnt && abnt && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: theme.surface, border: `1px solid ${theme.borderGold}`, borderRadius: 8, padding: '10px 14px', width: 340, fontSize: 11, color: theme.text, lineHeight: 1.7, fontFamily: 'Georgia, serif', boxShadow: theme.shadow, zIndex: 50 }}>
              <div style={{ fontSize: 9, color: theme.gold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>Prévia ABNT</div>
              {abnt}
            </div>
          )}
        </div>

        <button onClick={compartilhar} style={{ ...btn(), color: linkCopiado ? theme.success : theme.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
          {linkCopiado ? <><Check size={13} /> Copiado</> : <><Link2 size={13} /> Compartilhar</>}
        </button>

        {!readOnly && (
          <>
            {onDuplicar && (
              <button onClick={() => onDuplicar(raw)} style={btn()}>⧉ Duplicar</button>
            )}
            <button onClick={onEdit} style={{ ...btn(), marginLeft: 'auto' }}>✎ Editar</button>
            {onDelete && (
              <button onClick={onDelete}
                style={{ ...btn(), background: mode==='dark'?'#2a0f0f':'#fef2f2', color: theme.error, border: `1px solid ${mode==='dark'?'#5a1f1f':'#fca5a5'}` }}>
                ✕ Excluir
              </button>
            )}
          </>
        )}
      </div>

      {/* Teses */}
      {entry.teses.length > 0 && entry.teses.map((t, i) => {
        if (!t || typeof t !== 'object') return null
        return (
          <div key={i} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }}>
              Tese {i+1}
            </div>
            {[
              ['Tese / Assunto',      s(t.tese_assunto),        false],
              ['Fundamentação Legal', s(t.fundamentacao_legal),  false],
              ['Precedente / Súmula', s(t.precedente_sumula),    false],
              ['Fundamento da Decisão',     s(t.ratio_decidendi),      true],
              ['Aplicação Prática',   s(t.aplicacao_pratica),    true],
            ].filter(([, val]) => val).map(([label, val, isIa]) => (
              <div key={label} style={{
                marginBottom: 12,
                background: isIa && iasPendente ? (mode === 'dark' ? '#1c160033' : '#fffbeb66') : 'transparent',
                border: isIa && iasPendente ? '1px dashed #c9a45266' : '1px solid transparent',
                borderRadius: isIa && iasPendente ? 8 : 0,
                padding: isIa && iasPendente ? '10px 12px' : 0,
              }}>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label}
                  {isIa && iasPendente && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#c9a452', fontSize: 9, fontFamily: 'IBM Plex Mono, monospace', background: '#c9a45218', border: '1px solid #c9a45244', borderRadius: 4, padding: '1px 6px' }}>
                      <AlertTriangle size={8} /> IA · Pendente de revisão
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.7 }}>{val}</div>
              </div>
            ))}
          </div>
        )
      })}

      {entry.teses.length === 0 && (
        <div style={{ color: theme.muted, fontSize: 13, padding: '20px 0' }}>Nenhuma tese cadastrada.</div>
      )}

      {/* Minha Anotação — estudo ativo */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginTop: 8 }}>
        <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>
          Minha Anotação
        </div>
        <AnotacaoPessoal itemId={entry.id} namespace="entrada" theme={theme} placeholder="Anote aqui o que você aprendeu, uma dúvida, ou como pretende usar isso numa peça..." />
      </div>

      {/* Histórico */}
      {entry.historico.length > 0 && (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 16, marginTop: 8, opacity: 0.7 }}>
          <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontFamily: 'IBM Plex Mono, monospace' }}>
            Histórico de alterações
          </div>
          {entry.historico.slice(0, 10).map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: theme.muted, whiteSpace: 'nowrap', fontFamily: 'IBM Plex Mono, monospace' }}>
                {h?.data ? new Date(h.data).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''}
              </div>
              <div style={{ fontSize: 12, color: theme.text }}>{s(h?.descricao)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
