import { describe, expect, it } from 'vitest'
import { textoCobradoOab } from '../supabaseQuestoes'

describe('selo "cobrado na OAB"', () => {
  it('monta o texto com os exames em ordem', () => {
    expect(textoCobradoOab({ questoes: 3, exames: [46, 40, 43] })).toBe('Cobrado em 3 questões da OAB (Exames 40º, 43º e 46º)')
    expect(textoCobradoOab({ questoes: 1, exames: [45] })).toBe('Cobrado em 1 questão da OAB (Exame 45º)')
  })

  it('sem questão, sem texto', () => {
    expect(textoCobradoOab(null)).toBe('')
    expect(textoCobradoOab({ questoes: 0, exames: [] })).toBe('')
  })
})
