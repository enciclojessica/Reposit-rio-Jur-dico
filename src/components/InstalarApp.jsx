import { useState, useEffect } from 'react'
import { useTheme } from '../theme'

export default function InstalarApp() {
  const { theme, mode } = useTheme()
  const [prompt, setPrompt]     = useState(null)
  const [visivel, setVisivel]   = useState(false)
  const [instalado, setInstalado] = useState(false)
  const [isIOS, setIsIOS]       = useState(false)
  const [showIOSGuia, setShowIOSGuia] = useState(false)

  useEffect(() => {
    // Detectar iOS (Safari não dispara beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalado(true)
      return
    }

    // Android/Chrome/Edge — capturar o evento de instalação
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisivel(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS: mostrar guia manualmente se não instalado
    if (ios) {
      const jaViu = sessionStorage.getItem('pwa_ios_guia_visto')
      if (!jaViu) {
        setTimeout(() => setShowIOSGuia(true), 3000)
        sessionStorage.setItem('pwa_ios_guia_visto', '1')
      }
    }

    window.addEventListener('appinstalled', () => {
      setInstalado(true)
      setVisivel(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function instalar() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalado(true)
    setVisivel(false)
    setPrompt(null)
  }

  // Não mostrar nada se já instalado ou se não há prompt disponível
  if (instalado || (!visivel && !showIOSGuia)) return null

  // ── Guia para iOS ─────────────────────────────────────────────────────
  if (showIOSGuia && isIOS) return (
    <div style={{
      position: 'fixed', bottom: 70, left: 16, right: 16, zIndex: 150,
      background: theme.surface, border: `1px solid ${theme.borderGold}`,
      borderRadius: 14, padding: '16px 18px', boxShadow: theme.shadow,
      animation: 'fadeUp .3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>
          Instalar Lex.IA no iPhone
        </div>
        <button onClick={() => setShowIOSGuia(false)}
          style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.7 }}>
        Para instalar o app na tela inicial:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {[
          ['1', '⎋', 'Toque em Compartilhar (ícone de seta para cima)'],
          ['2', '＋', 'Toque em "Adicionar à Tela de Início"'],
          ['3', '✓',  'Toque em "Adicionar" no canto superior direito'],
        ].map(([n, icon, text]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.gold + '22', color: theme.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{n}</div>
            <div style={{ fontSize: 12, color: theme.text }}><span style={{ marginRight: 6 }}>{icon}</span>{text}</div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Banner Android/Chrome ──────────────────────────────────────────────
  if (visivel && !isIOS) return (
    <div style={{
      position: 'fixed', bottom: 70, left: 16, right: 16, zIndex: 150,
      background: theme.surface, border: `1px solid ${theme.borderGold}`,
      borderRadius: 14, padding: '14px 16px',
      boxShadow: theme.shadow, animation: 'fadeUp .3s ease',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <img src="/icon-72.png" alt="Lexia" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
          Instalar Lex.IA
        </div>
        <div style={{ fontSize: 11, color: theme.muted }}>
          Acesso rápido, carregamento instantâneo, funciona offline.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button onClick={instalar}
          style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>
          Instalar
        </button>
        <button onClick={() => setVisivel(false)}
          style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 11, cursor: 'pointer', textAlign: 'center' }}>
          Agora não
        </button>
      </div>
    </div>
  )

  return null
}
