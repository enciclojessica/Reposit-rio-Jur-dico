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
    toastOk:   '#0f2b1a',
    toastErr:  '#3b0f0f',
    btnMutedBg:'#1a2236',
  },
  light: {
    bg:        '#f0ece2',
    bgDeep:    '#e8e3d8',
    surface:   '#faf8f4',
    raised:    '#ffffff',
    border:    '#d6cfc0',
    borderGold:'#c9a45244',
    gold:      '#8a6634',
    goldDark:  '#6b4f26',
    cream:     '#3a2e22',
    muted:     '#7a6a58',
    text:      '#1a1410',
    textSub:   '#3a3028',
    civel:     '#1d4ed8',
    penal:     '#b91c1c',
    info:      '#047857',
    doutrina:  '#6d28d9',
    error:     '#b91c1c',
    success:   '#047857',
    cardBg:    '#ffffff',
    inputBg:   '#faf8f4',
    logoBg:    '#ffffff',
    shadow:    '0 4px 20px #00000014',
    toastOk:   '#f0fdf4',
    toastErr:  '#fef2f2',
    btnMutedBg:'#f0ece2',
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

  useEffect(() => {
    const t = THEMES[mode]
    document.body.style.background = t.bg
    document.body.style.color = t.text

    // Atualiza variáveis CSS globais (inputs, scrollbar)
    const root = document.documentElement
    root.style.setProperty('--input-bg',           t.inputBg)
    root.style.setProperty('--input-border',       t.border)
    root.style.setProperty('--input-color',        t.text)
    root.style.setProperty('--input-focus-border', t.gold)
    root.style.setProperty('--scrollbar-track',    t.surface)
    root.style.setProperty('--scrollbar-thumb',    t.border)
  }, [mode])

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
