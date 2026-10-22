import { AlertTriangle } from 'lucide-react'
import { extrairReferenciasComDispositivo, chaveArtigo, chaveDispositivo, descreverDispositivo } from '../utils/dispositivoCitado'

// Renderiza um texto livre, transformando menções a "art. N" (quando o
// diploma é identificável por perto) em links clicáveis que abrem o artigo
// real na tela de Legislação. Se nada for detectado, ou se onAbrirArtigo
// não for passado, renderiza o texto puro sem nenhuma mudança visual.
// 'revogados' é um Set com dois formatos de chave: "codigo|numero" (artigo
// revogado) e "codigo|numero|paragrafo|inciso" (dispositivo citado revogado,
// ex.: "cp|121|2|VI"). Quando a citação aponta pra algo que já não está mais
// vigente, mostra aviso em vez do link dourado normal, sem impedir o clique
// (a pessoa ainda pode conferir o texto revogado, só fica claro que ele não
// vale mais como está).
export default function TextoComReferenciasLegais({ texto, theme, onAbrirArtigo, revogados }) {
  if (!texto) return null
  if (!onAbrirArtigo) return <>{texto}</>

  const refs = extrairReferenciasComDispositivo(texto)
  if (refs.length === 0) return <>{texto}</>

  const partes = []
  let cursor = 0
  refs.forEach((ref, i) => {
    if (ref.start > cursor) partes.push(texto.slice(cursor, ref.start))
    const artigoRevogado = !!revogados?.has(chaveArtigo(ref.codigo, ref.numero))
    const dispositivoRevogado = !artigoRevogado && !!ref.dispositivo
      && !!revogados?.has(chaveDispositivo(ref.codigo, ref.numero, ref.dispositivo))
    const revogado = artigoRevogado || dispositivoRevogado
    const aviso = artigoRevogado
      ? 'Este artigo não está mais vigente. Confira antes de citar em peça'
      : `Este dispositivo (${descreverDispositivo(ref.dispositivo)}) não está mais vigente. Confira antes de citar em peça`
    partes.push(
      <span key={i}
        onClick={() => onAbrirArtigo(ref.codigo, ref.numero)}
        title={revogado ? aviso : 'Abrir na Legislação'}
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
