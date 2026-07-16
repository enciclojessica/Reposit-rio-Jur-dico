import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { DISC_COR } from '../data/disciplinas'
import { EXAME_ANO } from '../data/oabQuestoesConstants'
import { ANTHROPIC_MODEL_RAPIDO } from '../../lib/anthropicModel'
import {
  CheckCircle, XCircle, Sparkles, Pencil,
  BookmarkCheck, Bookmark, Scissors,
} from 'lucide-react'
import AnotacaoPessoal from './AnotacaoPessoal'

// ── Card de questão ─────────────────────────────────────────────
export default function QuestaoCard({ questao, idx, total, respondida, respostaDada, onResponder, mostrarGabarito, favorita, onFavoritar, isAdmin, onReclassificar, theme }) {
  const [selecionada, setSelecionada] = useState(respostaDada || null)
  const [eliminadas, setEliminadas]   = useState(new Set())

  function toggleEliminar(alt) {
    if (respondida) return
    setEliminadas(prev => {
      const novo = new Set(prev)
      novo.has(alt) ? novo.delete(alt) : novo.add(alt)
      return novo
    })
  }
  const [editando, setEditando]       = useState(false)
  const [editDisc, setEditDisc]       = useState(questao.disciplina)
  const [editTopico, setEditTopico]   = useState(questao.topico || '')
  const [salvando, setSalvando]       = useState(false)
  const [sugerindo, setSugerindo]     = useState(false)
  const cor = DISC_COR[questao.disciplina] || '#6b7280'
  const alts = ['A','B','C','D']

  async function salvarEdicao() {
    setSalvando(true)
    await supabase.from('oab_questoes').update({ disciplina: editDisc, topico: editTopico || null }).eq('id', questao.id)
    setSalvando(false)
    setEditando(false)
    const disciplinaOriginal = questao.disciplina
    questao.disciplina = editDisc
    questao.topico = editTopico || null
    // Se a disciplina mudou, notificar o pai para remover da sessão atual
    if (editDisc !== disciplinaOriginal && onReclassificar) {
      onReclassificar(questao.id)
    }
  }

  async function sugerirClassificacao() {
    setSugerindo(true)
    try {
      const res = await fetch('/api/busca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL_RAPIDO,
          max_tokens: 200,
          messages: [{ role: 'user', content:
            `Classifique esta questão jurídica OAB/FGV com a disciplina e tópico corretos.\n\nEnunciado: ${questao.enunciado.slice(0,500)}\n\nDisciplinas possíveis: ${Object.keys(DISC_COR).filter(d=>d!=='Simulado Geral').join(', ')}\n\nResponda SOMENTE com JSON: {"disciplina":"...","topico":"..."}` }]
        })
      })
      const data = await res.json()
      const txt = data.content?.[0]?.text || ''
      const clean = txt.replace(/```json/g,'').replace(/```/g,'').trim()
      const parsed = JSON.parse(clean)
      if (parsed.disciplina) setEditDisc(parsed.disciplina)
      if (parsed.topico)     setEditTopico(parsed.topico)
    } catch { /* silencioso */ }
    setSugerindo(false)
  }

  // Sincronizar selecionada quando muda de questão
  useEffect(() => { setSelecionada(respostaDada || null) }, [questao.id, respostaDada])

  function escolher(alt) {
    if (respondida) return
    setSelecionada(alt)
    if (mostrarGabarito) onResponder(questao.id, alt)
  }

  function confirmar() {
    if (!selecionada || respondida) return
    onResponder(questao.id, selecionada)
  }

  const acertou = respondida && selecionada === questao.gabarito

  return (
    <div style={{ background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:12, padding:'18px 16px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {editando ? (
          <>
            <select value={editDisc} onChange={e => setEditDisc(e.target.value)}
              style={{ fontSize:11, background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:6, color:theme.text, padding:'3px 8px', fontFamily:'IBM Plex Mono, monospace' }}>
              {Object.keys(DISC_COR).filter(d => d !== 'Simulado Geral').map(d =>
                <option key={d} value={d}>{d}</option>
              )}
            </select>
            <input value={editTopico} onChange={e => setEditTopico(e.target.value)}
              placeholder="Tópico..."
              style={{ fontSize:11, background:theme.raised, border:`1px solid ${theme.border}`, borderRadius:6, color:theme.text, padding:'3px 8px', fontFamily:'IBM Plex Mono, monospace', width:160 }} />
            <button onClick={sugerirClassificacao} disabled={sugerindo}
              title="Deixar a IA sugerir a classificação correta"
              style={{ fontSize:10, background:theme.raised, border:'1px solid #7C3AED', borderRadius:5, color:'#7C3AED', padding:'3px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
              {sugerindo ? '...' : <><Sparkles size={11} /> IA</>}
            </button>
            <button onClick={salvarEdicao} disabled={salvando}
              style={{ fontSize:10, background:theme.gold, border:'none', borderRadius:5, color:'#0b0f1a', padding:'3px 10px', cursor:'pointer', fontWeight:700 }}>
              {salvando ? '...' : 'Salvar'}
            </button>
            <button onClick={() => setEditando(false)}
              style={{ fontSize:10, background:'none', border:`1px solid ${theme.muted}`, borderRadius:5, color:theme.muted, padding:'3px 8px', cursor:'pointer' }}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize:10, fontWeight:600, color:cor, background:cor+'18', border:`1px solid ${cor}33`, borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
              {questao.disciplina}
            </span>
            {questao.topico && (
              <span style={{ fontSize:10, color:theme.muted, background:theme.muted+'10', border:`1px solid ${theme.muted}22`, borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
                {questao.topico}
              </span>
            )}
            {questao.exame && (
              <span style={{ fontSize:10, fontWeight:600, color:theme.muted, background:theme.muted+'18', border:`1px solid ${theme.muted}33`, borderRadius:4, padding:'2px 7px', fontFamily:'IBM Plex Mono, monospace' }}>
                {`${questao.exame}º Exame`}{EXAME_ANO[questao.exame] ? ` · ${EXAME_ANO[questao.exame]}` : ''}
              </span>
            )}
            {isAdmin && (
              <button onClick={() => { setEditDisc(questao.disciplina); setEditTopico(questao.topico||''); setEditando(true) }}
                title="Editar classificação"
                style={{ fontSize:9, background:'none', border:`1px solid ${theme.muted}44`, borderRadius:4, color:theme.muted, padding:'2px 6px', cursor:'pointer', fontFamily:'IBM Plex Mono, monospace', display:'flex', alignItems:'center', gap:3 }}>
                <Pencil size={10} /> editar
              </button>
            )}
          </>
        )}
        <span style={{ fontSize:10, color:theme.muted, fontFamily:'IBM Plex Mono, monospace', marginLeft:'auto' }}>
          {idx+1}/{total}
        </span>
        <button onClick={() => onFavoritar && onFavoritar(questao.id)}
          title={favorita ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 4px', color: favorita ? theme.gold : theme.muted, flexShrink:0 }}>
          {favorita ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Enunciado com highlight de busca */}
      <div style={{ fontSize:14, color:theme.text, fontFamily:'Georgia, serif', lineHeight:1.7, marginBottom:16 }}>
        {questao._busca ? (() => {
          const termos = questao._busca.split(/\s+/).filter(t => t.length > 2)
          if (!termos.length) return questao.enunciado
          const regex = new RegExp(`(${termos.map(t => t.replace(/[.*+?^${}()|[\]\\]/g,'\\')).join('|')})`, 'gi')
          const partes = questao.enunciado.split(regex)
          return partes.map((p, i) => regex.test(p)
            ? <mark key={i} style={{ background:theme.gold+'33', color:theme.gold, borderRadius:2, padding:'0 2px' }}>{p}</mark>
            : p
          )
        })() : questao.enunciado}
      </div>

      {/* Alternativas */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
        {alts.map(alt => {
          const texto = questao[`alternativa_${alt.toLowerCase()}`]
          if (!texto) return null
          const isCorreta    = respondida && alt === questao.gabarito
          const isErrada     = respondida && alt === selecionada && alt !== questao.gabarito
          const isSelecionada = selecionada === alt
          const isEliminada  = eliminadas.has(alt)

          let bg = theme.cardBg, border = theme.border, textCor = theme.text
          if (isCorreta)    { bg = theme.toastOk; border = theme.success; textCor = theme.success }
          else if (isErrada){ bg = theme.toastErr; border = theme.error; textCor = theme.error }
          else if (isSelecionada && !respondida) { bg = theme.gold+'11'; border = theme.gold+'66'; textCor = theme.gold }
          else if (isEliminada && !respondida)   { bg = theme.raised; border = theme.border; textCor = theme.muted }

          return (
            <div key={alt} style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
              {/* Tesoura — só antes de responder */}
              {!respondida && (
                <button
                  onClick={() => toggleEliminar(alt)}
                  title={isEliminada ? 'Restaurar alternativa' : 'Eliminar alternativa'}
                  style={{ flexShrink:0, marginTop:8, background:'none', border:'none', cursor:'pointer', color: isEliminada ? theme.error : theme.muted, opacity: isEliminada ? 1 : 0.4, padding:'2px', transition:'all .15s' }}>
                  <Scissors size={13} />
                </button>
              )}
              <button onClick={() => !isEliminada && escolher(alt)} disabled={respondida || isEliminada}
                style={{ flex:1, display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:bg, border:`1px solid ${border}`, borderRadius:8, cursor: respondida || isEliminada ? 'default' : 'pointer', textAlign:'left', transition:'all .15s', opacity: isEliminada ? 0.45 : 1 }}>
                <span style={{ width:22, height:22, borderRadius:'50%', background: isSelecionada||isCorreta||isErrada ? border : theme.border, color: isSelecionada||isCorreta||isErrada ? '#fff' : theme.muted, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'IBM Plex Mono, monospace' }}>
                  {isCorreta ? '✓' : isErrada ? '✗' : alt}
                </span>
                <span style={{ fontSize:13, color:textCor, fontFamily:'Georgia, serif', lineHeight:1.5, textDecoration: isEliminada ? 'line-through' : 'none' }}>{texto}</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Confirmar (bloco) */}
      {!respondida && !mostrarGabarito && selecionada && (
        <button onClick={confirmar}
          style={{ width:'100%', background:theme.gold, border:'none', borderRadius:8, padding:'10px', fontSize:13, fontWeight:700, color:'#0b0f1a', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
          Confirmar resposta
        </button>
      )}

      {/* Feedback */}
      {respondida && (
        <div style={{ marginTop:12, padding:'12px 14px', background: acertou ? theme.toastOk : theme.toastErr, border:`1px solid ${acertou ? theme.success : theme.error}`, borderRadius:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: questao.justificativa ? 8 : 0 }}>
            {acertou ? <CheckCircle size={15} color={theme.success} /> : <XCircle size={15} color={theme.error} />}
            <span style={{ fontSize:13, fontWeight:700, color: acertou ? theme.success : theme.error, fontFamily:'Inter, sans-serif' }}>
              {acertou ? 'Correto!' : `Errado — Gabarito: ${questao.gabarito}`}
            </span>
          </div>
          {questao.justificativa && (
            <div style={{ fontSize:12, color:'#e2e8f0', fontFamily:'Georgia, serif', lineHeight:1.6 }}>
              {questao.justificativa}
            </div>
          )}
          {questao.dispositivo && (
            <div style={{ fontSize:11, color:theme.gold, fontFamily:'IBM Plex Mono, monospace', marginTop:6 }}>
              Base: {questao.dispositivo}
            </div>
          )}
        </div>
      )}

      {/* Anotação pessoal */}
      {respondida && <AnotacaoPessoal itemId={questao.id} namespace="questao" theme={theme} placeholder="Sua anotação sobre esta questão..." />}
    </div>
  )
}
