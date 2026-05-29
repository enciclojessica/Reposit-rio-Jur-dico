import { useTheme } from '../theme'

export default function SeletorTema({ compact = false }) {
  const { isDark, toggle, theme } = useTheme()

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      style={{
        background: theme.raised,
        border: `1px solid ${theme.border}`,
        borderRadius: 20,
        padding: compact ? '4px 10px' : '5px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: theme.muted,
        fontSize: 12,
        fontFamily: theme.fontBody || 'Inter, sans-serif',
        flexShrink: 0,
        transition: 'all .15s',
      }}
    >
      <span style={{ fontSize: 14 }}>{isDark ? '☀' : '☾'}</span>
      {!compact && (
        <span style={{ color: theme.text, fontWeight: 500 }}>
          {isDark ? 'Claro' : 'Escuro'}
        </span>
      )}
    </button>
  )
}
