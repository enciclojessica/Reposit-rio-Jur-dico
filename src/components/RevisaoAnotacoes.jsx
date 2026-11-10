import { useEffect, useMemo, useState } from 'react'
import { Eye, Check, RotateCcw } from 'lucide-react'
import { supabase } from '../supabase'
import { anotacoesParaRevisar, diaLocal, registrarRevisao, INTERVALOS_REVISAO } from '../utils/revisaoAnotacoes'

// ── Revisão espaçada das anotações pessoais, no Início ──────────────────────
// Uma anotação por vez: o tema da entrada aparece, a pessoa tenta lembrar o que anotou, revela e diz se lembrou.
// Lê só as anotações da própria conta (o filtro por user_id é explícito: a política de leitura também deixa a
// administradora ver as de todos). Sucesso e erro aparecem na tela.
export default function RevisaoAnotacoes({ entradas, session, theme, onSelectEntrada }) {
  const userId = session?.user?.id
  const [notas, setNotas] = useState(null)
  const [erroCarga, setErroCarga] = useState('')
  const [revelada, setRevelada] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [feitasHoje, setFeitasHoje] = useState(0)

  useEffect(() => {
    if (!userId) { setNotas(null); return }
    let ativo = true
    supabase.from('anotacoes')
      .select('id, item_id, texto, criado_em, revisao_etapa, revisao_proxima')
      .eq('user_id', userId)
      .eq('namespace', 'entrada')
      .then(({ data, error }) => {
        if (!ativo) return
        if (error) { setErroCarga('Não foi possível carregar as anotações para revisar.'); return }
        setNotas(data || [])
      })
    return () => { ativo = false }
  }, [userId])

  const porId = useMemo(() => new Map((entradas || []).map(e => [e.id, e])), [entradas])
  const fila = useMemo(
    () => anotacoesParaRevisar(notas, diaLocal()).filter(x => porId.has(x.nota.item_id)),
    [notas, porId],
  )

  if (!userId || (!erroCarga && (!notas || (fila.length === 0 && feitasHoje === 0)))) return null

  const atual = fila[0]
  const entrada = atual ? porId.get(atual.nota.item_id) : null
  const titulo = { fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 10 }
  const botao = (destaque) => ({
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
    padding: '8px 14px', borderRadius: 6, cursor: salvando ? 'not-allowed' : 'pointer',
    background: destaque ? theme.gold : theme.btnMutedBg, color: destaque ? '#0b0f1a' : theme.text,
    border: `1px solid ${destaque ? theme.gold : theme.border}`,
  })

  async function responder(lembrou) {
    if (!atual) return
    setSalvando(true)
    setAviso(null)
    const campos = registrarRevisao(atual.nota, lembrou)
    const { error } = await supabase.from('anotacoes').update(campos).eq('id', atual.nota.id).eq('user_id', userId)
    setSalvando(false)
    if (error) { setAviso({ tipo: 'erro', texto: 'Não foi possível registrar a revisão. Tente de novo.' }); return }
    setNotas(lista => lista.map(n => (n.id === atual.nota.id ? { ...n, ...campos } : n)))
    setRevelada(false)
    setFeitasHoje(n => n + 1)
    setAviso({
      tipo: 'ok',
      texto: !lembrou
        ? 'Volta amanhã para revisar de novo.'
        : campos.revisao_proxima
          ? `Próxima revisão em ${campos.revisao_proxima.split('-').reverse().join('/')}.`
          : 'Anotação dominada: não volta mais para revisão.',
    })
  }

  return (
    <section style={{ marginBottom: 28 }} aria-label="Revisar anotações">
      <div style={titulo}>Revisar anotações{fila.length > 0 ? ` (${fila.length})` : ''}</div>
      {erroCarga && <div role="alert" style={{ fontSize: 13, color: theme.error, fontFamily: 'Inter, sans-serif' }}>{erroCarga}</div>}
      {!erroCarga && !atual && (
        <div style={{ fontSize: 13, color: theme.muted, fontFamily: theme.fontSerif }}>
          Revisões de hoje concluídas ({feitasHoje}). As anotações voltam em {INTERVALOS_REVISAO.join(', ').replace(/, (\d+)$/, ' e $1')} dias.
        </div>
      )}
      {atual && entrada && (
        <div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
            O que você anotou sobre:
          </div>
          <button type="button" onClick={() => onSelectEntrada?.(entrada)}
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: onSelectEntrada ? 'pointer' : 'default', fontSize: 14, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600 }}>
            {entrada.tema}
          </button>
          {revelada ? (
            <div style={{ marginTop: 10, padding: '10px 12px', borderLeft: `2px solid ${theme.gold}`, background: theme.raised, fontSize: 13, color: theme.text, fontFamily: theme.fontSerif, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {atual.nota.texto}
            </div>
          ) : null}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {!revelada ? (
              <button type="button" style={botao(true)} onClick={() => setRevelada(true)}>
                <Eye size={13} /> Mostrar minha anotação
              </button>
            ) : (
              <>
                <button type="button" style={botao(true)} disabled={salvando} onClick={() => responder(true)}>
                  <Check size={13} /> Lembrei
                </button>
                <button type="button" style={botao(false)} disabled={salvando} onClick={() => responder(false)}>
                  <RotateCcw size={13} /> Revisar de novo
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {aviso && (
        <div role={aviso.tipo === 'erro' ? 'alert' : 'status'}
          style={{ marginTop: 10, fontSize: 12, fontFamily: 'Inter, sans-serif', color: aviso.tipo === 'erro' ? theme.error : theme.success }}>
          {aviso.texto}
        </div>
      )}
    </section>
  )
}
