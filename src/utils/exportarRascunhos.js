import {
  Document, Packer, Paragraph, TextRun,
  HeadingLevel, AlignmentType, BorderStyle,
  Footer, PageBreak,
} from 'docx'
import { supabase } from '../supabase'
import { parseLinha } from './exportarDocx'

const A4_W   = 11906
const A4_H   = 16838
const MARGIN = 1701

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

export async function exportarRascunhosDocx(session) {
  if (!session) throw new Error('É preciso estar logada para exportar os rascunhos.')

  const { data: rascunhos, error } = await supabase
    .from('pecas_rascunhos').select('*').eq('user_id', session.user.id)
    .order('atualizado_em', { ascending: false })

  if (error) throw new Error('Erro ao buscar os rascunhos: ' + error.message)
  if (!rascunhos || !rascunhos.length) throw new Error('Nenhum rascunho salvo ainda.')

  const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const capa = [
    paragrafo(txt('MEUS RASCUNHOS DE PEÇAS', { bold: true, size: 40, color: 'C9A452' }), {
      alignment: AlignmentType.CENTER, spacing: { before: 2000, after: 200 },
    }),
    paragrafo(txt(data, { size: 22, color: 'aaaaaa' }), {
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 1000 },
    }),
    divisor(),
    paragrafo(txt(`${rascunhos.length} rascunho(s)`, { size: 20, color: '888888' }), {
      alignment: AlignmentType.CENTER, spacing: { before: 200, after: 0 },
    }),
  ]

  const conteudo = []
  for (const r of rascunhos) {
    conteudo.push(new Paragraph({ children: [new PageBreak()] }))
    conteudo.push(paragrafo(txt(r.titulo || 'Sem título', { bold: true, size: 32, color: 'C9A452' }), {
      heading: HeadingLevel.HEADING_1, spacing: { before: 0, after: 100 },
    }))
    conteudo.push(paragrafo([
      txt(`${r.rito ? r.rito + ' · ' : ''}Atualizado em ${new Date(r.atualizado_em).toLocaleDateString('pt-BR')}`, { size: 18, color: '888888', italics: true }),
    ], { spacing: { before: 0, after: 200 } }))
    conteudo.push(divisor())

    const linhas = (r.conteudo || '').split('\n')
    for (const linha of linhas) conteudo.push(parseLinha(linha))
  }

  const rodape = new Footer({
    children: [paragrafo([
      txt(`Themis Jur · Rascunhos de Peças · ${data}`, { size: 16, color: 'aaaaaa' }),
    ], { alignment: AlignmentType.CENTER })],
  })

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
    sections: [{
      properties: { page: { size: { width: A4_W, height: A4_H }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
      footers: { default: rodape },
      children: [...capa, ...conteudo],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `rascunhos_pecas_${new Date().toISOString().slice(0, 10)}.docx`
  a.click()
  URL.revokeObjectURL(url)

  return rascunhos.length
}
