import * as XLSX from 'xlsx'

export function exportarPlanilhaTeses(entradas) {
  const cabecalho = [
    'area', 'tipo', 'tema', 'fonte', 'referencia', 'url', 'status', 'tags',
    'tese_assunto', 'fundamentacao_legal', 'precedente_sumula', 'ratio_decidendi', 'aplicacao_pratica',
  ]

  const linhas = []

  entradas.forEach(function(e) {
    const teses = Array.isArray(e.teses) && e.teses.length > 0 ? e.teses : [{}]
    teses.forEach(function(t) {
      linhas.push([
        e.area || '',
        e.tipo || '',
        e.tema || '',
        e.tribunal || '',
        e.numero_processo || '',
        e.url || '',
        e.status || '',
        Array.isArray(e.tags) ? e.tags.join(', ') : (e.tags || ''),
        t.tese_assunto || '',
        t.fundamentacao_legal || '',
        t.precedente_sumula || '',
        t.ratio_decidendi || '',
        t.aplicacao_pratica || '',
      ])
    })
  })

  const ws = XLSX.utils.aoa_to_sheet([cabecalho].concat(linhas))
  ws['!cols'] = [14, 14, 40, 20, 20, 20, 12, 20, 40, 20, 20, 30, 30].map(function(w) { return { wch: w } })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Teses')

  const nome = 'repositorio_teses_' + new Date().toISOString().slice(0, 10) + '.xlsx'
  XLSX.writeFile(wb, nome)
}
