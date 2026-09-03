import { useState, useEffect, useRef } from 'react'
import { PenLine, Check, Loader2 } from 'lucide-react'
import { supabase } from '../supabase'

// ── Anotação pessoal (Supabase), reutilizável em qualquer tela ──────────
// Salva em public.anotacoes (user_id, namespace, item_id), com RLS restrita
// ao dono. namespace evita colisão entre diferentes telas com o mesmo id.
// Migra automaticamente qualquer anotação antiga salva em localStorage,
// na primeira vez que o componente monta para aquele item.
export default function AnotacaoPessoal({ itemId, session, theme, namespace = 'geral', placeholder = 'Sua anotação...' }) {
  const [nota, setNota] = useState('')
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const timeoutRef = useRef(null)
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId || !itemId) { setCarregando(false); return }
    let cancelado = false

    async function carregar() {
      setCarregando(true)
      const { data } = await supabase
        .from('anotacoes')
        .select('texto')
        .eq('user_id', userId)
        .eq('namespace', namespace)
        .eq('item_id', itemId)
        .maybeSingle()

      if (cancelado) return

      if (data?.texto) {
        setNota(data.texto)
        setCarregando(false)
        return
      }

      // Migração: existe anotação antiga salva localmente neste navegador?
      let legado = ''
      try {
        legado = localStorage.getItem(`lexia_nota_${namespace}_${itemId}`)
          || localStorage.getItem(`lexia_nota_${itemId}`) || ''
      } catch {}

      if (legado) {
        setNota(legado)
        await supabase.from('anotacoes').upsert({
          user_id: userId, namespace, item_id: itemId, texto: legado,
        }, { onConflict: 'user_id,namespace,item_id' })
        try {
          localStorage.removeItem(`lexia_nota_${namespace}_${itemId}`)
          localStorage.removeItem(`lexia_nota_${itemId}`)
        } catch {}
      }
      setCarregando(false)
    }

    carregar()
    return () => { cancelado = true }
  }, [userId, namespace, itemId])

  function salvar(v) {
    setNota(v)
    setSalvo(false)
    if (!userId) return
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      setSalvando(true)
      await supabase.from('anotacoes').upsert({
        user_id: userId, namespace, item_id: itemId, texto: v,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: 'user_id,namespace,item_id' })
      setSalvando(false)
      setSalvo(true)
    }, 800)
  }

  if (!userId) return null

  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setAberto(a => !a)}
        style={{ fontSize: 12, background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, color: nota ? theme.gold : theme.muted, padding: '5px 12px', cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif", fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
        <PenLine size={11} /> {carregando ? 'Carregando…' : (nota ? 'Ver anotação' : 'Adicionar anotação')}
      </button>
      {aberto && !carregando && (
        <div style={{ marginTop: 6 }}>
          <textarea value={nota} onChange={e => salvar(e.target.value)}
            placeholder={placeholder}
            style={{ width: '100%', minHeight: 70, background: theme.raised, border: `1px solid ${nota ? theme.gold + '66' : theme.border}`, borderRadius: 8, color: theme.text, fontSize: 12, padding: '8px 10px', fontFamily: 'Georgia, serif', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: 10, color: theme.muted, marginTop: 3, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif", display: 'flex', alignItems: 'center', gap: 4, minHeight: 14 }}>
            {salvando && <><Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> Salvando…</>}
            {salvo && !salvando && <><Check size={10} color={theme.success} /> Salvo, sincronizado com sua conta</>}
          </div>
        </div>
      )}
    </div>
  )
}
