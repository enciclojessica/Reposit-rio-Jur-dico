import { useState, useRef, useMemo } from 'react'
import { supabase } from '../supabase'
import { AREAS, TIPOS, emptyEntry, FieldLabel, SectionLabel, BtnGold, BtnMuted, labelCampoTese } from '../shared'
import TagInput from './TagInput'
import { useTheme } from '../theme'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { ANTHROPIC_MODEL } from '../../lib/anthropicModel'
import { encontrarPossiveisDuplicatas } from '../utils/duplicatas'

const MAX_PDF_MB = 10
const IA_FIELDS = ['ratio_decidendi', 'aplicacao_pratica']

function IaBadge({ status, theme }) {
  if (!status || status === 'manual') return null
  if (status === 'ia_revisado') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11,
        color: theme.success, fontStyle: 'italic', fontFamily: theme.fontSerif, marginLeft: 8,
      }}>
        <CheckCircle size={11} /> Revisado
      </span>
    )
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11,
      color: theme.gold, fontStyle: 'italic', fontFamily: theme.fontSerif, marginLeft: 8,
    }}>
      <AlertTriangle size={11} /> Gerado por IA — revise antes de salvar
    </span>
  )
}

export default function EntradaForm({ initial, onSave, onCancel, loading, entradas }) {
  const { theme, mode } = useTheme()
  const [entry, setEntry]         = useState(initial || emptyEntry())

  const possiveisDuplicatas = useMemo(
    () => encontrarPossiveisDuplicatas(entry.tema, entradas, initial?.id),
    [entry.tema, entradas, initial?.id]
  )
  const [extraindo, setExtraindo] = useState(false)
  const [erroOcr, setErroOcr]    = useState('')
  const [pdfNome, setPdfNome]    = useState('')
  const [iaStatus, setIaStatus]  = useState({})
  const fileRef = useRef()

  function setF(field, val) { setEntry(e => ({ ...e, [field]: val })) }

  function setT(i, field, val) {
    setEntry(e => {
      const teses = [...e.teses]
      teses[i] = { ...teses[i], [field]: val }
      return { ...e, teses }
    })
    const key = i + '_' + field
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
    setIaStatus(prev => {
      const next = { ...prev }
      IA_FIELDS.forEach(f => delete next[i + '_' + f])
      return next
    })
  }

  const temPendentes = Object.values(iaStatus).some(v => v === 'ia_pendente')

  async function handlePDF(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    e.target.value = ''

    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setErroOcr('Arquivo muito grande. Limite: ' + MAX_PDF_MB + 'MB.')
      return
    }

    setErroOcr('')
    setExtraindo(true)
    setPdfNome(file.name)
    setIaStatus({})

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessao expirada. Faca login novamente.')

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload  = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      if (!base64 || base64.length < 100) throw new Error('PDF nao pôde ser lido (' + (base64 ? base64.length : 0) + ' chars).')

      const systemPrompt = [
        'Voce e um assistente de analise juridica de alta precisao.',
        'Analise o acórdão e retorne SOMENTE JSON válido, sem markdown, sem explicações.',
        '',
        'INSTRUCOES:',
        '1. METADADOS (dados literais — nao inferir): tipo_item, ementa, tribunal, relator, data (YYYY-MM-DD), numero, url, fundamentacao_legal',
        '2. TESES: identifique cada tese distinta do julgado',
        '3. RATIO DECIDENDI: localize o trecho exato do voto com o argumento DETERMINANTE para o resultado.',
        '   Ignore obiter dicta, votos vencidos, argumentos subsidiarios.',
        '   Sintetize em linguagem tecnica. Se houver ambiguidade, use o prefixo [VERIFICAR]:',
        '4. APLICACAO PRATICA: se o relator mencionar aplicacao, extraia literalmente.',
        '   Se nao houver mencao expressa, infira e use o prefixo [IA]:',
        '',
        'Estrutura JSON obrigatoria:',
        '{"tipo_item":"","ementa":"","tribunal":"","relator":"","data":"","numero":"","url":"","fundamentacao_legal":"",',
        '"teses":[{"tese_assunto":"","ratio_decidendi":"","aplicacao_pratica":""}]}',
      ].join('\n')

      const claudeRes = await fetch('/api/busca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 4000,
          beta: 'pdfs-2024-09-25',
          system: systemPrompt,
          messages: [{ role: 'user', content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            { type: 'text', text: 'Analise o acórdão e retorne APENAS o JSON conforme instruído.' },
          ]}],
        }),
      })

      const claudeRaw = await claudeRes.text()
      if (!claudeRes.ok) {
        let detalhe = claudeRaw.slice(0, 200)
        try { detalhe = JSON.parse(claudeRaw).error.message || detalhe } catch(err) {}
        throw new Error('Claude HTTP ' + claudeRes.status + ': ' + detalhe)
      }
      if (!claudeRaw || !claudeRaw.trim()) throw new Error('Claude retornou resposta vazia.')

      const claudeJson = JSON.parse(claudeRaw)
      if (claudeJson.error) throw new Error(claudeJson.error.message || JSON.stringify(claudeJson.error))

      const rawText = (claudeJson.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      let d
      try { d = JSON.parse(rawText.trim()) }
      catch(err) {
        const match = rawText.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('IA nao retornou JSON valido.')
        d = JSON.parse(match[0])
      }

      const newIaStatus = {}
      if (d.teses && d.teses.length) {
        d.teses.forEach(function(_, i) {
          newIaStatus[i + '_ratio_decidendi']   = 'ia_pendente'
          newIaStatus[i + '_aplicacao_pratica'] = 'ia_pendente'
        })
      }
      setIaStatus(newIaStatus)

      setEntry(function(prev) {
        return {
          ...prev,
          area:       (d.area && AREAS[d.area]) ? d.area : prev.area,
          tema:       d.ementa ? d.ementa.slice(0, 100).trimEnd() + '...' : prev.tema,
          tipo:       'jurisprudência',
          fonte:      d.tribunal || prev.fonte,
          referencia: [d.tipo_item, d.numero].filter(Boolean).join(' ') || prev.referencia,
          url:        d.url || prev.url,
          ia_status:  'ia_pendente',
          teses: (d.teses && d.teses.length)
            ? d.teses.map(function(t, i) {
                return {
                  tese_assunto:        t.tese_assunto || '',
                  fundamentacao_legal: i === 0 ? (d.fundamentacao_legal || '') : '',
                  precedente_sumula:   i === 0 ? ([d.tipo_item, d.numero].filter(Boolean).join(' ') || '') : '',
                  ratio_decidendi:     t.ratio_decidendi || '',
                  aplicacao_pratica:   t.aplicacao_pratica || '',
                }
              })
            : prev.teses,
          _zotero: {
            tipo_item:      d.tipo_item  || '',
            titulo_ementa:  d.ementa     || '',
            autor_tribunal: d.tribunal   || '',
            relator:        d.relator    || '',
            data:           d.data       || '',
            url:            d.url        || '',
          },
        }
      })
    } catch(err) {
      setErroOcr('Erro ao processar PDF: ' + err.message)
      setPdfNome('')
    }
    setExtraindo(false)
  }

  function IaField({ value, onChange, placeholder, teseIdx, fieldName, multiline }) {
    const key    = teseIdx + '_' + fieldName
    const status = iaStatus[key]
    const isPending  = status === 'ia_pendente'
    const isRevisado = status === 'ia_revisado'
    const borderColor = isPending ? '#c9a452' : isRevisado ? (theme.success || '#10b981') : theme.border
    const borderStyle = isPending ? 'dashed' : 'solid'
    const bg = isPending ? (mode === 'dark' ? '#1c1600' : '#fffbeb') : theme.cardBg
    const style = {
      background: bg,
      border: '1px ' + borderStyle + ' ' + borderColor,
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
    if (multiline !== false) {
      return <textarea value={value} onChange={ev => onChange(ev.target.value)} placeholder={placeholder} rows={3} style={style} />
    }
    return <input value={value} onChange={ev => onChange(ev.target.value)} placeholder={placeholder} style={style} />
  }

  function inp(val, fn, placeholder, multiline) {
    const style = {
      background: theme.cardBg,
      border: '1px solid ' + theme.border,
      borderRadius: 6,
      padding: '8px 12px',
      color: theme.text,
      fontSize: 13,
      width: '100%',
      outline: 'none',
      fontFamily: "Georgia, 'EB Garamond', serif",
      resize: multiline ? 'vertical' : 'none',
      boxSizing: 'border-box',
    }
    if (multiline) {
      return <textarea value={val} onChange={ev => fn(ev.target.value)} placeholder={placeholder} rows={3} style={style} />
    }
    return <input value={val} onChange={ev => fn(ev.target.value)} placeholder={placeholder} style={style} />
  }

  const selStyle = {
    background: theme.cardBg,
    border: '1px solid ' + theme.border,
    borderRadius: 6,
    padding: '8px 12px',
    color: theme.text,
    fontSize: 13,
    width: '100%',
    outline: 'none',
    fontFamily: "Georgia, 'EB Garamond', serif",
    boxSizing: 'border-box',
    marginBottom: 4,
  }

  const cardStyle = {
    background: theme.cardBg,
    border: '1px solid ' + theme.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  }

  return (
    <div style={{ paddingBottom: 40 }}>

      <div style={{
        ...cardStyle,
        border: '1px dashed ' + (extraindo ? theme.gold : theme.border),
        background: extraindo ? (mode === 'dark' ? '#1a1a0a' : '#fffdf0') : theme.cardBg,
        transition: 'all .2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: theme.text, fontWeight: 600, marginBottom: 3 }}>
              {extraindo ? 'Extraindo e analisando o acórdão…' : 'Importar PDF do acórdão'}
            </div>
            <div style={{ fontSize: 11, color: theme.muted }}>
              {pdfNome ? ('Arquivo: ' + pdfNome) : ('Upload do PDF — extrai metadados, teses, fundamento da decisao e aplicacao pratica. Max. ' + MAX_PDF_MB + 'MB.')}
            </div>
          </div>
          <label style={{
            background: extraindo ? theme.border : theme.gold,
            color: extraindo ? theme.muted : '#fdfbf7',
            borderRadius: 6, padding: '9px 16px', fontSize: 13, fontWeight: 600,
            cursor: extraindo ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
            pointerEvents: extraindo ? 'none' : 'auto',
          }}>
            {extraindo ? 'Processando...' : '+ Selecionar PDF'}
            <input ref={fileRef} type="file" accept=".pdf" onChange={handlePDF} style={{ display: 'none' }} disabled={extraindo} />
          </label>
        </div>

        {erroOcr && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: mode === 'dark' ? '#3b0f0f' : '#fef2f2', border: '1px solid ' + theme.error, borderRadius: 6, fontSize: 12, color: theme.error }}>
            {erroOcr}
          </div>
        )}

        {pdfNome && !extraindo && !erroOcr && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: mode === 'dark' ? '#0f2b1a' : '#f0fdf4', border: '1px solid ' + theme.success, borderRadius: 6, fontSize: 12, color: theme.success, lineHeight: 1.5 }}>
            Extração concluída. Campos com borda dourada tracejada foram gerados por IA e requerem revisão antes de salvar.
          </div>
        )}

        {temPendentes && (
          <div style={{ marginTop: 8, padding: '8px 14px', background: mode === 'dark' ? '#1c1600' : '#fffbeb', border: `1px solid ${theme.gold}`, borderRadius: 6, fontSize: 12, color: theme.gold, display: 'flex', alignItems: 'center', gap: 6, fontFamily: theme.fontSerif, fontStyle: 'italic' }}>
            <AlertTriangle size={13} />
            Há campos gerados por IA ainda não revisados. Edite-os para confirmar a revisão.
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <SectionLabel>Identificação</SectionLabel>
        <FieldLabel>Área</FieldLabel>
        <select value={entry.area} onChange={e => setF('area', e.target.value)} style={selStyle}>
          {Object.keys(AREAS).map(a => <option key={a}>{a}</option>)}
        </select>
        <FieldLabel>Tipo</FieldLabel>
        <select value={entry.tipo} onChange={e => setF('tipo', e.target.value)} style={selStyle}>
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <FieldLabel>Tema / Assunto</FieldLabel>
        {inp(entry.tema, v => setF('tema', v), 'Ex: Dano moral — requisitos e configuracao')}
        <div style={{ fontSize: 10, color: entry.tema.length > 120 ? theme.error : theme.muted, textAlign: 'right', marginTop: 2 }}>
          {entry.tema.length}/150 caracteres
        </div>

        {possiveisDuplicatas.length > 0 && (
          <div style={{ background: theme.raised, border: `1px solid ${theme.error}55`, borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: theme.error, fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
              <AlertTriangle size={13} /> Pode já existir algo parecido no acervo
            </div>
            {possiveisDuplicatas.map(({ entrada, score }) => (
              <div key={entrada.id} style={{ fontSize: 12, color: theme.text, fontFamily: "Georgia, 'EB Garamond', serif", padding: '3px 0' }}>
                {entrada.tema} <span style={{ color: theme.muted, fontStyle: 'italic', fontSize: 10 }}>({entrada.area}, {Math.round(score * 100)}% parecido)</span>
              </div>
            ))}
          </div>
        )}
        <FieldLabel>Fonte (Tribunal / Autor)</FieldLabel>
        {inp(entry.fonte, v => setF('fonte', v), 'Ex: STJ, TJSP, Caio Mario da Silva Pereira')}
        <FieldLabel>Referência</FieldLabel>
        {inp(entry.referencia, v => setF('referencia', v), 'Ex: REsp 1.234.567/SP, Sumula 479 STJ, Art. 186 CC')}
        <FieldLabel>Tags</FieldLabel>
        <TagInput tags={entry.tags || []} onChange={v => setF('tags', v)} todasAsTags={[]} />
        <FieldLabel>URL (opcional)</FieldLabel>
        {inp(entry.url, v => setF('url', v), 'https://')}
      </div>

      {entry._zotero && (
        <div style={{ ...cardStyle, border: '1px solid ' + theme.gold + '33' }}>
          <SectionLabel>Metadados extraídos (Zotero)</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div>
              <FieldLabel>Tipo de item</FieldLabel>
              {inp(entry._zotero.tipo_item, v => setEntry(e => ({ ...e, _zotero: { ...e._zotero, tipo_item: v } })), 'Acordao, Decisao...')}
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

      {entry.teses.map((t, i) => (
        <div key={i} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionLabel>Tese {i + 1}</SectionLabel>
            {entry.teses.length > 1 && (
              <button onClick={() => removeTese(i)} style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 18 }}>x</button>
            )}
          </div>
          <FieldLabel>{labelCampoTese(entry.tipo, 'tese_assunto')}</FieldLabel>
          {inp(t.tese_assunto, v => setT(i, 'tese_assunto', v), 'Enunciado da tese')}
          <FieldLabel>{labelCampoTese(entry.tipo, 'fundamentacao_legal')}</FieldLabel>
          {inp(t.fundamentacao_legal, v => setT(i, 'fundamentacao_legal', v), 'Art. X, Lei Y / Sumula Z')}

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
            <FieldLabel>{labelCampoTese(entry.tipo, 'ratio_decidendi')}</FieldLabel>
            <IaBadge status={iaStatus[i + '_ratio_decidendi']} theme={theme} />
          </div>
          <IaField value={t.ratio_decidendi} onChange={v => setT(i, 'ratio_decidendi', v)} placeholder="Fundamento determinante" teseIdx={i} fieldName="ratio_decidendi" />

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
            <FieldLabel>{labelCampoTese(entry.tipo, 'aplicacao_pratica')}</FieldLabel>
            <IaBadge status={iaStatus[i + '_aplicacao_pratica']} theme={theme} />
          </div>
          <IaField value={t.aplicacao_pratica} onChange={v => setT(i, 'aplicacao_pratica', v)} placeholder="Como utilizar em peças processuais" teseIdx={i} fieldName="aplicacao_pratica" />

          <FieldLabel>{labelCampoTese(entry.tipo, 'precedente_sumula')}</FieldLabel>
          {inp(t.precedente_sumula, v => setT(i, 'precedente_sumula', v), 'Ex: REsp 1.234.567/SP, Sumula 370 STJ')}
        </div>
      ))}

      <BtnMuted onClick={addTese} style={{ width: '100%', marginBottom: 12, textAlign: 'center' }}>
        + Adicionar outra tese
      </BtnMuted>

      <div style={{ display: 'flex', gap: 10 }}>
        <BtnMuted onClick={() => {
          const temDados = entry.tema.trim() || entry.fonte.trim() || (entry.teses[0] && entry.teses[0].tese_assunto && entry.teses[0].tese_assunto.trim())
          if (temDados && !confirm('Descartar as alterações? Os dados não salvos serão perdidos.')) return
          onCancel()
        }} style={{ flex: 1 }}>Cancelar</BtnMuted>
        <BtnGold onClick={() => onSave({ ...entry, ia_status: temPendentes ? 'ia_pendente' : (entry.ia_status || 'manual') })} disabled={loading || extraindo || !entry.tema} style={{ flex: 2 }}>
          {loading ? 'Salvando...' : 'Salvar'}
        </BtnGold>
      </div>
    </div>
  )
}
