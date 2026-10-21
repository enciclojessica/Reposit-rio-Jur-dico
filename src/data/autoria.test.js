import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { AUTORIA, SUBTITULO_LOGIN } from './autoria'

describe('autoria', () => {
  it('traz a frase e o subtitulo definidos', () => {
    expect(AUTORIA).toBe('Criado e desenvolvido por Jessica Farias Fusquiani')
    expect(SUBTITULO_LOGIN).toBe('Repositório jurídico curado')
  })

  it('nenhum componente escreve a frase de autoria direto nem usa a antiga', () => {
    const dir = join(process.cwd(), 'src', 'components')
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.jsx'))) {
      const txt = readFileSync(join(dir, f), 'utf8')
      expect(txt, f).not.toMatch(/Idealizado e desenvolvido/)
      expect(txt, f).not.toMatch(/>\s*Criado e desenvolvido por/)
    }
  })
})
