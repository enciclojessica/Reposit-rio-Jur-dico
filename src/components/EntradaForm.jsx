import { useState, useRef } from 'react'
import { AREAS, TIPOS, emptyEntry, FieldLabel, SectionLabel, BtnGold, BtnMuted } from '../shared'
import TagInput from './TagInput'
import { useTheme } from '../theme'

const MAX_PDF_MB = 10

export default function EntradaForm({ initial, onSave, onCancel, loading }) {
  const { theme, mode } = useTheme()
  const [entry, setEntry]         = useState(initial || emptyEntry())
  const [extraindo, setExtraindo] = useState(false)
  const [erroOcr, setErroOcr]    = useState('')
  const [pdfNome, setPdfNome]    = useState('')
  const fileRef = useRef()

  function setF(field, val) { setEntry(e => ({ ...e, [field]: val })) }
  function setT(i, field, val) {
    setEntry(e => {
      const teses = [...e.teses]
      teses[i] = { ...teses[i], [field]: val }
      return { ...e, teses }
    })
  }
  function addTese() {
    setEntry(e => ({
      ...e,
      teses: [...e.teses, {
        tese_assunto: '', fundamentacao_legal: '',
        precedente_sumula: '', ratio_decidendi: '', aplicacao_pratica: '',
      }],
    }))
  }
  function removeTese(i) {
    setEntry(e => ({ ...e, teses: e.teses.filter((_, j) => j !== i) }))
  }

  // ── OCR de PDF ──────────────────────────────────────────────────────────
  async function handlePDF(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setErroOcr(`Arquivo muito grande. Limite: ${MAX_PDF_MB}MB.`)
      return
    }

    setErroOcr('')
    setExtraindo(true)
    setPdfNome(file.name)

    try {
      // Converter para base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch('/api/extrair-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_base64: base64, filename: file.name }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const d = json.dados

      // Pré-preencher formulário com dados extraídos
      setEntry(prev => ({
        ...prev,
        area:       d.area && AREAS[d.area] ? d.area : prev.area,
        tema:       d.ementa ? d.ementa.slice(0, 100).trimEnd() + '...' : prev.tema,
        tipo:       'jurisprudência',
        fonte:      d.tribunal || prev.fonte,
        referencia: [d.tipo_item, d.numero].filter(Boolean).join(' ') || prev.referencia,
        url:        d.url || prev.url,
        teses: d.teses?.length
          ? d.teses.map((t, i) => ({
              tese_assunto:        t,
              fundamentacao_legal: i === 0 ? (d.fundamentacao_legal || '') : '',
              precedente_sumula:   i === 0 ? ([d.tipo_item, d.numero].filter(Boolean).join(' ') || '') : '',
              ratio_decidendi:     '',
              aplicacao_pratica:   '',
            }))
          : prev.teses,
        _zotero: {
          tipo_item:      d.tipo_item   || '',
          titulo_ementa:  d.ementa      || '',
          autor_tribunal: d.tribunal    || '',
          relator:        d.relator     || '',
          data:           d.data        || '',
          url:            d.url         || '',
        },
      }))
    } catch (err) {
      setErroOcr('Erro ao processar PDF: ' + err.message)
      setPdfNome('')
    }
    setExtraindo(false)
  }

  const inp = (val, fn, placeholder, multiline = false) => multiline
    ? <textarea value={val} onChange={ev => fn(ev.target.value)} placeholder={placeholder} rows={3} />
    : <input value={val} onChange={ev => fn(ev.target.value)} placeholder={placeholder} />

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  }

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Importar PDF ───────────────────────────────────────────────── */}
      <div style={{
        ...cardStyle,
        border: `1px dashed ${extraindo ? theme.gold : theme.border}`,
        background: extraindo
          ? (mode === 'dark' ? '#1a1a0a' : '#fffdf0')
          : theme.cardBg,
        transition: 'all .2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: theme.text, fontWeight: 600, marginBottom: 3 }}>
              {extraindo ? '⟳ Extraindo dados do PDF...' : '📄 Importar PDF do Acórdão'}
            </div>
            <div style={{ fontSize: 11, color: theme.muted }}>
              {pdfNome
                ? `Arquivo: ${pdfNome}`
                : `Upload do PDF — o sistema extrai ementa, relator, data e teses automaticamente. Máx. ${MAX_PDF_MB}MB.`
              }
            </div>
          </div>
          <label style={{
            background: extraindo ? theme.border : `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`,
            color: extraindo ? theme.muted : '#0b0f1a',
            borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700,
            cursor: extraindo ? 'not-allowed' : 'pointer',
            fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap',
            pointerEvents: extraindo ? 'none' : 'auto',
          }}>
            {extraindo ? 'Processando...' : '+ Selecionar PDF'}
            <input ref={fileRef} type="file" accept=".pdf" onChange={handlePDF} style={{ display: 'none' }} disabled={extraindo} />
          </label>
        </div>

        {erroOcr && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: mode === 'dark' ? '#3b0f0f' : '#fef2f2', border: `1px solid ${theme.error}`, borderRadius: 6, fontSize: 12, color: theme.error }}>
            ✕ {erroOcr}
          </div>
        )}

        {pdfNome && !extraindo && !erroOcr && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: mode === 'dark' ? '#0f2b1a' : '#f0fdf4', border: `1px solid ${theme.success}`, borderRadius: 6, fontSize: 12, color: theme.success }}>
            ✓ Dados extraídos com sucesso. Revise os campos abaixo antes de salvar.
          </div>
        )}
      </div>

      {/* ── Identificação ──────────────────────────────────────────────── */}
      <div style={cardStyle}>
        <SectionLabel>Identificação</SectionLabel>
        <FieldLabel>Área</FieldLabel>
        <select value={entry.area} onChange={e => setF('area', e.target.value)}>
          {Object.keys(AREAS).map(a => <option key={a}>{a}</option>)}
        </select>
        <FieldLabel>Tipo</FieldLabel>
        <select value={entry.tipo} onChange={e => setF('tipo', e.target.value)}>
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <FieldLabel>Tema / Assunto</FieldLabel>
        {inp(entry.tema, v => setF('tema', v), 'Ex: Dano moral — requisitos e configuração')}
        <FieldLabel>Fonte (Tribunal / Autor)</FieldLabel>
        {inp(entry.fonte, v => setF('fonte', v), 'Ex: STJ, TJSP, Caio Mário da Silva Pereira')}
        <FieldLabel>Referência</FieldLabel>
        {inp(entry.referencia, v => setF('referencia', v), 'Ex: REsp 1.234.567/SP, Súmula 479 STJ, Art. 186 CC')}
        <FieldLabel>Tags</FieldLabel>
        <TagInput
          tags={entry.tags || []}
          onChange={v => setF('tags', v)}
          todasAsTags={[]}
        />
        <FieldLabel>URL (opcional)</FieldLabel>
        {inp(entry.url, v => setF('url', v), 'https://')}
      </div>

      {/* ── Metadados Zotero (quando extraídos do PDF) ─────────────────── */}
      {entry._zotero && (
        <div style={{ ...cardStyle, border: `1px solid ${theme.gold}33` }}>
          <SectionLabel>Metadados Extraídos (Zotero)</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FieldLabel>Tipo de Item</FieldLabel>
              {inp(entry._zotero.tipo_item, v => setEntry(e => ({ ...e, _zotero: { ...e._zotero, tipo_item: v } })), 'Acórdão, Decisão...')}
            </div>
            <div>
              <FieldLabel>Relator</FieldLabel>
              {inp(entry._zotero.relator, v => setEntry(e => ({ ...e, _zotero: { ...e._zotero, relator: v } })), 'Nome do relator')}
            </div>
            <div>
              <FieldLabel>Data</FieldLabel>
              {inp(entry._zotero.data, v => setEntry(e => ({ ...e, _zotero: { ...e._zotero, data: v } })), 'YYYY-MM-DD')}
            </div>
            <div>
              <FieldLabel>Tribunal / Autor</FieldLabel>
              {inp(entry._zotero.autor_tribunal, v => setEntry(e => ({ ...e, _zotero: { ...e._zotero, autor_tribunal: v } })), 'STJ, TJSP...')}
            </div>
          </div>
          <FieldLabel>Ementa</FieldLabel>
          {inp(entry._zotero.titulo_ementa, v => setEntry(e => ({ ...e, _zotero: { ...e._zotero, titulo_ementa: v } })), 'Ementa completa', true)}
        </div>
      )}

      {/* ── Teses ──────────────────────────────────────────────────────── */}
      {entry.teses.map((t, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionLabel>Tese {i + 1}</SectionLabel>
            {entry.teses.length > 1 && (
              <button onClick={() => removeTese(i)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 18 }}>✕</button>
            )}
          </div>
          <FieldLabel>Tese / Assunto</FieldLabel>
          {inp(t.tese_assunto, v => setT(i, 'tese_assunto', v), 'Enunciado da tese')}
          <FieldLabel>Fundamentação Legal</FieldLabel>
          {inp(t.fundamentacao_legal, v => setT(i, 'fundamentacao_legal', v), 'Art. X, Lei Y / Súmula Z')}
          <FieldLabel>Ratio Decidendi</FieldLabel>
          {inp(t.ratio_decidendi, v => setT(i, 'ratio_decidendi', v), 'Fundamento determinante da decisão', true)}
          <FieldLabel>Aplicação Prática</FieldLabel>
          {inp(t.aplicacao_pratica, v => setT(i, 'aplicacao_pratica', v), 'Como utilizar em peças processuais', true)}
          <FieldLabel>Precedente / Súmula</FieldLabel>
          {inp(t.precedente_sumula, v => setT(i, 'precedente_sumula', v), 'Ex: REsp 1.234.567/SP, Súmula 370 STJ')}
        </div>
      ))}

      <BtnMuted onClick={addTese} style={{ width: '100%', marginBottom: 12, textAlign: 'center' }}>
        + Adicionar outra tese
      </BtnMuted>

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnMuted onClick={onCancel} style={{ flex: 1 }}>Cancelar</BtnMuted>
        <BtnGold onClick={() => onSave(entry)} disabled={loading || extraindo || !entry.tema} style={{ flex: 2 }}>
          {loading ? 'Salvando...' : 'Salvar'}
        </BtnGold>
      </div>
    </div>
  )
}
