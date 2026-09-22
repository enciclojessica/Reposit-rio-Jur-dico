import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTheme } from '../theme'

// Intervalo de checagem por versão nova enquanto o app fica aberto (o
// registro do Service Worker só checa por padrão no boot; sem isso, um app
// instalado que fica dias em segundo plano nunca percebe deploy novo).
const INTERVALO_CHECAGEM_MS = 15 * 60 * 1000

export default function AtualizacaoApp() {
  const { theme } = useTheme()
  const [dispensado, setDispensado] = useState(false)

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return

      const checar = () => registration.update().catch(() => {})

      setInterval(checar, INTERVALO_CHECAGEM_MS)

      // Cobre o caso real que causou o bug: usuária volta pro app depois de
      // horas em segundo plano (celular bloqueado, trocou de app) sem passar
      // por um carregamento novo da página.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checar()
      })
      window.addEventListener('focus', checar)
    },
  })

  if (!needRefresh || dispensado) return null

  return (
    <div style={{
      // bottom mais alto que o banner de InstalarApp (70px) para os dois não
      // se sobreporem no caso raro de coexistirem (aba não instalada e
      // aberta há tempo suficiente pra pedir atualização)
      position: 'fixed', bottom: 140, left: 16, right: 16, zIndex: 160,
      background: theme.surface, border: `1px solid ${theme.borderGold}`,
      borderRadius: 14, padding: '14px 16px',
      boxShadow: theme.shadow, animation: 'fadeUp .3s ease',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: theme.gold + '22', color: theme.gold,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <RefreshCw size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 2, fontFamily: "'Inter', sans-serif" }}>
          Nova versão disponível
        </div>
        <div style={{ fontSize: 11, color: theme.muted, fontFamily: "'Inter', sans-serif" }}>
          Atualize para continuar com o acesso funcionando normalmente.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button onClick={() => updateServiceWorker(true)}
          style={{ background: theme.gold, border: 'none', color: '#fdfbf7', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
          Atualizar agora
        </button>
        <button onClick={() => setDispensado(true)}
          style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 11, cursor: 'pointer', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
          Depois
        </button>
      </div>
    </div>
  )
}
