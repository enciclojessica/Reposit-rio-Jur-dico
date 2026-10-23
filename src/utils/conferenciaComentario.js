// Indicador de acurácia do comentário (contexto e aplicacao_pratica) de um caput da tabela `legislacao`.
// Colunas: comentario_conferencia, comentario_resultado, comentario_conferido_em (ver MIGRATION_indicador_acuracia_20261023.sql).

function dataBR(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

// Retorna null quando o caput não tem comentário; caso contrário { conferido, rotulo, detalhe }.
export function conferenciaComentario(caput) {
  if (!caput || !(caput.contexto || caput.aplicacao_pratica)) return null
  const nivel = caput.comentario_conferencia
  const resultado = caput.comentario_resultado
  const data = dataBR(caput.comentario_conferido_em)
  if (!nivel || !resultado || !data) {
    return { conferido: false, rotulo: 'Sem revisão independente', detalhe: 'Este comentário não passou por conferência registrada.' }
  }
  const quem = nivel === 'conferido_titular' ? 'Conferido pela curadoria' : 'Revisão independente'
  const rotulo = `${quem} em ${data}`
  const detalhe = resultado === 'corrigido'
    ? 'A revisão apontou ajustes, feitos e reconferidos antes da publicação.'
    : 'A revisão não apontou ajustes.'
  return { conferido: true, rotulo, detalhe }
}
