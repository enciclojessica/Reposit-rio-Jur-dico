import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'icon-*.png'],
      manifest: {
        name: 'Síntese Jurídica — Farias Fusquiani',
        short_name: 'Síntese',
        description: 'Plataforma de curadoria jurídica · Farias Fusquiani',
        theme_color: '#800020',
        background_color: '#fdfbf7',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        categories: ['productivity', 'education'],
        icons: [
          { src: 'icon-72.png',   sizes: '72x72',   type: 'image/png' },
          { src: 'icon-96.png',   sizes: '96x96',   type: 'image/png' },
          { src: 'icon-128.png',  sizes: '128x128', type: 'image/png' },
          { src: 'icon-144.png',  sizes: '144x144', type: 'image/png' },
          { src: 'icon-152.png',  sizes: '152x152', type: 'image/png' },
          { src: 'icon-192.png',  sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-384.png',  sizes: '384x384', type: 'image/png' },
          { src: 'icon-512.png',  sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Nova Entrada',
            short_name: 'Nova',
            description: 'Adicionar nova entrada ao repositório',
            url: '/',
            icons: [{ src: 'icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Pesquisar',
            short_name: 'Pesquisar',
            description: 'Pesquisar jurisprudência',
            url: '/',
            icons: [{ src: 'icon-96.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          // Rotas internas /api/* — network-only, nunca cachear
          {
            urlPattern: /^\/api\/.*/,
            handler: 'NetworkOnly',
          },
          // Anthropic — network-only
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          // Supabase Storage — network-only
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'NetworkOnly',
          },
          // Supabase REST — network-first
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data-v2',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 8,
            },
          },
          // Fontes Google — cache longo
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-v2',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          docx:     ['docx'],
          xlsx:     ['xlsx'],
          vendor:   ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
