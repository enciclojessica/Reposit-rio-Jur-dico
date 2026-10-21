import { describe, it, expect } from 'vitest'
import { montarEmailCadastroPendente, escaparHtml } from './emailCadastroPendente.js'

describe('emailCadastroPendente', () => {
  it('escapa HTML nos dados informados no cadastro', () => {
    expect(escaparHtml('<script>"a"&\'b\'</script>')).toBe('&lt;script&gt;&quot;a&quot;&amp;&#39;b&#39;&lt;/script&gt;')
    const html = montarEmailCadastroPendente({ nome: '<b>X</b>', email: 'a@b.com', telefone: null })
    expect(html).not.toContain('<b>X</b>')
    expect(html).toContain('&lt;b&gt;X&lt;/b&gt;')
  })

  it('mostra nome, e-mail e "Não informado" quando falta telefone', () => {
    const html = montarEmailCadastroPendente({ nome: 'Ana', email: 'ana@exemplo.com', telefone: '' })
    expect(html).toContain('Ana')
    expect(html).toContain('ana@exemplo.com')
    expect(html).toContain('Não informado')
    expect(html).toContain('Aguardando aprovação')
  })
})
