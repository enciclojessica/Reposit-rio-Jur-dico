import { useState, useRef } from 'react'
import { Upload, Download, Check, X, AlertCircle, RotateCcw } from 'lucide-react'
import * as XLSX from 'xlsx'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { AREAS, TIPOS, STATUS_META, corDaArea } from '../shared'

// ── Colunas esperadas e mapeamento flexível ───────────────────────────────
const COLUNAS = {
  area:               ['area', 'área'],
  tipo:               ['tipo'],
  tema:               ['tema', 'assunto', 'título', 'titulo'],
  fonte:              ['fonte', 'tribunal', 'autor'],
  referencia:         ['referencia', 'referência', 'número', 'numero', 'processo'],
  url:                ['url', 'link'],
  status:             ['status'],
  tags:               ['tags', 'etiquetas'],
  tese_assunto:       ['tese_assunto', 'tese', 'enunciado'],
  fundamentacao_legal:['fundamentacao_legal', 'fundamentação', 'fundamentacao', 'fundamento', 'lei'],
  precedente_sumula:  ['precedente_sumula', 'precedente', 'súmula', 'sumula'],
  ratio_decidendi:    ['ratio_decidendi', 'ratio', 'fundamento_determinante'],
  aplicacao_pratica:  ['aplicacao_pratica', 'aplicação', 'aplicacao', 'como_usar'],
}

function mapearColunas(headers) {
  const mapa = {}
  const headersLower = headers.map(h => String(h).toLowerCase().trim().replace(/\s+/g, '_'))
  for (const [campo, aliases] of Object.entries(COLUNAS)) {
    const idx = headersLower.findIndex(h => aliases.some(a => h.includes(a)))
    if (idx !== -1) mapa[campo] = headers[idx]
  }
  return mapa
}

function validarLinha(linha, mapa, i) {
  const erros = []
  const area = String(linha[mapa.area] || '').trim()
  const tipo  = String(linha[mapa.tipo] || '').trim().toLowerCase()
  const tema  = String(linha[mapa.tema] || '').trim()

  if (!tema) erros.push('tema obrigatório')
  if (area && !Object.keys(AREAS).includes(area))
    erros.push(`área inválida: "${area}" (use Cível, Penal, Constitucional, Trabalhista, Tributário, Administrativo, Consumidor, Família, Previdenciário, Ambiental, Internacional ou Digital)`)
  if (tipo && !TIPOS.includes(tipo))
    erros.push(`tipo inválido: "${tipo}"`)

  return erros
}

function parseLinha(linha, mapa) {
  const area   = String(linha[mapa.area] || 'Cível').trim()
  const tipo   = String(linha[mapa.tipo] || 'jurisprudência').trim().toLowerCase()
  const status = String(linha[mapa.status] || 'vigente').trim().toLowerCase()
  const tagsRaw = String(linha[mapa.tags] || '').trim()
  const tags   = tagsRaw ? tagsRaw.split(/[,;]/).map(t => t.trim().toLowerCase()).filter(Boolean) : []

  return {
    area:      Object.keys(AREAS).includes(area) ? area : 'Cível',
    tipo:      TIPOS.includes(tipo) ? tipo : 'jurisprudência',
    tema:      String(linha[mapa.tema] || '').trim(),
    fonte:     String(linha[mapa.fonte] || '').trim(),
    referencia:String(linha[mapa.referencia] || '').trim(),
    url:       String(linha[mapa.url] || '').trim(),
    status:    Object.keys(STATUS_META).includes(status) ? status : 'vigente',
    tags,
    teses: [{
      tese_assunto:        String(linha[mapa.tese_assunto]        || '').trim(),
      fundamentacao_legal: String(linha[mapa.fundamentacao_legal] || '').trim(),
      precedente_sumula:   String(linha[mapa.precedente_sumula]   || '').trim(),
      ratio_decidendi:     String(linha[mapa.ratio_decidendi]     || '').trim(),
      aplicacao_pratica:   String(linha[mapa.aplicacao_pratica]   || '').trim(),
    }],
  }
}

function gerarTemplate() {
  const cabecalho = [
    'area', 'tipo', 'tema', 'fonte', 'referencia', 'url', 'status', 'tags',
    'tese_assunto', 'fundamentacao_legal', 'precedente_sumula', 'ratio_decidendi', 'aplicacao_pratica',
  ]
  const exemplo = [
    'Cível', 'jurisprudência',
    'Responsabilidade civil por dano moral — negativação indevida',
    'STJ', 'REsp 1.234.567/SP', 'https://www.stj.jus.br', 'vigente', 'consumidor, banco',
    'A inscrição indevida em cadastro de inadimplentes gera dano moral in re ipsa.',
    'Art. 186 CC; Art. 42 CDC', 'Súmula 385 STJ',
    'O dano decorre da própria inscrição, independentemente de prova.',
    'Usar em petições de indenização por negativação indevida.',
  ]
  const ws = XLSX.utils.aoa_to_sheet([cabecalho, exemplo])
  ws['!cols'] = cabecalho.map((_, i) => ({ wch: i < 2 ? 14 : i < 4 ? 40 : 20 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Repositório Jurídico')
  XLSX.writeFile(wb, 'template_repositorio_juridico.xlsx')
}

// ── Componente ────────────────────────────────────────────────────────────
export default function ImportacaoLote({ session }) {
  const { theme, mode } = useTheme()
  const fileRef = useRef()

  const [etapa, setEtapa]         = useState('upload')  // upload | preview | importando | concluido
  const [linhas, setLinhas]       = useState([])
  const [erros, setErros]         = useState({})
  const [progresso, setProgresso] = useState(0)
  const [resultados, setResultados] = useState({ ok: 0, erro: 0, errosMsgs: [] })
  const [erroArquivo, setErroArquivo] = useState('')

  function handleArquivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setErroArquivo('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const wb   = XLSX.read(ev.target.result, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (!rows.length) { setErroArquivo('Planilha vazia.'); return }

        const headers = Object.keys(rows[0])
        const mapa    = mapearColunas(headers)

        if (!mapa.tema) {
          setErroArquivo('Coluna "tema" não encontrada. Baixe o template para ver o formato esperado.')
          return
        }

        const errosPorLinha = {}
        const linhasValidas = rows.map((row, i) => {
          const e = validarLinha(row, mapa, i)
          if (e.length) errosPorLinha[i] = e
          return { raw: row, parsed: parseLinha(row, mapa), idx: i }
        })

        setLinhas(linhasValidas)
        setErros(errosPorLinha)
        setEtapa('preview')
      } catch (err) {
        setErroArquivo('Erro ao ler o arquivo: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function importar() {
    setEtapa('importando')
    let inseridos = 0, atualizados = 0, erro = 0
    const errosMsgs = []

    const validas = linhas.filter(l => !erros[l.idx])
    for (let i = 0; i < validas.length; i++) {
      const l = validas[i]
      const payload = { ...l.parsed, criado_por: session.user.id }

      // Verificar se já existe entrada com o mesmo tema NA MESMA ÁREA
      // (só por tema seria falso positivo: "Dano moral" existe em Cível E
      // em Consumidor, por exemplo — mesclar as duas seria perda de dados)
      const { data: existentes } = await supabase
        .from('entradas')
        .select('id')
        .ilike('tema', payload.tema.trim())
        .eq('area', payload.area)
        .limit(1)

      if (existentes && existentes.length > 0) {
        const { error } = await supabase
          .from('entradas')
          .update({ ...payload, criado_por: undefined })
          .eq('id', existentes[0].id)
        if (error) { erro++; errosMsgs.push(`Linha ${i + 2}: "${payload.tema.slice(0, 50)}" — ${error.message}`) }
        else atualizados++
      } else {
        const { error } = await supabase.from('entradas').insert(payload)
        if (error) { erro++; errosMsgs.push(`Linha ${i + 2}: "${payload.tema.slice(0, 50)}" — ${error.message}`) }
        else inseridos++
      }
      setProgresso(Math.round(((i + 1) / validas.length) * 100))
    }

    setResultados({ ok: inseridos + atualizados, inseridos, atualizados, erro, errosMsgs })
    setEtapa('concluido')
  }

  function reiniciar() {
    setEtapa('upload')
    setLinhas([])
    setErros({})
    setProgresso(0)
    setErroArquivo('')
  }

  const card = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }
  const validas  = linhas.filter(l => !erros[l.idx]).length
  const invalidas = linhas.length - validas

  return (
    <div style={{ paddingBottom: 40, maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Importação em Lote
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>
          Importe múltiplas entradas de uma vez via planilha Excel ou CSV.
        </div>
      </div>

      {/* ── Etapa 1: Upload ─────────────────────────────────────────────── */}
      {etapa === 'upload' && (
        <>
          <div style={{ ...card, borderStyle: 'dashed', textAlign: 'center', padding: 40 }}>
            <div style={{ marginBottom: 12, opacity: 0.4, display: 'flex', justifyContent: 'center' }}>
              <Upload size={40} color={theme.muted} />
            </div>
            <div style={{ fontSize: 14, color: theme.text, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
              Selecione uma planilha para importar
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>
              Formatos aceitos: .xlsx, .xls, .csv
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={gerarTemplate}
                style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '10px 20px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14} /> Template
              </button>
              <label style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 24px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                + Selecionar arquivo
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleArquivo} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {erroArquivo && (
            <div style={{ background: mode === 'dark' ? '#3b0f0f' : '#fef2f2', border: `1px solid ${theme.error}`, borderRadius: 10, padding: 14, fontSize: 13, color: theme.error }}>
              ✕ {erroArquivo}
            </div>
          )}

          {/* Instruções */}
          <div style={card}>
            <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
              Formato esperado
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    {['Coluna', 'Obrigatório', 'Valores aceitos', 'Exemplo'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 10px', background: theme.bg, color: theme.muted, borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['tema', '✓', 'Texto livre', 'Dano moral — banco de dados'],
                    ['area', '', 'Cível · Penal · Constitucional · Trabalhista · Tributário · Administrativo · Consumidor · Família · Previdenciário · Ambiental · Internacional · Digital', 'Cível'],
                    ['tipo', '', 'jurisprudência · doutrina · súmula · lei', 'jurisprudência'],
                    ['fonte', '', 'Texto livre', 'STJ'],
                    ['referencia', '', 'Texto livre', 'REsp 1.234.567/SP'],
                    ['status', '', 'vigente · vinculante · em_revisao · superada', 'vigente'],
                    ['tags', '', 'Separadas por vírgula', 'consumidor, banco'],
                    ['tese_assunto', '', 'Texto livre', 'Inscrição indevida gera dano moral in re ipsa.'],
                    ['fundamentacao_legal', '', 'Texto livre', 'Art. 186 CC'],
                    ['ratio_decidendi', '', 'Texto livre', 'Dano prescinde de prova.'],
                    ['aplicacao_pratica', '', 'Texto livre', 'Usar em petições de indenização.'],
                  ].map(([col, req, vals, ex]) => (
                    <tr key={col}>
                      <td style={{ padding: '6px 10px', fontFamily: 'Inter, sans-serif', color: theme.gold, borderBottom: `1px solid ${theme.border}22` }}>{col}</td>
                      <td style={{ padding: '6px 10px', color: req ? theme.error : theme.muted, textAlign: 'center', borderBottom: `1px solid ${theme.border}22` }}>{req || '—'}</td>
                      <td style={{ padding: '6px 10px', color: theme.muted, borderBottom: `1px solid ${theme.border}22` }}>{vals}</td>
                      <td style={{ padding: '6px 10px', color: theme.text, borderBottom: `1px solid ${theme.border}22`, fontStyle: 'italic' }}>{ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Etapa 2: Preview ────────────────────────────────────────────── */}
      {etapa === 'preview' && (
        <>
          {/* Resumo */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ ...card, marginBottom: 0, flex: 1, minWidth: 140, borderLeft: `3px solid ${theme.success}` }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: theme.success, fontFamily: 'Inter, sans-serif' }}>{validas}</div>
              <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>prontas para importar</div>
            </div>
            {invalidas > 0 && (
              <div style={{ ...card, marginBottom: 0, flex: 1, minWidth: 140, borderLeft: `3px solid ${theme.error}` }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: theme.error, fontFamily: 'Inter, sans-serif' }}>{invalidas}</div>
                <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>com erros — serão ignoradas</div>
              </div>
            )}
          </div>

          {/* Tabela de preview */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    {['#', 'Área', 'Tipo', 'Tema', 'Fonte', 'Tese', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', background: theme.bg, color: theme.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map(({ parsed, idx }) => {
                    const temErro = !!erros[idx]
                    const s = STATUS_META[parsed.status] || STATUS_META['vigente']
                    return (
                      <tr key={idx} style={{ background: temErro ? (mode === 'dark' ? '#2a0a0a' : '#fff5f5') : 'transparent' }}>
                        <td style={{ padding: '8px 12px', color: temErro ? theme.error : theme.muted, borderBottom: `1px solid ${theme.border}22`, whiteSpace: 'nowrap' }}>
                          {temErro ? <X size={11} color={theme.error} /> : <Check size={11} color={theme.success} />} {idx + 1}
                        </td>
                        <td style={{ padding: '8px 12px', color: corDaArea(parsed.area, theme), borderBottom: `1px solid ${theme.border}22`, whiteSpace: 'nowrap' }}>{parsed.area}</td>
                        <td style={{ padding: '8px 12px', color: theme.muted, borderBottom: `1px solid ${theme.border}22`, whiteSpace: 'nowrap' }}>{parsed.tipo}</td>
                        <td style={{ padding: '8px 12px', color: theme.text, borderBottom: `1px solid ${theme.border}22`, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {parsed.tema || <span style={{ color: theme.error }}>— sem tema —</span>}
                          {temErro && <div style={{ fontSize: 10, color: theme.error }}>{erros[idx].join(' · ')}</div>}
                        </td>
                        <td style={{ padding: '8px 12px', color: theme.muted, borderBottom: `1px solid ${theme.border}22`, whiteSpace: 'nowrap' }}>{parsed.fonte}</td>
                        <td style={{ padding: '8px 12px', color: theme.muted, borderBottom: `1px solid ${theme.border}22`, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parsed.teses[0]?.tese_assunto}</td>
                        <td style={{ padding: '8px 12px', borderBottom: `1px solid ${theme.border}22`, whiteSpace: 'nowrap' }}>
                          <span style={{ color: s.cor, fontSize: 10 }}>{s.icon} {s.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={reiniciar}
              style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              ← Cancelar
            </button>
            <button onClick={importar} disabled={validas === 0}
              style={{ background: validas === 0 ? theme.border : theme.gold, color: validas === 0 ? theme.muted : '#0b0f1a', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: validas === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Importar {validas} entrada{validas !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}

      {/* ── Etapa 3: Importando ─────────────────────────────────────────── */}
      {etapa === 'importando' && (
        <div style={{ ...card, textAlign: 'center', padding: 60 }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <RotateCcw size={32} color={theme.gold} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <div style={{ fontSize: 14, color: theme.text, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>Importando entradas...</div>
          <div style={{ background: theme.border, borderRadius: 8, height: 8, overflow: 'hidden', maxWidth: 320, margin: '0 auto' }}>
            <div style={{ height: '100%', background: theme.gold, width: `${progresso}%`, transition: 'width .3s ease', borderRadius: 8 }} />
          </div>
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 10 }}>{progresso}%</div>
        </div>
      )}

      {/* ── Etapa 4: Concluído ──────────────────────────────────────────── */}
      {etapa === 'concluido' && (
        <div style={{ ...card, textAlign: 'center', padding: 50 }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{resultados.erro === 0 ? <Check size={40} color={theme.success} /> : <AlertCircle size={40} color={theme.error} />}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>
            Importação concluída
          </div>
          <div style={{ fontSize: 14, color: theme.text, marginBottom: 6 }}>
            {resultados.inseridos > 0 && <span style={{ color: theme.success }}>{resultados.inseridos} nova{resultados.inseridos !== 1 ? 's' : ''}</span>}
             {resultados.inseridos > 0 && resultados.atualizados > 0 && <span style={{ color: theme.muted }}> · </span>}
             {resultados.atualizados > 0 && <span style={{ color: '#c9a452' }}>{resultados.atualizados} atualizada{resultados.atualizados !== 1 ? 's' : ''}</span>}
            {resultados.erro > 0 && <span style={{ color: theme.error }}> · {resultados.erro} com erro</span>}
          </div>

          {resultados.errosMsgs && resultados.errosMsgs.length > 0 && (
            <div style={{ marginTop: 16, textAlign: 'left', background: theme.inputBg, border: `1px solid ${theme.error}44`, borderRadius: 8, padding: '12px 16px', maxHeight: 200, overflowY: 'auto' }}>
              <div style={{ fontSize: 11, color: theme.error, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace' }}>
                Detalhes dos erros
              </div>
              {resultados.errosMsgs.map((msg, i) => (
                <div key={i} style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4, lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {msg}
                </div>
              ))}
            </div>
          )}

          <button onClick={reiniciar}
            style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 20 }}>
            Importar mais
          </button>
        </div>
      )}
    </div>
  )
}
