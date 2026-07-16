import {
  Document, Packer, Paragraph, TextRun,
  HeadingLevel, AlignmentType, BorderStyle,
  Footer, TabStopType, TabStopPosition,
  PageBreak,
} from 'docx'

const A4_W   = 11906
const A4_H   = 16838
const MARGIN = 1701

function citacaoABNT(entry) {
  const fonte  = (entry.fonte || '').toUpperCase()
  const url    = entry.url || ''
  const acesso = new Date().toLocaleDateString('pt-BR')
  const tipo   = entry.tipo || 'jurisprudência'
  if (tipo === 'lei')      return `BRASIL. ${entry.referencia || entry.tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'doutrina') return `${fonte}. ${entry.tema}. ${entry.referencia || ''}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'súmula')   return `${fonte}. ${entry.referencia || entry.tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  return `${fonte}. ${entry.tema}. ${entry.referencia || ''}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
}

function txt(text, opts = {}) {
  return new TextRun({ text: String(text || ''), font: 'Times New Roman', size: 24, ...opts })
}

function paragrafo(children, opts = {}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts })
}

function divisor() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'C9A452', space: 4 } },
    spacing: { before: 240, after: 240 },
    children: [],
  })
}

function labelValor(label, valor) {
  if (!valor) return null
  return paragrafo([
    txt(`${label}: `, { bold: true, size: 22, color: '666666' }),
    txt(valor, { size: 22 }),
  ], { spacing: { before: 60, after: 60 } })
}

export async function exportarRepositorioDocx(entradas) {
  const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const areas = ['Cível', 'Penal', 'Doutrina']

  const sections = []

  // ── Capa ──────────────────────────────────────────────────────────────
  const capa = [
    paragrafo(txt('REPOSITÓRIO JURÍDICO', { bold: true, size: 40, color: 'C9A452' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 200 },
    }),
    paragrafo(txt('Farias Fusquiani', { size: 28, color: '888888' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
    }),
    paragrafo(txt(data, { size: 22, color: 'aaaaaa' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 1000 },
    }),
    divisor(),
    paragrafo(txt(`${entradas.length} entrada(s) · ${areas.map(a => `${a}: ${entradas.filter(e => e.area === a).length}`).join(' · ')}`, { size: 20, color: '888888' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 0 },
    }),
  ]

  // ── Entradas agrupadas por área ────────────────────────────────────────
  const conteudo = []

  for (const area of areas) {
    const grupo = entradas.filter(e => e.area === area)
    if (!grupo.length) continue

    // Título da área
    conteudo.push(new Paragraph({ children: [new PageBreak()] }))
    conteudo.push(paragrafo(txt(area.toUpperCase(), { bold: true, size: 32, color: 'C9A452' }), {
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 360 },
    }))
    conteudo.push(divisor())

    for (const entry of grupo) {
      // Título da entrada
      conteudo.push(paragrafo(txt(entry.tema || '', { bold: true, size: 28 }), {
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 480, after: 120 },
      }))

      // Metadados
      const meta = [
        labelValor('Tipo', entry.tipo),
        labelValor('Fonte', entry.fonte),
        labelValor('Referência', entry.referencia),
        labelValor('Status', entry.status),
        entry.url ? paragrafo([txt('URL: ', { bold: true, size: 22, color: '666666' }), txt(entry.url, { size: 22, color: '1155CC' })], { spacing: { before: 60, after: 60 } }) : null,
        entry.tags?.length ? labelValor('Tags', entry.tags.map(t => `#${t}`).join(' · ')) : null,
      ].filter(Boolean)

      if (meta.length) {
        conteudo.push(new Paragraph({
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'C9A452', space: 8 } },
          spacing: { before: 60, after: 60 },
          indent: { left: 360 },
          children: [],
        }))
        meta.forEach(p => {
          if (p) {
            p.properties = p.properties || {}
            p.indent = { left: 360 }
            conteudo.push(p)
          }
        })
      }

      // Teses
      for (let ti = 0; ti < (entry.teses || []).length; ti++) {
        const t = entry.teses[ti]
        conteudo.push(paragrafo(txt(`Tese ${ti + 1}`, { bold: true, size: 24, color: '444444' }), {
          spacing: { before: 240, after: 80 },
        }))

        const campos = [
          ['Enunciado', t.tese_assunto],
          ['Fundamentação Legal', t.fundamentacao_legal],
          ['Precedente / Súmula', t.precedente_sumula],
          ['Ratio Decidendi', t.ratio_decidendi],
          ['Aplicação Prática', t.aplicacao_pratica],
        ]

        for (const [label, valor] of campos) {
          if (!valor) continue
          conteudo.push(paragrafo(txt(label, { bold: true, size: 20, color: '888888' }), {
            spacing: { before: 80, after: 30 },
          }))
          conteudo.push(paragrafo(txt(valor), {
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 0, after: 80, line: 300 },
            indent: { left: 360 },
          }))
        }
      }

      // ABNT
      conteudo.push(paragrafo(txt('Referência ABNT', { bold: true, size: 20, color: '888888' }), {
        spacing: { before: 160, after: 40 },
      }))
      conteudo.push(paragrafo(txt(citacaoABNT(entry), { size: 20, color: '555555' }), {
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 0, after: 120, line: 264 },
        indent: { left: 360 },
      }))
    }
  }

  // ── Rodapé ───────────────────────────────────────────────────────────
  const rodape = new Footer({
    children: [paragrafo([
      txt(`Lex.IA · Farias Fusquiani · ${data}`, { size: 16, color: 'aaaaaa' }),
    ], { alignment: AlignmentType.CENTER })],
  })

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
    sections: [
      {
        properties: { page: { size: { width: A4_W, height: A4_H }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
        footers: { default: rodape },
        children: [...capa, ...conteudo],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `repositorio_juridico_${new Date().toISOString().slice(0, 10)}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
