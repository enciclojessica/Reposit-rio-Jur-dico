// Leitura do texto de uma emenda ou lei alteradora e comparação com a tabela `legislacao`.
//
// Só interpreta os blocos entre aspas que o Planalto publica ("Art. 7º ...", "§ 2º ...", "XIII - ..."),
// com as reticências marcando o que não muda. Não inventa nada: tudo o que o parser não consegue
// afirmar vira aviso para a pessoa conferir antes de aplicar.
//
// Convenções de saída (iguais às da tabela `legislacao`, ver CLAUDE.md):
//   numero    inteiro do artigo
//   titulo    'Art. 7-A' para artigo com letra, senão null
//   paragrafo '1', '4-A', 'único' ou null
//   inciso    'XIII', 'III-e' (alínea sob inciso), 'e' (alínea sob § ou caput) ou null

import { compararDispositivos } from '../../lib/ordemDispositivos'

const RE_RODAPE = /^(https?:\/\/|\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2})/
const RE_SO_PONTOS = /^[.\s…]*$/
const RE_FIM_BLOCO = /["”]\s*\((NR|AC)\)\s*$/
const RE_INICIO_BLOCO = /^["“]\s*(Art\.|§|Parágrafo único|[IVXLC]+\s+-|[a-z]\))/
const RE_ARTIGO = /^Art\.\s*(\d+(?:\.\d+)?)\s*[ºo°]?\s*(?:-\s*([A-Z]))?\.?\s*(.*)$/
const RE_PARAGRAFO = /^§\s*(\d+)\s*[ºo°]?\s*(?:-\s*([A-Z]))?\.?\s*(.*)$/
const RE_UNICO = /^Parágrafo único\.?\s*(.*)$/
const RE_INCISO = /^([IVXLC]+)(?:\s*-\s*([A-Z]))?\s+-\s+(.*)$/
const RE_ALINEA = /^([a-z])\)\s*(.*)$/

function limparLinha(l) {
  return l.replace(/\s+/g, ' ').trim()
}

function semAspas(t) {
  return t.replace(/^["“]\s*/, '').replace(/["”]\s*\((NR|AC)\)\s*$/, '').replace(/["”]\s*$/, '').trim()
}

// Une as linhas de um bloco em "unidades" (uma por dispositivo), descartando rodapés.
function unidadesDoBloco(linhas) {
  const unidades = []
  let atual = null
  for (const bruta of linhas) {
    let l = limparLinha(bruta)
    if (!l || RE_RODAPE.test(l)) continue
    if (RE_SO_PONTOS.test(l)) { atual = null; continue }
    const eh = RE_ARTIGO.test(l) || RE_PARAGRAFO.test(l) || RE_UNICO.test(l) || RE_INCISO.test(l) || RE_ALINEA.test(l)
    if (eh) { atual = { linhas: [l] }; unidades.push(atual) } else if (atual) atual.linhas.push(l)
  }
  return unidades.map(u => u.linhas.join(' '))
}

// Remove só os pontos de reticência do rótulo ("Art. 7º ....") e devolve '' se não sobrar texto.
function corpoSemPontos(corpo) {
  const c = corpo.replace(/^[.\s…]+/, '').trim()
  return RE_SO_PONTOS.test(c) ? '' : corpo.trim()
}

export function parseEmenda(texto, { codigo = 'cf' } = {}) {
  const linhas = String(texto || '').split(/\r?\n/)
  const dispositivos = []
  const avisos = []
  let i = 0
  while (i < linhas.length) {
    if (!RE_INICIO_BLOCO.test(limparLinha(linhas[i]))) { i++; continue }
    const bloco = []
    let fechou = false
    while (i < linhas.length) {
      bloco.push(linhas[i])
      if (RE_FIM_BLOCO.test(limparLinha(linhas[i]))) { fechou = true; i++; break }
      i++
    }
    if (!fechou) avisos.push('Bloco entre aspas sem o marcador final (NR) ou (AC): conferir o fim do texto.')
    bloco[0] = semAspas(limparLinha(bloco[0]))
    bloco[bloco.length - 1] = semAspas(limparLinha(bloco[bloco.length - 1]))
    lerBloco(unidadesDoBloco(bloco), codigo, dispositivos, avisos)
  }
  return { dispositivos, avisos }
}

function lerBloco(unidades, codigo, saida, avisos) {
  let art = null // { numero, letra }
  let par = null
  let inc = null
  for (const u of unidades) {
    let m
    if ((m = u.match(RE_ARTIGO))) {
      art = { numero: Number(m[1].replace('.', '')), letra: m[2] || null }
      par = null; inc = null
      const corpo = corpoSemPontos(m[3])
      if (corpo) saida.push(montar(codigo, art, null, null, u))
      continue
    }
    if (!art) { avisos.push(`Dispositivo fora de artigo, ignorado: "${u.slice(0, 60)}"`); continue }
    if ((m = u.match(RE_UNICO))) {
      par = 'único'; inc = null
      const corpo = corpoSemPontos(m[1])
      if (corpo) saida.push(montar(codigo, art, null, par, u))
      continue
    }
    if ((m = u.match(RE_PARAGRAFO))) {
      par = m[1] + (m[2] ? `-${m[2]}` : ''); inc = null
      const corpo = corpoSemPontos(m[3])
      if (corpo) saida.push(montar(codigo, art, null, par, u))
      continue
    }
    if ((m = u.match(RE_INCISO))) {
      inc = m[1] + (m[2] ? `-${m[2]}` : '')
      const corpo = corpoSemPontos(m[3])
      if (corpo) saida.push(montar(codigo, art, inc, par, u))
      continue
    }
    if ((m = u.match(RE_ALINEA))) {
      const corpo = corpoSemPontos(m[2])
      if (corpo) saida.push(montar(codigo, art, inc ? `${inc}-${m[1]}` : m[1], par, u))
    }
  }
}

function montar(codigo, art, inciso, paragrafo, unidade) {
  let texto = unidade
  const d = { codigo, numero: art.numero, titulo: art.letra ? `Art. ${art.numero}-${art.letra}` : null, inciso, paragrafo, texto: '', vigenciaDiferida: false, avisos: [] }
  if (/\(Vig[êe]ncia\)\s*$/.test(texto)) {
    texto = texto.replace(/\s*\(Vig[êe]ncia\)\s*$/, '')
    d.vigenciaDiferida = true
    d.avisos.push('Marcado "(Vigência)" na fonte: entrada em vigor diferida, conferir o artigo final da norma.')
  }
  // Convenção da CF no banco: parágrafo com letra, sem ponto após o rótulo ("§ 4º-A É vedada").
  if (codigo === 'cf' && paragrafo && /-[A-Z]$/.test(paragrafo) && !inciso) {
    texto = texto.replace(/^(§\s*\d+\s*[ºo°]?-[A-Z])\.\s+/, '$1 ')
  }
  d.texto = texto.trim()
  return d
}

function norm(t) {
  return String(t || '').replace(/\s+/g, ' ').trim()
}

function mesmaChave(l, d) {
  return Number(l.numero) === d.numero
    && (l.titulo || null) === (d.titulo || null)
    && (l.inciso || null) === (d.inciso || null)
    && (l.paragrafo || null) === (d.paragrafo || null)
}

// Compara os dispositivos lidos com as linhas do banco (do mesmo código e dos artigos afetados).
// Cada item sai com status: 'igual' | 'alterar' | 'inserir' | 'ambiguo'.
export function compararComBanco(dispositivos, linhasBanco) {
  const itens = []
  const avisosGerais = []
  for (const d of dispositivos) {
    const achadas = linhasBanco.filter(l => mesmaChave(l, d))
    const item = { ...d, avisos: [...d.avisos] }
    if (achadas.length > 1) {
      item.status = 'ambiguo'
      item.avisos.push(`${achadas.length} linhas do banco correspondem a este dispositivo: resolver à mão.`)
    } else if (achadas.length === 1) {
      const l = achadas[0]
      item.id = l.id
      item.anterior = l.texto
      item.status = norm(l.texto) === norm(d.texto) ? 'igual' : 'alterar'
      if (item.status === 'alterar' && l.vigente === false) item.avisos.push('A linha atual está como não vigente.')
    } else {
      item.status = 'inserir'
      avisoPontuacao(item, linhasBanco, itens)
    }
    itens.push(item)
  }
  // Parágrafo único no banco e § 1º vindo da norma: provável renumeração.
  for (const d of itens) {
    if (d.paragrafo === '1' && !d.inciso) {
      const unico = linhasBanco.find(l => Number(l.numero) === d.numero && (l.titulo || null) === (d.titulo || null)
        && l.paragrafo === 'único' && !l.inciso)
      if (unico) d.avisos.push('O banco tem parágrafo único neste artigo: se a norma o numerou como § 1º, renumerar a linha existente.')
    }
  }
  return { itens, avisos: avisosGerais }
}

// Dispositivo novo logo depois de um irmão que termina em ponto final: pontuação encadeada.
function avisoPontuacao(item, linhasBanco, jaLidos) {
  if (!item.inciso) return
  const irmaos = [...linhasBanco.filter(l => Number(l.numero) === item.numero && (l.titulo || null) === (item.titulo || null)
    && (l.paragrafo || null) === (item.paragrafo || null) && l.inciso)
    , ...jaLidos.filter(j => j.status === 'inserir' && j.numero === item.numero && (j.paragrafo || null) === (item.paragrafo || null) && j.inciso)]
  const antes = irmaos
    .filter(l => compararDispositivos(l, item) < 0)
    .sort(compararDispositivos)
    .pop()
  if (antes && /\.\s*$/.test(antes.texto)) {
    item.avisos.push(`O dispositivo anterior (${antes.inciso}) termina com ponto final e este vem depois: conferir a pontuação no compilado (a norma pode não alterar o anterior).`)
  }
}

// Monta as operações para a função `aplicar_atualizacao` do banco.
export function montarOperacoes(itens, { selecionados } = {}) {
  const escolhido = (idx) => !selecionados || selecionados.has(idx)
  const ops = []
  itens.forEach((d, idx) => {
    if (!escolhido(idx)) return
    if (d.status === 'alterar') ops.push({ op: 'update', id: d.id, esperado: d.anterior, texto: d.texto })
    if (d.status === 'inserir') {
      ops.push({
        op: 'insert', codigo: d.codigo, numero: d.numero, titulo: d.titulo, inciso: d.inciso,
        paragrafo: d.paragrafo, texto: d.texto, vigente: true, origem: 'planalto.gov.br',
      })
    }
  })
  return ops
}

export function rotuloDispositivo(d) {
  const partes = [`Art. ${d.numero}${d.titulo ? d.titulo.replace(/^Art\.\s*\d+/, '') : ''}`]
  if (d.paragrafo) partes.push(d.paragrafo === 'único' ? 'parágrafo único' : `§ ${d.paragrafo}`)
  if (d.inciso) partes.push(d.inciso)
  return partes.join(', ')
}
