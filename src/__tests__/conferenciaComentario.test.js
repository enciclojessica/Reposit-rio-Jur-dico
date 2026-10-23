import { describe, it, expect } from 'vitest'
import { conferenciaComentario } from '../utils/conferenciaComentario'

describe('conferenciaComentario', () => {
  it('não mostra nada sem comentário', () => {
    expect(conferenciaComentario({ texto: 'Art. 1º' })).toBeNull()
    expect(conferenciaComentario(null)).toBeNull()
  })
  it('avisa quando não há conferência registrada', () => {
    const r = conferenciaComentario({ contexto: 'x' })
    expect(r.conferido).toBe(false)
    expect(r.rotulo).toBe('Sem revisão independente')
  })
  it('revisão independente aprovada, com data em dia/mês/ano', () => {
    const r = conferenciaComentario({ contexto: 'x', comentario_conferencia: 'revisao_independente', comentario_resultado: 'aprovado', comentario_conferido_em: '2026-10-23' })
    expect(r).toMatchObject({ conferido: true, rotulo: 'Revisão independente em 23/10/2026' })
    expect(r.detalhe).toMatch(/não apontou/)
  })
  it('resultado corrigido registra ajustes reconferidos', () => {
    const r = conferenciaComentario({ aplicacao_pratica: 'x', comentario_conferencia: 'revisao_independente', comentario_resultado: 'corrigido', comentario_conferido_em: '2026-10-23' })
    expect(r.detalhe).toMatch(/reconferidos/)
  })
  it('conferência da curadoria', () => {
    const r = conferenciaComentario({ contexto: 'x', comentario_conferencia: 'conferido_titular', comentario_resultado: 'aprovado', comentario_conferido_em: '2026-11-02' })
    expect(r.rotulo).toBe('Conferido pela curadoria em 02/11/2026')
  })
  it('indicador incompleto vale como sem conferência', () => {
    expect(conferenciaComentario({ contexto: 'x', comentario_conferencia: 'revisao_independente' }).conferido).toBe(false)
  })
})
