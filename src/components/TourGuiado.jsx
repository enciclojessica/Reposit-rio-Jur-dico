import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../theme'

// Tour guiado: aponta pra elementos reais da tela (marcados com
// data-tour="id" no Sidebar/MobileNav), um passo de cada vez, com um
// recorte de destaque (spotlight) e uma explicação ao lado. Diferente do
// TourBoasVindas antigo (um popup só, estático) — esse navega pela
// interface de verdade.

const PASSOS_DESKTOP = [
  { alvo: 'home',   titulo: 'Repositório', texto: 'O acervo inteiro, filtrável por área e tipo. É o ponto de partida pra qualquer pesquisa.' },
  { alvo: 'busca',  titulo: 'Busca com IA', texto: 'Descreva a peça que está escrevendo e o sistema sugere teses do acervo que podem ajudar. Recurso pago.' },
  { alvo: 'indice', titulo: 'Índice remissivo', texto: 'Lista alfabética de todas as tags do repositório. Útil quando você ainda não sabe o termo exato pra buscar.' },
  { alvo: 'favoritos', titulo: 'Favoritos', texto: 'Marque qualquer entrada com a estrela pra achar rápido depois, sem precisar buscar de novo.' },
  { alvo: 'juri',   titulo: 'Jurisprudência', texto: 'Pesquise jurisprudência e doutrina direto das fontes, e adicione ao acervo com um clique. Recurso pago.' },
  { alvo: 'add',    titulo: 'Nova entrada', texto: 'Cadastre uma nova entrada no acervo, com teses e fundamentação legal.', apenasEditor: true },
]

const PASSOS_MOBILE = [
  { alvo: 'm_hoje',   titulo: 'Início', texto: 'Sua tela de todo dia: o que você estava lendo, e as entradas mais recentes do acervo.' },
  { alvo: 'm_busca',  titulo: 'Busca com IA', texto: 'Descreva a peça que está escrevendo e o sistema sugere teses do acervo que podem ajudar. Recurso pago.' },
  { alvo: 'm_editor', titulo: 'Editor de Peças', texto: 'Escreva sua peça e insira citações do acervo direto no texto.' },
  { alvo: 'm_add',    titulo: 'Nova entrada', texto: 'Cadastre uma nova entrada no acervo, com teses e fundamentação legal.', apenasEditor: true },
]

export default function TourGuiado({ isMobile, isEditor, onFechar }) {
  const { theme } = useTheme()
  const passosBrutos = isMobile ? PASSOS_MOBILE : PASSOS_DESKTOP
  const passos = passosBrutos.filter(p => !p.apenasEditor || isEditor)

  const [indice, setIndice] = useState(0)
  const [rect, setRect] = useState(null)
  const tooltipRef = useRef(null)

  const passo = passos[indice]

  useEffect(() => {
    if (!passo) return
    function medir() {
      const el = document.querySelector(`[data-tour="${passo.alvo}"]`)
      if (el) setRect(el.getBoundingClientRect())
      else avancar() // alvo não existe nessa tela/sessão — pula o passo
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice])

  function avancar() {
    if (indice < passos.length - 1) setIndice(i => i + 1)
    else onFechar()
  }
  function voltar() {
    if (indice > 0) setIndice(i => i - 1)
  }

  if (!passo || !rect) return null

  const espacoAbaixo = window.innerHeight - rect.bottom
  const tooltipEmbaixo = espacoAbaixo > 160 || rect.top < 160
  const margem = 12

  const tooltipStyle = isMobile
    ? { position: 'fixed', left: 16, right: 16, bottom: window.innerHeight - rect.top + margem, zIndex: 601 }
    : {
        position: 'fixed', zIndex: 601, width: 280,
        left: Math.min(rect.right + margem, window.innerWidth - 296),
        top: tooltipEmbaixo ? rect.top : undefined,
        bottom: tooltipEmbaixo ? undefined : window.innerHeight - rect.bottom,
      }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600 }}>
      {/* Recorte de destaque (spotlight): sombra gigante ao redor do
          próprio retângulo cria o efeito de escurecer tudo, menos o
          elemento apontado. */}
      <div style={{
        position: 'fixed',
        top: rect.top - 4, left: rect.left - 4,
        width: rect.width + 8, height: rect.height + 8,
        borderRadius: 8,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
        border: `2px solid ${theme.gold}`,
        pointerEvents: 'none',
        transition: 'all .2s ease',
      }} />

      {/* Bloqueia clique em qualquer lugar fora do tooltip, pra não
          navegar sem querer no meio do tour */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 600 }} onClick={avancar} />

      <div ref={tooltipRef} style={tooltipStyle} onClick={e => e.stopPropagation()}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.borderGold}`, borderRadius: 10, padding: 18, boxShadow: '0 12px 32px #00000055' }}>
          <div style={{ fontSize: 11, color: theme.muted, fontFamily: theme.fontSerif, marginBottom: 6 }}>
            {indice + 1} de {passos.length}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.gold, fontFamily: theme.fontTitle, marginBottom: 6 }}>
            {passo.titulo}
          </div>
          <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontSerif, lineHeight: 1.5, marginBottom: 16 }}>
            {passo.texto}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onFechar} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 12, fontStyle: 'italic', cursor: 'pointer', fontFamily: theme.fontSerif }}>
              Pular tour
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {indice > 0 && (
                <button onClick={voltar} style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', color: theme.text, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Voltar
                </button>
              )}
              <button onClick={avancar} style={{ background: theme.gold, border: 'none', borderRadius: 6, padding: '6px 14px', color: theme.isDark ? '#2c241b' : '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {indice === passos.length - 1 ? 'Concluir' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
