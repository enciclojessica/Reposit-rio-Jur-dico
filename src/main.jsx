import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './theme'
import './index.css'

// Versão do build — alterar força o desregistro do service worker antigo
const BUILD_VERSION = '2026-05-31-v3'

// Desregistrar service workers de versões anteriores
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => {
      // Verificar se o SW em execução conhece a versão atual
      if (reg.active) {
        const channel = new MessageChannel()
        channel.port1.onmessage = evt => {
          if (evt.data?.version !== BUILD_VERSION) {
            reg.unregister().then(() => {
              console.log('[SW] Service worker antigo desregistrado. Recarregando...')
              window.location.reload()
            })
          }
        }
        reg.active.postMessage({ type: 'GET_VERSION' }, [channel.port2])
      } else {
        // SW sem active (instalando ou esperando) — desregistrar diretamente
        reg.unregister()
      }
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)
