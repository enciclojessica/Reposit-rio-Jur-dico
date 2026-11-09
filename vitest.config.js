import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// A partir do Node 25 o localStorage nativo do Node fica ligado por padrão e,
// sem arquivo de armazenamento, encobre o do jsdom (localStorage indefinido nos testes).
const nodeMajor = Number(process.versions.node.split('.')[0])

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    execArgv: nodeMajor >= 25 ? ['--no-experimental-webstorage'] : [],
  },
})
