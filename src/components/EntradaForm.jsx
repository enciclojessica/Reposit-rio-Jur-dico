import { useState } from 'react'
import { AREAS, TIPOS, emptyEntry, FieldLabel, SectionLabel, BtnGold, BtnMuted } from '../shared'
import { useTheme } from '../theme'

export default function EntradaForm({ initial, onSave, onCancel, loading }) {
  const { theme } = useTheme()
  const [entry, setEntry] = useState(initial || emptyEntry())

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
      {/* Identificação */}
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
        <FieldLabel>Fonte</FieldLabel>
        {inp(entry.fonte, v => setF('fonte', v), 'Ex: STJ, TJSP, Caio Mário da Silva Pereira')}
        <FieldLabel>Referência</FieldLabel>
        {inp(entry.referencia, v => setF('referencia', v), 'Ex: REsp 1.234.567/SP, Súmula 479 STJ, Art. 186 CC')}
        <FieldLabel>URL (opcional)</FieldLabel>
        {inp(entry.url, v => setF('url', v), 'https://')}
      </div>

      {/* Teses */}
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
        <BtnGold onClick={() => onSave(entry)} disabled={loading || !entry.tema} style={{ flex: 2 }}>
          {loading ? 'Salvando...' : 'Salvar'}
        </BtnGold>
      </div>
    </div>
  )
}
