import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AmostraAcervo, { primeiraTese } from '../components/AmostraAcervo'
import { temaFake } from './testUtils'

const tese = (t) => [{ tese_assunto: t, ratio_decidendi: `Ratio de ${t}`, fundamentacao_legal: `Art. de ${t}` }]
const DADOS = {
  'jurisprudência': [{ id: 'j1', area: 'Penal', tipo: 'jurisprudência', tema: 'Tema juris', fonte: 'STJ', referencia: 'Ref juris', teses: tese('juris') }],
  doutrina: [{ id: 'd1', area: 'Família', tipo: 'doutrina', tema: 'Tema doutrina', fonte: 'Autor', referencia: 'Ref doutrina', teses: JSON.stringify(tese('doutrina')) }],
  lei: [],
}
const consultas = []

vi.mock('../supabase', () => ({
  supabase: {
    from: () => {
      const filtros = {}
      const chain = {
        select: () => chain,
        eq: (c, v) => { filtros[c] = v; return chain },
        order: () => chain,
        limit: () => Promise.resolve((consultas.push({ ...filtros }), { data: DADOS[filtros.tipo] || [], error: null })),
      }
      return chain
    },
  },
}))

describe('AmostraAcervo', () => {
  it('lê só entradas públicas e mostra tese, fundamento e fonte', async () => {
    render(<AmostraAcervo theme={temaFake} onCadastrar={() => {}} />)
    expect(await screen.findByText('Tema juris')).toBeInTheDocument()
    expect(screen.getByText('Ratio de juris')).toBeInTheDocument()
    expect(screen.getByText('Art. de juris')).toBeInTheDocument()
    expect(screen.getByText('Ref juris')).toBeInTheDocument()
    expect(consultas.every(c => c.publica === true)).toBe(true)
  })

  it('troca de aba e aceita teses em texto JSON', async () => {
    render(<AmostraAcervo theme={temaFake} onCadastrar={() => {}} />)
    await screen.findByText('Tema juris')
    fireEvent.click(screen.getByRole('tab', { name: 'Doutrina' }))
    expect(screen.getByText('Tema doutrina')).toBeInTheDocument()
    expect(screen.getByText('Ratio de doutrina')).toBeInTheDocument()
  })

  it('avisa quando não há amostra pública do tipo, sem inventar conteúdo', async () => {
    render(<AmostraAcervo theme={temaFake} onCadastrar={() => {}} />)
    await screen.findByText('Tema juris')
    fireEvent.click(screen.getByRole('tab', { name: 'Legislação' }))
    expect(screen.getByText(/Ainda não há amostra pública deste tipo/)).toBeInTheDocument()
  })

  it('o botão do rodapé leva ao cadastro', async () => {
    const onCadastrar = vi.fn()
    render(<AmostraAcervo theme={temaFake} onCadastrar={onCadastrar} />)
    await waitFor(() => screen.getByText('Tema juris'))
    fireEvent.click(screen.getByRole('button', { name: /Ver o acervo completo/ }))
    expect(onCadastrar).toHaveBeenCalled()
  })

  it('primeiraTese tolera valores vazios ou inválidos', () => {
    expect(primeiraTese({ teses: null })).toBeNull()
    expect(primeiraTese({ teses: 'não é json' })).toBeNull()
    expect(primeiraTese({ teses: [] })).toBeNull()
  })
})
