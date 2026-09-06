import { AlertTriangle } from 'lucide-react'
import { extrairReferenciasLegais } from '../data/legislacaoNomes'

// Renderiza um texto livre, transformando menções a "art. N" (quando o
// diploma é identificável por perto) em links clicáveis que abrem o artigo
// real na tela de Legislação. Se nada for detectado, ou se onAbrirArtigo
// não for passado, renderiza o texto puro sem nenhuma mudança visual.
// 'revogados' é um Set de chaves "codigo|numero" — quando a citação aponta
// pra um artigo que já não está mais vigente, mostra aviso em vez do link
// dourado normal, sem impedir o clique (a pessoa ainda pode conferir o
// texto revogado, só fica claro que ele não vale mais como está).
export default function TextoComReferenciasLegais({ texto, theme, onAbrirArtigo, revogados }) {
  if (!texto) return null
  if (!onAbrirArtigo) return <>{texto}</>

  const refs = extrairReferenciasLegais(texto)
  if (refs.length === 0) return <>{texto}</>

  const partes = []
  let cursor = 0
  refs.forEach((ref, i) => {
    if (ref.start > cursor) partes.push(texto.slice(cursor, ref.start))
    const chave = `${ref.codigo}|${ref.numero}`
    const revogado = revogados?.has(chave)
    partes.push(
      <span key={i}
        onClick={() => onAbrirArtigo(ref.codigo, ref.numero)}
        title={revogado ? 'Este artigo não está mais vigente — confira antes de citar em peça' : 'Abrir na Legislação'}
        style={{
          color: revogado ? theme.error : theme.gold,
          textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'baseline', gap: 3,
        }}>
        {revogado && <AlertTriangle size={11} style={{ position: 'relative', top: 1 }} />}
        {ref.matchTexto}
      </span>
    )
    cursor = ref.end
  })
  if (cursor < texto.length) partes.push(texto.slice(cursor))

  return <>{partes}</>
}
