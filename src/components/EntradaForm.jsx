import { useState, useRef } from 'react'
import { supabase } from '../supabase'
import { AREAS, TIPOS, emptyEntry, FieldLabel, SectionLabel, BtnGold, BtnMuted } from '../shared'
import TagInput from './TagInput'
import { useTheme } from '../theme'
import { AlertTriangle, CheckCircle } from 'lucide-react'

const MAX_PDF_MB = 10

// Campos gerados por IA que exigem revisão
const IA_FIELDS = ['ratio_decidendi', 'aplicacao_pratica']

// Badge visual de status IA por campo
function IaBadge({ status, theme }) {
  if (!status || status === 'manual') return null
  if (status === 'ia_revisado') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10,
        color: theme.success, fontFamily: 'IBM Plex Mono, monospace', marginLeft: 8 }}>
        <CheckCircle size={10} /> Revisado
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10,
      color: '#c9a452', fontFamily: 'IBM Plex Mono, monospace', marginLeft: 8 }}>
      <AlertTriangle size={10} /> Gerado por IA · Revise antes de salvar
    </span>
  )
}

export default function EntradaForm({ initial, onSave, onCancel, loading }) {
  const { theme, mode } = useTheme()
  const [entry, setEntry]         = useState(initial || emptyEntry())
  const [extraindo, setExtraindo] = useState(false)
  const [erroOcr, setErroOcr]    = useState('')
  const [pdfNome, setPdfNome]    = useState('')
  // Rastreia status IA por campo de tese: { `${teseIdx}_ratio_decidendi`: 'ia_pendente'|'ia_revisado'|'manual' }
  const [iaStatus, setIaStatus]  = useState({})
  const fileRef = useRef()

  function setF(field, val) { setEntry(e => ({ ...e, [field]: val })) }

  function setT(i, field, val) {
    setEntry(e => {
      const teses = [...e.teses]
      teses[i] = { ...teses[i], [field]: val }
      return { ...e, teses }
    })
    // Quando usuário edita campo IA, marca como revisado
    const key = `${i}_${field}`
    if (iaStatus[key] === 'ia_pendente') {
      setIaStatus(prev => ({ ...prev, [key]: 'ia_revisado' }))
    }
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
    // Limpar status IA do índice removido
    setIaStatus(prev => {
      const next = { ...prev }
      IA_FIELDS.forEach(f => delete next[`${i}_${f}`])
      return next
    })
  }

  // Retorna true se ainda há campos IA pendentes de revisão
  const temPendentes = Object.values(iaStatus).some(v => v === 'ia_pendente')

  // ── OCR de PDF — extração completa com ratio e aplicação ───────────────
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
    setIaStatus({})

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faça login novamente.')

      const keyRes = await fetch('/api/get-anthropic-config?t=' + Date.now(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify({ user_id: session.user.id }),
      })
      const keyRaw = await keyRes.text()
      if (!keyRaw || !keyRaw.trim()) throw new Error('Configuração da API indisponível.')
      const keyJson = JSON.parse(keyRaw)
      if (!keyRes.ok || keyJson.error) throw new Error(keyJson.error || 'Erro ao obter configuração.')
      const apiKey = keyJson.key

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      if (!base64 || base64.length < 100) throw new Error('PDF não pôde ser lido (' + (base64?.length ?? 0) + ' chars).')

      const systemPrompt = `Você é um assistente de análise jurídica de alta precisão. Analise o acórdão fornecido e retorne SOMENTE JSON válido, sem markdown, sem explicações.

INSTRUÇÕES DE EXTRAÇÃO:

1. METADADOS (dados literais do documento — não inferir):
   - tipo_item, ementa, tribunal, relator, data (YYYY-MM-DD), numero, url, fundamentacao_legal

2. TESES (array — identifique cada tese distinta do julgado):
   - tese_assunto: enunciado objetivo da tese

3. RATIO DECIDENDI (por tese):
   - Localize o trecho exato do voto que contém o argumento jurídico DETERMINANTE para o resultado.
   - Ignore: obiter dicta, votos vencidos, argumentos subsidiários, considerações introdutórias.
   - Sintetize em linguagem técnica a partir do trecho localizado.
   - Se houver ambiguidade sobre o que é ratio e o que é obiter, indique isso no campo com o prefixo [VERIFICAR]:

4. APLICAÇÃO PRÁTICA (por tese):
   - Se o próprio relator ou ementa mencionar aplicação ou âmbito de incidência, extraia literalmente.
   - Se não houver menção expressa, infira com base na ratio e indique com o prefixo [IA]:

Estrutura JSON obrigatória:
{
  "tipo_item": "string",
  "ementa": "string",
  "tribunal": "string",
  "relator": "string",
  "data": "string",
  "numero": "string",
  "url": "string",
  "fundamentacao_legal": "string",
  "teses": [
    {
      "tese_assunto": "string",
      "ratio_decidendi": "string",
      "aplicacao_pratica": "string"
    }
  ]
}`

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'pdfs-2024-09-25',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            { type: 'text', text: 'Analise o acórdão e retorne APENAS o JSON conforme instruído.' }
          ]}],
        }),
      })

      const claudeRaw = await claudeRes.text()
      if (!claudeRes.ok) {
        let detalhe = claudeRaw.slice(0, 200)
        try { detalhe = JSON.parse(claudeRaw)?.error?.message || detalhe } catch {}
        throw new Error('Claude HTTP ' + claudeRes.status + ': ' + detalhe)
      }
      if (!claudeRaw || !claudeRaw.trim()) throw new Error('Claude retornou resposta vazia.')

      const claudeJson = JSON.parse(claudeRaw)
      if (claudeJson.error) throw new Error(claudeJson.error.message || JSON.stringify(claudeJson.error))

      const rawText = (claudeJson.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      let d
      try { d = JSON.parse(rawText.trim()) }
      catch {
        const match = rawText.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('IA não retornou JSON válido.')
        d = JSON.parse(match[0])
      }

      // Marcar status IA para campos ratio e aplicacao de cada tese
      const newIaStatus = {}
      if (d.teses?.length) {
        d.teses.forEach((_, i) => {
          newIaStatus[`${i}_ratio_decidendi`]   = 'ia_pendente'
          newIaStatus[`${i}_aplicacao_pratica`] = 'ia_pendente'
        })
      }
      setIaStatus(newIaStatus)

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
              tese_assunto:        t.tese_assunto || '',
              fundamentacao_legal: i === 0 ? (d.fundamentacao_legal || '') : '',
              precedente_sumula:   i === 0 ? ([d.tipo_item, d.numero].filter(Boolean).join(' ') || '') : '',
              ratio_decidendi:     t.ratio_decidendi || '',
              aplicacao_pratica:   t.aplicacao_pratica || '',
            }))
          : prev.teses,
        ia_status: 'ia_pendente',
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

  // Campo de texto com estilo condicional por status IA
  function IaField({ value, onChange, placeholder, teseIdx, fieldName, multiline = true }) {
    const key    = `${teseIdx}_${fieldName}`
    const status = iaStatus[key]
    const isPending  = status === 'ia_pendente'
    const isRevisado = status === 'ia_revisado'

    const borderColor = isPending
      ? '#c9a452'
      : isRevisado
        ? (theme.success || '#10b981')
        : theme.border

    const borderStyle = isPending ? 'dashed' : 'solid'
    const bg = isPending
      ? (mode === 'dark' ? '#1c1600' : '#fffbeb')
      : theme.cardBg

    const style = {
      background: bg,
      border: `1px ${borderStyle} ${borderColor}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: theme.text,
      fontSize: 13,
      width: '100%',
      outline: 'none',
      fontFamily: 'Georgia, serif',
      resize: multiline ? 'vertical' : 'none',
      boxSizing: 'border-box',
      transition: 'border-color .2s, background .2s',
    }

    return multiline
      ? <textarea value={value} onChange={ev => onChange(ev.target.value)} placeholder={placeholder} rows={3} style={style} />
      : <input value={value} onChange={ev => onChange(ev.target.value)} placeholder={placeholder} style={style} />
  }

  const inp = (val, fn, placeholder, multiline = false) => {
    const style = {
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 6,
      padding: '8px 12px',
      color: theme.text,
      fontSize: 13,
      width: '100%',
      outline: 'none',
      fontFamily: 'inherit',
      resize: multiline ? 'vertical' : 'none',
      boxSizing: 'border-box',
    }
    return multiline
      ? <textarea value={val} onChange={ev => fn(ev.target.value)} placeholder={placeholder} rows={3} style={style} />
      : <input value={val} onChange={ev => fn(ev.target.value)} placeholder={placeholder} style={style} />
  }

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  }

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Importar PDF ─────────────────────────────────────────────── */}
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
              {extraindo ? 'Extraindo e analisando o acórdão...' : 'Importar PDF do Acórdão'}
            </div>
            <div style={{ fontSize: 11, color: theme.muted }}>
              {pdfNome
                ? `Arquivo: ${pdfNome}`
                : `Upload do PDF — extrai metadados, teses, ratio decidendi e aplicação prática. Máx. ${MAX_PDF_MB}MB.`
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
            {erroOcr}
          </div>
        )}

        {pdfNome && !extraindo && !erroOcr && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: mode === 'dark' ? '#0f2b1a' : '#f0fdf4', border: `1px solid ${theme.success}`, borderRadius: 6, fontSize: 12, color: theme.success, lineHeight: 1.5 }}>
            Extração concluída. Campos com borda dourada tracejada foram gerados por IA e requerem revisão antes de salvar.
          </div>
        )}

        {/* Aviso de pendências */}
        {temPendentes && (
          <div style={{ marginTop: 8, padding: '8px 14px', background: mode === 'dark' ? '#1c1600' : '#fffbeb', border: '1px solid #c9a452', borderRadius: 6, fontSize: 11, color: '#c9a452', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'IBM Plex Mono, monospace' }}>
            <AlertTriangle size={12} />
            Há campos gerados por IA ainda não revisados. Edite-os para confirmar a revisão.
          </div>
        )}
      </div>

      {/* ── Identificação ────────────────────────────────────────────── */}
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
        <div style={{ fontSize: 10, color: entry.tema.length > 120 ? theme.error : theme.muted, textAlign: 'right', marginTop: 2 }}>
          {entry.tema.length}/150 caracteres
        </div>
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

      {/* ── Metadados Zotero ─────────────────────────────────────────── */}
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

      {/* ── Teses ────────────────────────────────────────────────────── */}
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

          {/* Ratio Decidendi — campo IA */}
          <div style={{ marginTop: 12 }}>
            <FieldLabel style={{ display: 'inline' }}>Ratio Decidendi</FieldLabel>
            <IaBadge status={iaStatus[`${i}_ratio_decidendi`]} theme={theme} />
          </div>
          <IaField
            value={t.ratio_decidendi}
            onChange={v => setT(i, 'ratio_decidendi', v)}
            placeholder="Fundamento determinante da decisão"
            teseIdx={i}
            fieldName="ratio_decidendi"
          />

          {/* Aplicação Prática — campo IA */}
          <div style={{ marginTop: 12 }}>
            <FieldLabel style={{ display: 'inline' }}>Aplicação Prática</FieldLabel>
            <IaBadge status={iaStatus[`${i}_aplicacao_pratica`]} theme={theme} />
          </div>
          <IaField
            value={t.aplicacao_pratica}
            onChange={v => setT(i, 'aplicacao_pratica', v)}
            placeholder="Como utilizar em peças processuais"
            teseIdx={i}
            fieldName="aplicacao_pratica"
          />

          <FieldLabel>Precedente / Súmula</FieldLabel>
          {inp(t.precedente_sumula, v => setT(i, 'precedente_sumula', v), 'Ex: REsp 1.234.567/SP, Súmula 370 STJ')}
        </div>
      ))}

      <BtnMuted onClick={addTese} style={{ width: '100%', marginBottom: 12, textAlign: 'center' }}>
        + Adicionar outra tese
      </BtnMuted>

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnMuted onClick={() => {
          const temDados = entry.tema.trim() || entry.fonte.trim() || entry.teses[0]?.tese_assunto?.trim()
          if (temDados && !confirm('Descartar as alterações? Os dados não salvos serão perdidos.')) return
          onCancel()
        }} style={{ flex: 1 }}>Cancelar</BtnMuted>
        <BtnGold onClick={() => onSave({ ...entry, ia_status: temPendentes ? 'ia_pendente' : entry.ia_status || 'manual' })} disabled={loading || extraindo || !entry.tema} style={{ flex: 2 }}>
          {loading ? 'Salvando...' : 'Salvar'}
        </BtnGold>
      </div>
    </div>
  )
}
