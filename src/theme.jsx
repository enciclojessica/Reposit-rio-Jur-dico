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
    borderGold:  '#a9812e33',
    gold:        '#8f6d27',
    goldDark:    '#7a5c1e',
    vinho:       '#7a1128',
    vinhoDark:   '#5e0018',
    cream:       '#2c241b',
    muted:       '#736b62',
    text:        '#2c241b',
    textSub:     '#4a3f35',
    civel:       '#2c4a6e',
    penal:       '#7a1128',
    info:        '#065f46',
    doutrina:    '#5a4a7a',
    error:       '#7a1128',
    success:     '#065f46',
    cardBg:      '#ffffff',
    inputBg:     '#fdfbf7',
    logoBg:      '#ffffff',
    shadow:      '0 4px 20px #00000014',
    toastOk:     '#f0fdf4',
    toastErr:    '#fff0f0',
    btnMutedBg:  '#f5f1ea',
    fontTitle:   "'Inter', -apple-system, system-ui, sans-serif",
    fontSerif:   "'Inter', -apple-system, system-ui, sans-serif",
    fontBody:    "'Inter', -apple-system, system-ui, sans-serif",
  },
  escuro: {
    nome: 'Escuro', isDark: true,
    bg:          '#160a0d',
    bgDeep:      '#0d0608',
    surface:     '#241318',
    raised:      '#301a20',
    border:      '#4a2830',
    borderGold:  '#C5A05944',
    gold:        '#C5A059',
    goldDark:    '#8a6e34',
    vinho:       '#b8425f',
    vinhoDark:   '#7a1128',
    cream:       '#f0e8df',
    muted:       '#a89185',
    text:        '#f0e8df',
    textSub:     '#d4c4b8',
    civel:       '#60a5fa',
    penal:       '#f87171',
    info:        '#34d399',
    doutrina:    '#c084fc',
    error:       '#f87171',
    success:     '#34d399',
    cardBg:      '#241318',
    inputBg:     '#160a0d',
    logoBg:      '#301a20',
    shadow:      '0 4px 24px #00000055',
    toastOk:     '#0a2016',
    toastErr:    '#2a0810',
    btnMutedBg:  '#301a20',
    fontTitle:   "'Inter', -apple-system, system-ui, sans-serif",
    fontSerif:   "'Inter', -apple-system, system-ui, sans-serif",
    fontBody:    "'Inter', -apple-system, system-ui, sans-serif",
  },
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('sintese_tema')
    return saved === 'escuro'
  })

  useEffect(() => {
    localStorage.setItem('sintese_tema', isDark ? 'escuro' : 'claro')
    document.body.setAttribute('data-dark', isDark ? 'true' : 'false')
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
