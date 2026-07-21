import {
  Document, Packer, Paragraph, TextRun,
  HeadingLevel, AlignmentType, BorderStyle,
  Footer, PageBreak,
} from 'docx'
import { supabase } from '../supabase'

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

// Lê todas as anotações pessoais salvas no localStorage (namespaces "entrada" e "questao").
// Retorna { entradaIds: [...], questaoIds: [...], notas: { [chaveOriginal]: texto } }
export function coletarAnotacoesDoLocalStorage() {
  const entradaIds = []
  const questaoIds = []
  const notas = {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      const texto = localStorage.getItem(key)
      if (!texto || !texto.trim()) continue

      const mEntrada = key.match(/^lexia_nota_entrada_(.+)$/)
      const mQuestao = key.match(/^lexia_nota_questao_(.+)$/)

      if (mEntrada) { entradaIds.push(mEntrada[1]); notas[key] = texto }
      else if (mQuestao) { questaoIds.push(mQuestao[1]); notas[key] = texto }
    }
  } catch { /* localStorage indisponível: exporta vazio */ }

  return { entradaIds, questaoIds, notas }
}

export async function exportarAnotacoesDocx(entradas) {
  const { entradaIds, questaoIds, notas } = coletarAnotacoesDoLocalStorage()

  if (!entradaIds.length && !questaoIds.length) {
    throw new Error('Nenhuma anotação encontrada neste navegador. As anotações ficam salvas localmente, então só aparecem no dispositivo onde foram escritas.')
  }

  // Busca as questões OAB referenciadas (só as que têm anotação, não o banco todo)
  let questoes = []
  if (questaoIds.length) {
    const { data } = await supabase
      .from('oab_questoes')
      .select('id, disciplina, topico, subtema, enunciado')
      .in('id', questaoIds)
    questoes = data || []
  }

  const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  // ── Capa ──────────────────────────────────────────────────────────────
  const totalNotas = entradaIds.length + questaoIds.length
  const capa = [
    paragrafo(txt('MEU CADERNO DE ESTUDOS', { bold: true, size: 40, color: 'C9A452' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 200 },
    }),
    paragrafo(txt('Anotações pessoais', { size: 28, color: '888888' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
    }),
    paragrafo(txt(data, { size: 22, color: 'aaaaaa' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 1000 },
    }),
    divisor(),
    paragrafo(txt(`${totalNotas} anotação(ões) · ${entradaIds.length} do Repositório · ${questaoIds.length} de Questões OAB`, { size: 20, color: '888888' }), {
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 0 },
    }),
  ]

  const conteudo = []

  // ── Anotações do Repositório ────────────────────────────────────────────
  if (entradaIds.length) {
    conteudo.push(new Paragraph({ children: [new PageBreak()] }))
    conteudo.push(paragrafo(txt('ANOTAÇÕES DO REPOSITÓRIO', { bold: true, size: 32, color: 'C9A452' }), {
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 360 },
    }))
    conteudo.push(divisor())

    for (const id of entradaIds) {
      const entry = (entradas || []).find(e => e.id === id)
      const nota = notas[`lexia_nota_entrada_${id}`]

      conteudo.push(paragrafo(txt(entry?.tema || 'Entrada removida do repositório', { bold: true, size: 26 }), {
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 80 },
      }))

      if (entry) {
        conteudo.push(paragrafo([
          txt(`${entry.area || ''}${entry.tipo ? ' · ' + entry.tipo : ''}`, { size: 20, color: '888888', italics: true }),
        ], { spacing: { before: 0, after: 100 } }))
      } else {
        conteudo.push(paragrafo(txt('(Este item não existe mais no repositório, mas sua anotação foi preservada abaixo.)', { size: 18, color: 'aa8800', italics: true }), {
          spacing: { before: 0, after: 100 },
        }))
      }

      conteudo.push(new Paragraph({
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'C9A452', space: 8 } },
        spacing: { before: 40, after: 200 },
        indent: { left: 360 },
        children: [txt(nota, { italics: true, size: 22 })],
      }))
    }
  }

  // ── Anotações de Questões OAB ───────────────────────────────────────────
  if (questaoIds.length) {
    conteudo.push(new Paragraph({ children: [new PageBreak()] }))
    conteudo.push(paragrafo(txt('ANOTAÇÕES DE QUESTÕES OAB', { bold: true, size: 32, color: 'C9A452' }), {
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 360 },
    }))
    conteudo.push(divisor())

    for (const id of questaoIds) {
      const questao = questoes.find(q => q.id === id)
      const nota = notas[`lexia_nota_questao_${id}`]

      conteudo.push(paragrafo(txt(questao ? (questao.subtema || questao.topico || questao.disciplina) : 'Questão removida', { bold: true, size: 26 }), {
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 80 },
      }))

      if (questao) {
        conteudo.push(paragrafo([
          txt(questao.disciplina || '', { size: 20, color: '888888', italics: true }),
        ], { spacing: { before: 0, after: 60 } }))
        if (questao.enunciado) {
          const trecho = questao.enunciado.length > 300 ? questao.enunciado.slice(0, 300) + '…' : questao.enunciado
          conteudo.push(paragrafo(txt(trecho, { size: 20, color: '666666' }), {
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 0, after: 100, line: 280 },
          }))
        }
      } else {
        conteudo.push(paragrafo(txt('(Esta questão não existe mais no banco, mas sua anotação foi preservada abaixo.)', { size: 18, color: 'aa8800', italics: true }), {
          spacing: { before: 0, after: 100 },
        }))
      }

      conteudo.push(new Paragraph({
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'C9A452', space: 8 } },
        spacing: { before: 40, after: 200 },
        indent: { left: 360 },
        children: [txt(nota, { italics: true, size: 22 })],
      }))
    }
  }

  // ── Rodapé ───────────────────────────────────────────────────────────
  const rodape = new Footer({
    children: [paragrafo([
      txt(`Themis Jur · Caderno de Estudos · ${data}`, { size: 16, color: 'aaaaaa' }),
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
  a.download = `caderno_de_estudos_${new Date().toISOString().slice(0, 10)}.docx`
  a.click()
  URL.revokeObjectURL(url)

  return totalNotas
}
