import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const TEMAS_CONFIG = {
  // ── ESCUROS ──────────────────────────────────────────────────────────
  classico_escuro: {
    nome: 'Clássico Escuro', grupo: 'Escuro',
    bg: '#0b0f1a', bgDeep: '#060a12', surface: '#0d1220', raised: '#1a2236',
    border: '#1e2d45', borderGold: '#c9a45233',
    gold: '#c9a452', goldDark: '#a8832e',
    cream: '#e8dfc8', muted: '#6b7fa3', text: '#f0f4ff', textSub: '#cbd5e1',
    civel: '#3b82f6', penal: '#ef4444', info: '#10b981', doutrina: '#a855f7',
    error: '#f87171', success: '#10b981',
    cardBg: '#1a2236', inputBg: '#0b0f1a', logoBg: '#ffffff',
    shadow: '0 8px 32px #00000066', toastOk: '#0f2b1a', toastErr: '#3b0f0f', btnMutedBg: '#1a2236',
    fontTitle: "'Playfair Display', Georgia, serif",
    fontBody: "'IBM Plex Mono', monospace",
    isDark: true,
  },
  cobre_imperial: {
    nome: 'Cobre Imperial', grupo: 'Escuro',
    bg: '#080808', bgDeep: '#040404', surface: '#0f0f0f', raised: '#161616',
    border: '#282828', borderGold: '#b8864e33',
    gold: '#b8864e', goldDark: '#8a6234',
    cream: '#f0ece4', muted: '#666666', text: '#f0ece4', textSub: '#c8c0b0',
    civel: '#4a9eff', penal: '#ff6b6b', info: '#4ecdc4', doutrina: '#c084fc',
    error: '#ff6b6b', success: '#4ecdc4',
    cardBg: '#161616', inputBg: '#080808', logoBg: '#ffffff',
    shadow: '0 8px 32px #00000088', toastOk: '#0a1a10', toastErr: '#2a0808', btnMutedBg: '#161616',
    fontTitle: "'Libre Baskerville', Georgia, serif",
    fontBody: "'Source Serif 4', Georgia, serif",
    isDark: true,
  },
  borgonha: {
    nome: 'Borgonha', grupo: 'Escuro',
    bg: '#080609', bgDeep: '#040305', surface: '#100d11', raised: '#181419',
    border: '#2d2030', borderGold: '#9b2d4a33',
    gold: '#c4556e', goldDark: '#9b2d4a',
    cream: '#f2e8ec', muted: '#6a5060', text: '#f2e8ec', textSub: '#d0b8c0',
    civel: '#6699ff', penal: '#ff8fa0', info: '#66d9c8', doutrina: '#d4a0ff',
    error: '#ff8fa0', success: '#66d9c8',
    cardBg: '#181419', inputBg: '#080609', logoBg: '#ffffff',
    shadow: '0 8px 32px #00000077', toastOk: '#0a1210', toastErr: '#2a0810', btnMutedBg: '#181419',
    fontTitle: "'Playfair Display', Georgia, serif",
    fontBody: "'Crimson Pro', Georgia, serif",
    isDark: true,
  },
  midnight: {
    nome: 'Midnight Ink', grupo: 'Escuro',
    bg: '#030810', bgDeep: '#010408', surface: '#070e18', raised: '#0d1624',
    border: '#162030', borderGold: '#e8b84b33',
    gold: '#e8b84b', goldDark: '#c49a30',
    cream: '#eaf2ff', muted: '#4a6080', text: '#eaf2ff', textSub: '#a0b8d0',
    civel: '#60aaff', penal: '#ff7070', info: '#50d8c8', doutrina: '#b880ff',
    error: '#ff7070', success: '#50d8c8',
    cardBg: '#0d1624', inputBg: '#030810', logoBg: '#ffffff',
    shadow: '0 8px 40px #00000099', toastOk: '#041a14', toastErr: '#1a0404', btnMutedBg: '#0d1624',
    fontTitle: "'Libre Baskerville', Georgia, serif",
    fontBody: "'Merriweather', Georgia, serif",
    isDark: true,
  },
  esmeralda: {
    nome: 'Esmeralda', grupo: 'Escuro',
    bg: '#0a1612', bgDeep: '#060e0a', surface: '#0e1f18', raised: '#142b20',
    border: '#1e3d2e', borderGold: '#d4a84333',
    gold: '#d4a843', goldDark: '#a8822e',
    cream: '#e8f5ee', muted: '#5a8070', text: '#e8f5ee', textSub: '#a0c8b0',
    civel: '#5ab0ff', penal: '#ff7060', info: '#50e0a0', doutrina: '#c090ff',
    error: '#ff7060', success: '#50e0a0',
    cardBg: '#142b20', inputBg: '#0a1612', logoBg: '#ffffff',
    shadow: '0 8px 32px #00000077', toastOk: '#041a0e', toastErr: '#1a0804', btnMutedBg: '#142b20',
    fontTitle: "'EB Garamond', Georgia, serif",
    fontBody: "'EB Garamond', Georgia, serif",
    isDark: true,
  },
  carbon: {
    nome: 'Carbono', grupo: 'Escuro',
    bg: '#0e0e0e', bgDeep: '#080808', surface: '#141414', raised: '#1c1c1c',
    border: '#303030', borderGold: '#f0a03033',
    gold: '#f0a030', goldDark: '#c07820',
    cream: '#e8e8e0', muted: '#606060', text: '#e8e8e0', textSub: '#b0b0a0',
    civel: '#5090ff', penal: '#ff6050', info: '#40d0b0', doutrina: '#b070ff',
    error: '#ff6050', success: '#40d0b0',
    cardBg: '#1c1c1c', inputBg: '#0e0e0e', logoBg: '#ffffff',
    shadow: '0 8px 32px #00000077', toastOk: '#0a1808', toastErr: '#1a0804', btnMutedBg: '#1c1c1c',
    fontTitle: "'Syne', sans-serif",
    fontBody: "'Space Grotesk', sans-serif",
    isDark: true,
  },
  escuro_times: {
    nome: 'Noturno Times', grupo: 'Escuro · Times New Roman',
    bg: '#0a0a0c', bgDeep: '#060608', surface: '#111113', raised: '#18181b',
    border: '#2c2c32', borderGold: '#c9a45233',
    gold: '#c9a452', goldDark: '#a8832e',
    cream: '#f5f0e8', muted: '#6a6060', text: '#f5f0e8', textSub: '#c8bfb0',
    civel: '#5599ff', penal: '#ff6666', info: '#44ccaa', doutrina: '#bb88ff',
    error: '#ff6666', success: '#44ccaa',
    cardBg: '#18181b', inputBg: '#0a0a0c', logoBg: '#ffffff',
    shadow: '0 8px 32px #00000077', toastOk: '#0a1810', toastErr: '#1a0808', btnMutedBg: '#18181b',
    fontTitle: "'Times New Roman', Times, serif",
    fontBody: "'Times New Roman', Times, serif",
    isDark: true,
  },
  escuro_arial: {
    nome: 'Noturno Arial', grupo: 'Escuro · Arial',
    bg: '#080808', bgDeep: '#040404', surface: '#101010', raised: '#181818',
    border: '#2a2a2a', borderGold: '#b8864e33',
    gold: '#b8864e', goldDark: '#8a6234',
    cream: '#f0f0ee', muted: '#686868', text: '#f0f0ee', textSub: '#c0c0b8',
    civel: '#5090ff', penal: '#ff6050', info: '#40ccaa', doutrina: '#b070ff',
    error: '#ff6050', success: '#40ccaa',
    cardBg: '#181818', inputBg: '#080808', logoBg: '#ffffff',
    shadow: '0 8px 32px #00000088', toastOk: '#0a1808', toastErr: '#1a0804', btnMutedBg: '#181818',
    fontTitle: 'Arial, Helvetica, sans-serif',
    fontBody: 'Arial, Helvetica, sans-serif',
    isDark: true,
  },
  // ── CLAROS ───────────────────────────────────────────────────────────
  classico_claro: {
    nome: 'Clássico Claro', grupo: 'Claro',
    bg: '#f0ece2', bgDeep: '#e8e3d8', surface: '#faf8f4', raised: '#ffffff',
    border: '#d6cfc0', borderGold: '#8a663444',
    gold: '#8a6634', goldDark: '#6b4f26',
    cream: '#3a2e22', muted: '#7a6a58', text: '#1a1410', textSub: '#3a3028',
    civel: '#1d4ed8', penal: '#b91c1c', info: '#047857', doutrina: '#6d28d9',
    error: '#b91c1c', success: '#047857',
    cardBg: '#ffffff', inputBg: '#faf8f4', logoBg: '#ffffff',
    shadow: '0 4px 20px #00000014', toastOk: '#f0fdf4', toastErr: '#fef2f2', btnMutedBg: '#f0ece2',
    fontTitle: "'Playfair Display', Georgia, serif",
    fontBody: "'IBM Plex Mono', monospace",
    isDark: false,
  },
  manuscrito: {
    nome: 'Manuscrito', grupo: 'Claro',
    bg: '#fdfbf7', bgDeep: '#f5f1ea', surface: '#fdfbf7', raised: '#ffffff',
    border: '#e8e3dc', borderGold: '#80002044',
    gold: '#800020', goldDark: '#5e0018',
    cream: '#2c241b', muted: '#736b62', text: '#2c241b', textSub: '#4a3f35',
    civel: '#1e3a8a', penal: '#800020', info: '#065f46', doutrina: '#581c87',
    error: '#800020', success: '#065f46',
    cardBg: '#ffffff', inputBg: '#fdfbf7', logoBg: '#ffffff',
    shadow: '0 4px 20px #00000014', toastOk: '#f0fdf4', toastErr: '#fff0f0', btnMutedBg: '#f5f1ea',
    fontTitle: "'Playfair Display', Georgia, serif",
    fontBody: "'Inter', system-ui, sans-serif",
    isDark: false,
  },
  minimalista: {
    nome: 'Minimalista', grupo: 'Claro',
    bg: '#fafafa', bgDeep: '#f0f0f0', surface: '#f4f4f5', raised: '#ffffff',
    border: '#e4e4e7', borderGold: '#2563eb33',
    gold: '#1e40af', goldDark: '#1e3a8a',
    cream: '#0d0d0d', muted: '#71717a', text: '#09090b', textSub: '#3f3f46',
    civel: '#2563eb', penal: '#dc2626', info: '#059669', doutrina: '#7c3aed',
    error: '#dc2626', success: '#059669',
    cardBg: '#ffffff', inputBg: '#fafafa', logoBg: '#ffffff',
    shadow: '0 2px 12px #00000010', toastOk: '#f0fdf4', toastErr: '#fef2f2', btnMutedBg: '#f4f4f5',
    fontTitle: "'DM Serif Display', Georgia, serif",
    fontBody: "'DM Sans', sans-serif",
    isDark: false,
  },
  papel_garamond: {
    nome: 'Papel & Garamond', grupo: 'Claro',
    bg: '#faf6ee', bgDeep: '#f0ece0', surface: '#f2ece0', raised: '#fffcf5',
    border: '#d8cfc0', borderGold: '#4a372844',
    gold: '#4a3728', goldDark: '#2e2010',
    cream: '#1e1610', muted: '#7a6a50', text: '#1e1610', textSub: '#3a2e20',
    civel: '#1a3a7a', penal: '#8a1a1a', info: '#1a5a3a', doutrina: '#4a1a7a',
    error: '#8a1a1a', success: '#1a5a3a',
    cardBg: '#fffcf5', inputBg: '#faf6ee', logoBg: '#ffffff',
    shadow: '0 4px 16px #00000012', toastOk: '#f0fdf4', toastErr: '#fef2f2', btnMutedBg: '#f2ece0',
    fontTitle: "'EB Garamond', Georgia, serif",
    fontBody: "'EB Garamond', Georgia, serif",
    isDark: false,
  },
  claro_times: {
    nome: 'Claro Times', grupo: 'Claro · Times New Roman',
    bg: '#f8f5ef', bgDeep: '#f0ece4', surface: '#f0ebe2', raised: '#ffffff',
    border: '#d4ccc0', borderGold: '#4a302044',
    gold: '#4a3020', goldDark: '#2e1c10',
    cream: '#1a1410', muted: '#787060', text: '#1a1410', textSub: '#3a3028',
    civel: '#1a3a8a', penal: '#8a1a1a', info: '#1a5a3a', doutrina: '#4a1a7a',
    error: '#8a1a1a', success: '#1a5a3a',
    cardBg: '#ffffff', inputBg: '#f8f5ef', logoBg: '#ffffff',
    shadow: '0 4px 16px #00000014', toastOk: '#f0fdf4', toastErr: '#fef2f2', btnMutedBg: '#f0ebe2',
    fontTitle: "'Times New Roman', Times, serif",
    fontBody: "'Times New Roman', Times, serif",
    isDark: false,
  },
  juridico_times: {
    nome: 'Jurídico Times', grupo: 'Claro · Times New Roman',
    bg: '#f5f7fa', bgDeep: '#edf0f5', surface: '#edf0f5', raised: '#ffffff',
    border: '#ccd4e0', borderGold: '#1a3a6a44',
    gold: '#1a3a6a', goldDark: '#0f2248',
    cream: '#0d1a2e', muted: '#6a7a90', text: '#0d1a2e', textSub: '#2a3a50',
    civel: '#1a3a8a', penal: '#8a1a2a', info: '#1a5a4a', doutrina: '#3a1a7a',
    error: '#8a1a2a', success: '#1a5a4a',
    cardBg: '#ffffff', inputBg: '#f5f7fa', logoBg: '#ffffff',
    shadow: '0 4px 16px #00000012', toastOk: '#f0fdf4', toastErr: '#fef2f2', btnMutedBg: '#edf0f5',
    fontTitle: "'Times New Roman', Times, serif",
    fontBody: "'Times New Roman', Times, serif",
    isDark: false,
  },
  claro_arial: {
    nome: 'Claro Arial', grupo: 'Claro · Arial',
    bg: '#f8f9fa', bgDeep: '#f0f2f5', surface: '#f0f2f5', raised: '#ffffff',
    border: '#dde2e8', borderGold: '#1e40af33',
    gold: '#1e40af', goldDark: '#1e3a8a',
    cream: '#111827', muted: '#6b7280', text: '#111827', textSub: '#374151',
    civel: '#2563eb', penal: '#dc2626', info: '#059669', doutrina: '#7c3aed',
    error: '#dc2626', success: '#059669',
    cardBg: '#ffffff', inputBg: '#f8f9fa', logoBg: '#ffffff',
    shadow: '0 2px 12px #00000010', toastOk: '#f0fdf4', toastErr: '#fef2f2', btnMutedBg: '#f0f2f5',
    fontTitle: 'Arial, Helvetica, sans-serif',
    fontBody: 'Arial, Helvetica, sans-serif',
    isDark: false,
  },
  quente_arial: {
    nome: 'Quente Arial', grupo: 'Claro · Arial',
    bg: '#fdf6ee', bgDeep: '#f5ece0', surface: '#f5ece0', raised: '#ffffff',
    border: '#ddd0c0', borderGold: '#7c3d0a44',
    gold: '#7c3d0a', goldDark: '#5a2a06',
    cream: '#1a0e08', muted: '#80706a', text: '#1a0e08', textSub: '#3a2820',
    civel: '#1a4a8a', penal: '#8a1a0a', info: '#1a5a3a', doutrina: '#4a1a6a',
    error: '#8a1a0a', success: '#1a5a3a',
    cardBg: '#ffffff', inputBg: '#fdf6ee', logoBg: '#ffffff',
    shadow: '0 4px 16px #00000012', toastOk: '#f0fdf4', toastErr: '#fef2f2', btnMutedBg: '#f5ece0',
    fontTitle: 'Arial, Helvetica, sans-serif',
    fontBody: 'Arial, Helvetica, sans-serif',
    isDark: false,
  },
}

export function ThemeProvider({ children }) {
  const [temaId, setTemaId] = useState(() => localStorage.getItem('rj_tema') || 'classico_escuro')

  const theme = TEMAS_CONFIG[temaId] || TEMAS_CONFIG['classico_escuro']
  const mode = theme.isDark ? 'dark' : 'light'

  function setTema(id) {
    setTemaId(id)
    localStorage.setItem('rj_tema', id)
  }

  // Toggle rápido claro/escuro — vai para o equivalente no outro modo
  const TOGGLE_MAP = {
    classico_escuro: 'classico_claro',   classico_claro: 'classico_escuro',
    cobre_imperial:  'manuscrito',        manuscrito:      'cobre_imperial',
    borgonha:        'papel_garamond',    papel_garamond:  'borgonha',
    midnight:        'minimalista',       minimalista:     'midnight',
    esmeralda:       'classico_claro',    carbon:          'claro_arial',
    escuro_times:    'claro_times',       claro_times:     'escuro_times',
    escuro_arial:    'claro_arial',       claro_arial:     'escuro_arial',
    juridico_times:  'escuro_times',      quente_arial:    'escuro_arial',
  }
  function toggle() {
    const next = TOGGLE_MAP[temaId] || (theme.isDark ? 'classico_claro' : 'classico_escuro')
    setTema(next)
  }

  useEffect(() => {
    const t = theme
    document.body.style.background = t.bg
    document.body.style.color = t.text
    document.body.style.fontFamily = t.fontBody

    const root = document.documentElement
    root.style.setProperty('--input-bg',           t.inputBg)
    root.style.setProperty('--input-border',       t.border)
    root.style.setProperty('--input-color',        t.text)
    root.style.setProperty('--input-focus-border', t.gold)
    root.style.setProperty('--scrollbar-track',    t.surface)
    root.style.setProperty('--scrollbar-thumb',    t.border)
    root.style.setProperty('--font-title',         t.fontTitle)
    root.style.setProperty('--font-body',          t.fontBody)
  }, [temaId])

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle, temaId, setTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
