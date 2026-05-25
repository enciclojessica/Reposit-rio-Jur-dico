import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const THEMES = {
  dark: {
    bg:        '#0b0f1a',
    bgDeep:    '#060a12',
    surface:   '#0d1220',
    raised:    '#1a2236',
    border:    '#1e2d45',
    borderGold:'#c9a45233',
    gold:      '#c9a452',
    goldDark:  '#a8832e',
    cream:     '#e8dfc8',
    muted:     '#6b7fa3',
    text:      '#f0f4ff',
    textSub:   '#cbd5e1',
    civel:     '#3b82f6',
    penal:     '#ef4444',
    info:      '#10b981',
    doutrina:  '#a855f7',
    error:     '#f87171',
    success:   '#10b981',
    cardBg:    '#1a2236',
    inputBg:   '#0b0f1a',
    logoBg:    '#ffffff',
    shadow:    '0 8px 32px #00000066',
  },
  light: {
    bg:        '#f4f1ea',
    bgDeep:    '#ebe7dd',
    surface:   '#ffffff',
    raised:    '#f9f7f3',
    border:    '#ddd6c8',
    borderGold:'#c9a45244',
    gold:      '#8a6634',
    goldDark:  '#6b4f26',
    cream:     '#4a3728',
    muted:     '#7a6a58',
    text:      '#1a1410',
    textSub:   '#4a3f35',
    civel:     '#1d4ed8',
    penal:     '#dc2626',
    info:      '#059669',
    doutrina:  '#7c3aed',
    error:     '#dc2626',
    success:   '#059669',
    cardBg:    '#ffffff',
    inputBg:   '#faf8f5',
    logoBg:    '#ffffff',
    shadow:    '0 4px 16px #00000018',
  }
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('rj_theme') || 'dark')
  const theme = THEMES[mode]

  function toggle() {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    localStorage.setItem('rj_theme', next)
  }

  // Aplicar no body
  useEffect(() => {
    document.body.style.background = theme.bg
    document.body.style.color = theme.text
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
