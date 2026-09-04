import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './theme'
import './index.css'

// Atualização de service worker já é tratada de verdade pelo vite-plugin-pwa
// (registerType: 'autoUpdate' + skipWaiting + clientsClaim, em vite.config.js).
// Existia aqui um mecanismo manual de desregistro por versão (postMessage
// 'GET_VERSION' esperando resposta do SW), mas o Workbox gerado não
// implementa esse tipo de mensagem — a resposta nunca chegava, então o
// desregistro nunca rodava de verdade. Código morto, removido; dava falsa
// sensação de estar limpando cache antigo quando na prática não fazia nada.

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)
