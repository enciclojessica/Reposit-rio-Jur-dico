import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../theme'

export default function InstalarApp() {
  const { theme, mode } = useTheme()
  const [prompt, setPrompt]     = useState(null)
  const [visivel, setVisivel]   = useState(false)
  const [instalado, setInstalado] = useState(false)
  const [isIOS, setIsIOS]       = useState(false)
  const [showIOSGuia, setShowIOSGuia] = useState(false)
  const [showAndroidGuia, setShowAndroidGuia] = useState(false)
  const visivelRef = useRef(false)
  useEffect(() => { visivelRef.current = visivel }, [visivel])

  useEffect(() => {
    // Detectar iOS (Safari não dispara beforeinstallprompt)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)
    const android = /android/i.test(navigator.userAgent)

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

    // Android: se o prompt nativo (beforeinstallprompt) não disparar em
    // alguns segundos — navegador diferente do Chrome/Edge, ou o próprio
    // Chrome decidindo não oferecer —, cai pro guia manual, do mesmo jeito
    // que o iOS já tinha. Sem isso, quem usa Firefox/outro navegador no
    // Android nunca via banner nenhum.
    if (android && !ios) {
      const jaViu = sessionStorage.getItem('pwa_android_guia_visto')
      if (!jaViu) {
        const timer = setTimeout(() => {
          if (!visivelRef.current) setShowAndroidGuia(true)
          sessionStorage.setItem('pwa_android_guia_visto', '1')
        }, 4000)
        window.addEventListener('appinstalled', () => clearTimeout(timer))
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
  if (instalado || (!visivel && !showIOSGuia && !showAndroidGuia)) return null

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
          Instalar Themis Jur no iPhone
        </div>
        <button onClick={() => setShowIOSGuia(false)}
          style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.7 }}>
        Para instalar o app na tela inicial:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {[
          ['1', 'Toque em Compartilhar (ícone de seta para cima)'],
          ['2', 'Toque em "Adicionar à Tela de Início"'],
          ['3', 'Toque em "Adicionar" no canto superior direito'],
        ].map(([n, text]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.gold + '22', color: theme.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{n}</div>
            <div style={{ fontSize: 13, color: theme.text, fontFamily: "Georgia, 'EB Garamond', serif" }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Guia manual para Android (quando o prompt nativo não dispara) ──────
  if (showAndroidGuia) return (
    <div style={{
      position: 'fixed', bottom: 70, left: 16, right: 16, zIndex: 150,
      background: theme.surface, border: `1px solid ${theme.borderGold}`,
      borderRadius: 14, padding: '16px 18px', boxShadow: theme.shadow,
      animation: 'fadeUp .3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif' }}>
          Instalar Themis Jur no celular
        </div>
        <button onClick={() => setShowAndroidGuia(false)}
          style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.7 }}>
        Para instalar o app na tela inicial:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {[
          ['1', 'Toque no menu do navegador (⋮, no canto superior direito)'],
          ['2', 'Toque em "Instalar app" ou "Adicionar à tela inicial"'],
          ['3', 'Confirme tocando em "Instalar" ou "Adicionar"'],
        ].map(([n, text]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.gold + '22', color: theme.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{n}</div>
            <div style={{ fontSize: 13, color: theme.text, fontFamily: "Georgia, 'EB Garamond', serif" }}>{text}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', marginTop: 10 }}>
        O texto exato do menu varia um pouco entre navegadores (Chrome, Firefox, Samsung Internet).
      </div>
    </div>
  )

  // ── Banner Android/Chrome (prompt nativo) ──────────────────────────────
  if (visivel && !isIOS) return (
    <div style={{
      position: 'fixed', bottom: 70, left: 16, right: 16, zIndex: 150,
      background: theme.surface, border: `1px solid ${theme.borderGold}`,
      borderRadius: 14, padding: '14px 16px',
      boxShadow: theme.shadow, animation: 'fadeUp .3s ease',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <img src="/icon-72.png" alt="Themis Jur" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
          Instalar Themis Jur
        </div>
        <div style={{ fontSize: 11, color: theme.muted }}>
          Acesso rápido, carregamento instantâneo, funciona offline.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button onClick={instalar}
          style={{ background: theme.gold, border: 'none', color: '#fdfbf7', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif", whiteSpace: 'nowrap' }}>
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
