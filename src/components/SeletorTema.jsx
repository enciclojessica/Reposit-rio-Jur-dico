import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../theme'

// Botão quadrado de 34px, igual ao do app de questões.
export default function SeletorTema({ onDark = false }) {
  const { isDark, toggle, theme } = useTheme()
  const Icone = isDark ? Sun : Moon
  const cor = onDark ? '#e8dfc8' : theme.muted
  const borda = onDark ? '#a9812e' : theme.border

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      style={{
        width: 34, height: 34, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: onDark ? 'transparent' : theme.raised,
        border: `1px solid ${borda}`, borderRadius: 6,
        color: cor, cursor: 'pointer', transition: 'border-color .15s, color .15s',
      }}
    >
      <Icone size={16} strokeWidth={1.75} aria-hidden="true" />
    </button>
  )
}
