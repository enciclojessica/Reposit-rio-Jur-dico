import { extrairReferenciasLegais } from '../data/legislacaoNomes'

// Renderiza um texto livre, transformando menções a "art. N" (quando o
// diploma é identificável por perto) em links clicáveis que abrem o artigo
// real na tela de Legislação. Se nada for detectado, ou se onAbrirArtigo
// não for passado, renderiza o texto puro sem nenhuma mudança visual.
export default function TextoComReferenciasLegais({ texto, theme, onAbrirArtigo }) {
  if (!texto) return null
  if (!onAbrirArtigo) return <>{texto}</>

  const refs = extrairReferenciasLegais(texto)
  if (refs.length === 0) return <>{texto}</>

  const partes = []
  let cursor = 0
  refs.forEach((ref, i) => {
    if (ref.start > cursor) partes.push(texto.slice(cursor, ref.start))
    partes.push(
      <span key={i}
        onClick={() => onAbrirArtigo(ref.codigo, ref.numero)}
        title={`Abrir na Legislação`}
        style={{ color: theme.gold, textDecoration: 'underline', textDecorationStyle: 'dotted', cursor: 'pointer' }}>
        {ref.matchTexto}
      </span>
    )
    cursor = ref.end
  })
  if (cursor < texto.length) partes.push(texto.slice(cursor))

  return <>{partes}</>
}
