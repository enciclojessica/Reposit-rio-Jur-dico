// Agrupa as linhas de legislacao alteradas na semana por artigo. Códigos com carga em lote (mais de 80 linhas
// na janela, como uma importação) viram uma linha-resumo, para não afogar as mudanças reais.
export function agruparMudancasLei(linhas, historico, corte) {
  const histPorLinha = new Map()
  for (const h of historico) if (!histPorLinha.has(h.legislacao_id)) histPorLinha.set(h.legislacao_id, h)
  const porCodigo = new Map()
  for (const l of linhas) {
    if (!porCodigo.has(l.codigo)) porCodigo.set(l.codigo, [])
    porCodigo.get(l.codigo).push(l)
  }
  const lotes = []
  const artigos = new Map()
  for (const [codigo, lista] of porCodigo) {
    if (lista.length > 80) {
      lotes.push({ codigo, total: lista.length, quando: lista[0].atualizado_em })
      continue
    }
    for (const l of lista) {
      const chave = `${codigo}|${l.numero}|${l.titulo || ''}`
      if (!artigos.has(chave)) artigos.set(chave, { chave, codigo, numero: l.numero, titulo: l.titulo, quando: l.atualizado_em, norma: '', itens: [] })
      const a = artigos.get(chave)
      const h = histPorLinha.get(l.id)
      if (h?.lei_alteradora && !a.norma.includes(h.lei_alteradora)) a.norma = a.norma ? `${a.norma} e ${h.lei_alteradora}` : h.lei_alteradora
      const status = h ? 'Alterado' : (l.criado_em >= corte ? 'Novo' : 'Atualizado')
      a.itens.push({ id: l.id, texto: l.texto, vigente: l.vigente, status })
    }
  }
  return { artigos: [...artigos.values()].sort((x, y) => String(y.quando).localeCompare(String(x.quando))), lotes }
}
