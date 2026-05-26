import { useTheme } from './theme'

export const AREAS = {
  'Cível':       { color: '#3b82f6', icon: '⚖️' },
  'Penal':       { color: '#ef4444', icon: '🔒' },
  'Doutrina':    { color: '#a855f7', icon: '📚' },
}

export const TIPOS = ['jurisprudência', 'doutrina', 'súmula', 'lei']

export const emptyEntry = () => ({
  area: 'Cível',
  tema: '',
  tipo: 'jurisprudência',
  fonte: '',
  referencia: '',
  url: '',
  teses: [{
    tese_assunto: '',
    fundamentacao_legal: '',
    precedente_sumula: '',
    ratio_decidendi: '',
    aplicacao_pratica: '',
  }],
})

export function Badge({ label, color, small }) {
  return (
    <span style={{
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
      borderRadius: 4,
      padding: small ? '1px 6px' : '2px 8px',
      fontSize: small ? 10 : 11,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontWeight: 600,
      fontFamily: 'IBM Plex Mono, monospace',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

export function FieldLabel({ children }) {
  const { theme } = useTheme()
  return (
    <div style={{
      fontSize: 10,
      color: theme.muted,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 6,
      marginTop: 14,
    }}>{children}</div>
  )
}

export function SectionLabel({ children }) {
  const { theme } = useTheme()
  return (
    <div style={{
      fontSize: 11,
      color: theme.gold,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 14,
      fontFamily: 'IBM Plex Mono, monospace',
    }}>{children}</div>
  )
}

export function BtnGold({ onClick, children, disabled, style = {} }) {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? theme.border : theme.gold,
        color: disabled ? theme.muted : '#0b0f1a',
        border: 'none',
        borderRadius: 8,
        padding: '10px 20px',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'IBM Plex Mono, monospace',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >{children}</button>
  )
}

export function BtnMuted({ onClick, children, style = {} }) {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      style={{
        background: theme.btnMutedBg,
        color: theme.muted,
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        padding: '10px 16px',
        fontSize: 13,
        fontFamily: 'IBM Plex Mono, monospace',
        cursor: 'pointer',
        ...style,
      }}
    >{children}</button>
  )
}


// ── Status de teses ───────────────────────────────────────────────────────
export const STATUS_META = {
  vigente:     { label: 'Vigente',     cor: '#10b981', icon: '✓' },
  vinculante:  { label: 'Vinculante',  cor: '#c9a452', icon: '★' },
  em_revisao:  { label: 'Em revisão',  cor: '#f59e0b', icon: '⚠' },
  superada:    { label: 'Superada',    cor: '#ef4444', icon: '✗' },
}

export function StatusBadge({ status, onClick, pequena }) {
  const s = STATUS_META[status] || STATUS_META['vigente']
  return (
    <span
      onClick={onClick}
      title={onClick ? 'Clique para alterar o status' : s.label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: s.cor + '22', color: s.cor,
        border: `1px solid ${s.cor}44`,
        borderRadius: 20, padding: pequena ? '1px 8px' : '3px 10px',
        fontSize: pequena ? 10 : 11,
        fontFamily: 'IBM Plex Mono, monospace',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none', whiteSpace: 'nowrap',
      }}>
      {s.icon} {s.label}
    </span>
  )
}
