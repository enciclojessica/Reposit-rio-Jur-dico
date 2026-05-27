import { useState } from 'react'
import { AREAS, Badge, STATUS_META, StatusBadge } from '../shared'
import { useTheme } from '../theme'
import { supabase } from '../supabase'

function gerarCitacaoABNT(entry) {
  const { area, tema, tipo, fonte, referencia, url, teses } = entry
  const ano = new Date(entry.criado_em).getFullYear()

  // Extrair dados do campo referencia
  const fonteUpper = (fonte || '').toUpperCase()

  if (tipo === 'doutrina') {
    // SOBRENOME, Nome. Título. Edição. Local: Editora, Ano.
    const partes = (fonte || '').split(/[\s,]+/)
    const sobrenome = partes[0]?.toUpperCase() || fonteUpper
    return `${sobrenome}. ${tema}. In: ${referencia || fonte}. Disponível em: ${url || 'acervo do escritório'}. Acesso em: ${new Date().toLocaleDateString('pt-BR')}.`
  }

  if (tipo === 'súmula') {
    return `${fonteUpper}. ${referencia || tema}. ${url ? `Disponível em: ${url}.` : ''} Acesso em: ${new Date().toLocaleDateString('pt-BR')}.`
  }

  if (tipo === 'lei') {
    return `BRASIL. ${referencia || tema}. ${url ? `Disponível em: ${url}.` : 'Disponível em: planalto.gov.br.'} Acesso em: ${new Date().toLocaleDateString('pt-BR')}.`
  }

  // Jurisprudência (padrão)
  // TRIBUNAL. Tema. Tipo de recurso nº X. Relator: Min. Nome. Data.
  const numProcesso = referencia?.match(/[\d.]+[\/\-]\w+/)?.[0] || referencia || ''
  const relator = referencia?.match(/[Rr]el\.\s*([^,]+)/)?.[1]?.trim() || ''
  const data = referencia?.match(/j\.\s*([\d\/]+)/)?.[1] || ''

  let citacao = `${fonteUpper}. ${tema}.`
  if (numProcesso) citacao += ` ${numProcesso}.`
  if (relator) citacao += ` Relator: ${relator}.`
  if (data) citacao += ` Julgado em: ${data}.`
  if (url) citacao += ` Disponível em: ${url}.`
  citacao += ` Acesso em: ${new Date().toLocaleDateString('pt-BR')}.`

  return citacao
}

export default function EntradaDetail({ entry, onClose, onDelete, onEdit, readOnly, onStatusChange }) {
  const { theme, mode } = useTheme()
  const [copied, setCopied]       = useState(false)
  const [copiedAbnt, setCopiedAbnt] = useState(false)
  const [status, setStatus]       = useState(entry.status || 'vigente')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const [linkCopiado, setLinkCopiado]     = useState(false)
  const [showPreviewABNT, setShowPreviewABNT] = useState(false)

  function compartilhar() {
    const link = `${window.location.origin}/?entrada=${entry.id}`
    navigator.clipboard.writeText(link)
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
  const am = AREAS[entry.area] || { color: theme.muted }

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
    const citacao = gerarCitacaoABNT(entry)
    navigator.clipboard.writeText(citacao)
    setCopiedAbnt(true)
    setTimeout(() => setCopiedAbnt(false), 2000)
  }

  const s = STATUS_META[status] || STATUS_META['vigente']

  const btnBase = {
    border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '8px 12px',
    fontSize: 12, cursor: 'pointer',
    fontFamily: 'IBM Plex Mono, monospace',
    display: 'flex', alignItems: 'center', gap: 6,
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Badge label={entry.area} color={am.color} />
          <Badge label={entry.tipo} color={theme.muted} />
        </div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: theme.cream,
          fontFamily: 'Playfair Display, serif',
          lineHeight: 1.3, marginBottom: 6,
        }}>{entry.tema}</div>
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Copiar fichamento */}
        <button onClick={copyFichamento} style={{
          ...btnBase,
          background: copied ? theme.toastOk : theme.raised,
          color: copied ? theme.success : theme.muted,
          borderColor: copied ? theme.success : theme.border,
        }}>
          {copied ? '✓' : '⎘'} {copied ? 'Copiado' : 'Copiar fichamento'}
        </button>

        {/* Copiar ABNT com preview */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={copyABNT}
            onMouseEnter={() => setShowPreviewABNT(true)}
            onMouseLeave={() => setShowPreviewABNT(false)}
            style={{
              ...btnBase,
              background: copiedAbnt ? theme.toastOk : theme.raised,
              color: copiedAbnt ? theme.success : theme.gold,
              borderColor: copiedAbnt ? theme.success : theme.borderGold,
            }}>
            {copiedAbnt ? '✓' : '§'} {copiedAbnt ? 'Copiado' : 'Citação ABNT'}
          </button>
          {showPreviewABNT && !copiedAbnt && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
              background: theme.surface, border: `1px solid ${theme.borderGold}`,
              borderRadius: 8, padding: '10px 14px', width: 340,
              fontSize: 11, color: theme.text, lineHeight: 1.7,
              fontFamily: 'Georgia, serif', boxShadow: theme.shadow,
              zIndex: 50,
            }}>
              <div style={{ fontSize: 9, color: theme.gold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'IBM Plex Mono, monospace' }}>
                Prévia ABNT NBR 6023
              </div>
              {gerarCitacaoABNT(entry)}
            </div>
          )}
        </div>

        {/* Editar e Excluir — só para usuários logados */}
        {!readOnly && (
          <>
            <button onClick={onEdit} style={{
              ...btnBase,
              background: theme.raised,
              color: theme.muted,
              marginLeft: 'auto',
            }}>✎ Editar</button>
            <button onClick={onDelete} style={{
              ...btnBase,
              background: mode === 'dark' ? '#2a0f0f' : '#fef2f2',
              color: theme.error,
              border: `1px solid ${mode === 'dark' ? '#5a1f1f' : '#fca5a5'}`,
            }}>✕ Excluir</button>
          </>
        )}
      </div>

      {/* Teses */}
      {(entry.teses || []).map((t, i) => (
        <div key={i} style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: 12, padding: 16, marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Tese {i + 1}
          </div>
          {[
            ['Tese / Assunto', t.tese_assunto],
            ['Fundamentação Legal', t.fundamentacao_legal],
            ['Precedente / Súmula', t.precedente_sumula],
            ['Ratio Decidendi', t.ratio_decidendi],
            ['Aplicação Prática', t.aplicacao_pratica],
          ].map(([label, val]) => val ? (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.7 }}>{val}</div>
            </div>
          ) : null)}
        </div>
      ))}
    </div>
  )
}
