import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

export default function ImportarLegislacao() {
  const { theme, mode } = useTheme()
  const fileRef = useRef()
  const [etapa, setEtapa]         = useState('upload')
  const [linhas, setLinhas]       = useState([])
  const [erros, setErros]         = useState([])
  const [progresso, setProgresso] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [erroArquivo, setErroArquivo] = useState('')

  function handleArquivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setErroArquivo('')

    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const wb   = XLSX.read(ev.target.result, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (!rows.length) { setErroArquivo('Planilha vazia.'); return }

        const validas = []
        const errosLista = []

        rows.forEach((row, i) => {
          const codigo = String(row.codigo || '').trim().toLowerCase()
          const numero = parseInt(row.numero)
          const texto  = String(row.texto  || '').trim()

          if (!codigo)   { errosLista.push(`Linha ${i+2}: campo "codigo" vazio`); return }
          if (!numero)   { errosLista.push(`Linha ${i+2}: campo "numero" inválido`); return }
          if (!texto)    { errosLista.push(`Linha ${i+2}: campo "texto" vazio`); return }

          validas.push({
            codigo,
            numero,
            inciso:    String(row.inciso    || '').trim() || null,
            paragrafo: String(row.paragrafo || '').trim() || null,
            titulo:    String(row.titulo    || '').trim() || null,
            texto,
            vigente:   true,
          })
        })

        setLinhas(validas)
        setErros(errosLista)
        setEtapa('preview')
      } catch (err) {
        setErroArquivo('Erro ao ler arquivo: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function importar() {
    setEtapa('importando')
    let ok = 0, erro = 0
    const LOTE = 50

    for (let i = 0; i < linhas.length; i += LOTE) {
      const lote = linhas.slice(i, i + LOTE)
      const { error } = await supabase.from('legislacao').insert(lote)
      if (error) erro += lote.length
      else ok += lote.length
      setProgresso(Math.round(((i + LOTE) / linhas.length) * 100))
    }

    setResultado({ ok, erro })
    setEtapa('concluido')
  }

  function reiniciar() {
    setEtapa('upload'); setLinhas([]); setErros([])
    setProgresso(0); setResultado(null); setErroArquivo('')
  }

  const card = {
    background: theme.cardBg, border: `1px solid ${theme.border}`,
    borderRadius: 12, padding: 20, marginBottom: 16,
  }

  return (
    <div style={{ paddingBottom: 40, maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
          Importar Legislação
        </div>
        <div style={{ fontSize: 12, color: theme.muted }}>
          Importe artigos de leis para o banco de legislação. Use as planilhas geradas (.xlsx).
        </div>
      </div>

      {/* Upload */}
      {etapa === 'upload' && (
        <>
          <div style={{ ...card, borderStyle: 'dashed', textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>📜</div>
            <div style={{ fontSize: 14, color: theme.text, marginBottom: 8 }}>
              Selecione a planilha de legislação (.xlsx)
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>
              Use os arquivos gerados: cpc_para_importar.xlsx, lei9099_para_importar.xlsx
            </div>
            <label style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 24px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
              + Selecionar arquivo
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleArquivo} style={{ display: 'none' }} />
            </label>
          </div>
          {erroArquivo && (
            <div style={{ background: mode==='dark'?'#3b0f0f':'#fef2f2', border:`1px solid ${theme.error}`, borderRadius:10, padding:14, fontSize:13, color:theme.error }}>
              ✕ {erroArquivo}
            </div>
          )}
        </>
      )}

      {/* Preview */}
      {etapa === 'preview' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ ...card, marginBottom: 0, flex: 1, borderLeft: `3px solid ${theme.success}` }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: theme.success, fontFamily: 'IBM Plex Mono, monospace' }}>{linhas.length}</div>
              <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>prontos para importar</div>
            </div>
            {erros.length > 0 && (
              <div style={{ ...card, marginBottom: 0, flex: 1, borderLeft: `3px solid ${theme.error}` }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: theme.error, fontFamily: 'IBM Plex Mono, monospace' }}>{erros.length}</div>
                <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>linhas com erro (serão ignoradas)</div>
              </div>
            )}
          </div>

          {/* Tabela preview */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr>
                    {['Código', 'Art.', 'Inciso', 'Parágrafo', 'Texto (prévia)'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', background: theme.bg, color: theme.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.slice(0, 50).map((l, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${theme.border}22` }}>
                      <td style={{ padding: '6px 12px', color: theme.gold, fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap', fontWeight: 700 }}>{l.codigo?.toUpperCase()}</td>
                      <td style={{ padding: '6px 12px', color: theme.text, whiteSpace: 'nowrap' }}>{l.numero}</td>
                      <td style={{ padding: '6px 12px', color: theme.muted, whiteSpace: 'nowrap' }}>{l.inciso || '—'}</td>
                      <td style={{ padding: '6px 12px', color: theme.muted, whiteSpace: 'nowrap' }}>{l.paragrafo || '—'}</td>
                      <td style={{ padding: '6px 12px', color: theme.text, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.texto}</td>
                    </tr>
                  ))}
                  {linhas.length > 50 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '8px 12px', color: theme.muted, fontSize: 11, textAlign: 'center' }}>
                        ... e mais {linhas.length - 50} artigos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={reiniciar} style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>← Cancelar</button>
            <button onClick={importar} disabled={!linhas.length} style={{ background: theme.gold, color: '#0b0f1a', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
              Importar {linhas.length} artigo{linhas.length !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}

      {/* Importando */}
      {etapa === 'importando' && (
        <div style={{ ...card, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⟳</div>
          <div style={{ fontSize: 14, color: theme.text, marginBottom: 20 }}>Importando artigos...</div>
          <div style={{ background: theme.border, borderRadius: 8, height: 8, overflow: 'hidden', maxWidth: 320, margin: '0 auto' }}>
            <div style={{ height: '100%', background: theme.gold, width: `${Math.min(progresso, 100)}%`, transition: 'width .3s ease', borderRadius: 8 }} />
          </div>
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 10 }}>{Math.min(progresso, 100)}%</div>
        </div>
      )}

      {/* Concluído */}
      {etapa === 'concluido' && (
        <div style={{ ...card, textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{resultado?.erro === 0 ? '✓' : '⚠'}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>
            Importação concluída
          </div>
          <div style={{ fontSize: 14, color: theme.text, marginBottom: 6 }}>
            <span style={{ color: theme.success }}>{resultado?.ok} artigo{resultado?.ok !== 1 ? 's' : ''} importado{resultado?.ok !== 1 ? 's' : ''}</span>
            {resultado?.erro > 0 && <span style={{ color: theme.error }}> · {resultado.erro} com erro</span>}
          </div>
          <div style={{ fontSize: 12, color: theme.muted, marginBottom: 20 }}>
            Use /cpc 300 no Editor de Peças para inserir artigos
          </div>
          <button onClick={reiniciar} style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            Importar mais
          </button>
        </div>
      )}
    </div>
  )
}
