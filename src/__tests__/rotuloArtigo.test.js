import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

// Garante que o rótulo temático (coluna `rotulo`) é exibido junto ao número do artigo,
// em vez de substituí-lo (o campo `titulo` fica só para artigos com letra, "Art. 7-A").
describe('rótulo temático do artigo', () => {
  const arquivos = ['src/components/Legislacao.jsx', 'src/components/LegislacaoPublica.jsx']
  for (const arq of arquivos) {
    it(`${arq} lê a coluna rotulo e mantém o fallback "Art. N"`, () => {
      const src = readFileSync(arq, 'utf-8')
      expect(src).toMatch(/rotulo/)
      expect(src).toMatch(/grupo\.titulo \|\| `Art\./)
    })
  }
})
