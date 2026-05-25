export const AREAS = {
  'Cível':       { color: '#3b82f6', icon: '⚖️' },
  'Penal':       { color: '#ef4444', icon: '🔒' },
  'Informativo': { color: '#10b981', icon: '📋' },
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
  return (
    <div style={{
      fontSize: 10,
      color: '#6b7fa3',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 6,
      marginTop: 14,
    }}>{children}</div>
  )
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11,
      color: '#c9a452',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 14,
      fontFamily: 'IBM Plex Mono, monospace',
    }}>{children}</div>
  )
}

export function BtnGold({ onClick, children, disabled, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#1e2d45' : '#c9a452',
        color: disabled ? '#6b7fa3' : '#0b0f1a',
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
  return (
    <button
      onClick={onClick}
      style={{
        background: '#1a2236',
        color: '#6b7fa3',
        border: '1px solid #1e2d45',
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
