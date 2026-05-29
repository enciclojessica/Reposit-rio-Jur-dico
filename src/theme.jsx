import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

// Dois temas: claro (Estúdio Boutique) e escuro (Borgonha Noturna)
const TEMAS = {
  claro: {
    nome: 'Claro', isDark: false,
    bg:          '#fdfbf7',
    bgDeep:      '#f5f1ea',
    surface:     '#fdfbf7',
    raised:      '#ffffff',
    border:      '#e8e3dc',
    borderGold:  '#80002033',
    gold:        '#800020',
    goldDark:    '#5e0018',
    cream:       '#2c241b',
    muted:       '#736b62',
    text:        '#2c241b',
    textSub:     '#4a3f35',
    civel:       '#1e3a8a',
    penal:       '#800020',
    info:        '#065f46',
    doutrina:    '#581c87',
    error:       '#800020',
    success:     '#065f46',
    cardBg:      '#ffffff',
    inputBg:     '#fdfbf7',
    logoBg:      '#ffffff',
    shadow:      '0 4px 20px #00000014',
    toastOk:     '#f0fdf4',
    toastErr:    '#fff0f0',
    btnMutedBg:  '#f5f1ea',
    fontTitle:   "'Playfair Display', Georgia, serif",
    fontBody:    "'Inter', system-ui, sans-serif",
  },
  escuro: {
    nome: 'Escuro', isDark: true,
    bg:          '#0f0a0b',
    bgDeep:      '#0a0608',
    surface:     '#1a0f10',
    raised:      '#241416',
    border:      '#3d1f22',
    borderGold:  '#C5A05944',
    gold:        '#C5A059',
    goldDark:    '#8a6e34',
    cream:       '#f0e8df',
    muted:       '#8a7060',
    text:        '#f0e8df',
    textSub:     '#c8b8a8',
    civel:       '#60a5fa',
    penal:       '#f87171',
    info:        '#34d399',
    doutrina:    '#c084fc',
    error:       '#f87171',
    success:     '#34d399',
    cardBg:      '#1a0f10',
    inputBg:     '#0f0a0b',
    logoBg:      '#241416',
    shadow:      '0 4px 24px #00000066',
    toastOk:     '#0a2016',
    toastErr:    '#2a0810',
    btnMutedBg:  '#241416',
    fontTitle:   "'Playfair Display', Georgia, serif",
    fontBody:    "'Inter', system-ui, sans-serif",
  },
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('sintese_tema')
    return saved === 'escuro'
  })

  useEffect(() => {
    localStorage.setItem('sintese_tema', isDark ? 'escuro' : 'claro')
  }, [isDark])

  const theme = isDark ? TEMAS.escuro : TEMAS.claro
  const mode  = isDark ? 'dark' : 'light'

  return (
    <ThemeContext.Provider value={{
      theme, mode, isDark,
      toggle: () => setIsDark(d => !d),
      temaId: isDark ? 'escuro' : 'claro',
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
