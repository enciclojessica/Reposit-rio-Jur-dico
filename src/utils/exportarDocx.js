import {
  Document, Packer, Paragraph, TextRun,
  HeadingLevel, AlignmentType, BorderStyle,
  Footer, PageNumber, TabStopType, TabStopPosition,
} from 'docx'

const A4_W   = 11906
const A4_H   = 16838
const MARGIN = 1701

function extrairCitacoes(texto, entradas) {
  const regex = /\(([^)]{3,80})\)/g
  const encontradas = new Set()
  let m
  while ((m = regex.exec(texto)) !== null) {
    const trecho = m[1]
    const entry = entradas.find(e =>
      (e.fonte  && trecho.includes(e.fonte)) ||
      (e.referencia && trecho.includes(e.referencia)) ||
      (e.tema   && trecho.includes(e.tema.slice(0, 20)))
    )
    if (entry) encontradas.add(entry.id)
  }
  return entradas.filter(e => encontradas.has(e.id))
}

function citacaoABNT(entry) {
  const fonte  = (entry.fonte || '').toUpperCase()
  const tema   = entry.tema   || ''
  const ref    = entry.referencia || ''
  const url    = entry.url    || ''
  const acesso = new Date().toLocaleDateString('pt-BR')
  const tipo   = entry.tipo   || 'jurisprudência'
  if (tipo === 'lei')      return `BRASIL. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'doutrina') return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'súmula')   return `${fonte}. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
}

function parseLinha(linha) {
  const trim = linha.trim()
  if (trim.startsWith('## '))
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 180 },
      children: [new TextRun({ text: trim.slice(3), bold: true, size: 28, font: 'Arial' })],
    })
  if (trim.startsWith('### '))
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: trim.slice(4), bold: true, size: 24, font: 'Arial' })],
    })
  if (!trim)
    return new Paragraph({ spacing: { before: 0, after: 160 } })

  const runs = []
  const partes = trim.split(/(\*\*[^*]+\*\*)/)
  for (const parte of partes) {
    if (parte.startsWith('**') && parte.endsWith('**'))
      runs.push(new TextRun({ text: parte.slice(2, -2), bold: true, size: 24, font: 'Arial' }))
    else if (parte)
      runs.push(new TextRun({ text: parte, size: 24, font: 'Arial' }))
  }
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: 200, line: 360 },
    indent: { firstLine: 709 },
    children: runs,
  })
}

export async function exportarDocx({ titulo, conteudo, entradas = [] }) {
  const citadas = extrairCitacoes(conteudo, entradas)
  const data    = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const corpo   = conteudo.split('\n').map(parseLinha)

  const secReferencias = citadas.length > 0 ? [
    new Paragraph({
      spacing: { before: 720, after: 360 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'C9A452', space: 6 } },
      children: [new TextRun({ text: 'REFERÊNCIAS', bold: true, size: 24, font: 'Arial' })],
    }),
    ...citadas.map(e => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 200, line: 240 },
      children: [new TextRun({ text: citacaoABNT(e), size: 22, font: 'Arial' })],
    })),
  ] : []

  const cabecalho = titulo ? [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
      children: [new TextRun({ text: titulo, bold: true, size: 28, font: 'Arial' })],
    }),
  ] : []

  const rodape = new Footer({
    children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: data, size: 18, font: 'Arial', color: '888888' }),
      ],
    })],
  })

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 24 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
          run: { size: 28, bold: true, font: 'Arial' },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
          run: { size: 24, bold: true, font: 'Arial' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: A4_W, height: A4_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      footers: { default: rodape },
      children: [...cabecalho, ...corpo, ...secReferencias],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const nome = (titulo || 'peca').replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').replace(/\s+/g, '_').slice(0, 50)
  a.href = url; a.download = `${nome}.docx`; a.click()
  URL.revokeObjectURL(url)
}
