import { useEffect } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { NOVIDADES_APP } from '../data/novidadesApp'

export default function NovidadesApp({ session }) {
  const { theme } = useTheme()

  useEffect(() => {
    if (!session?.user?.id) return
    supabase.from('membros').update({ novidades_vista_em: new Date().toISOString() }).eq('user_id', session.user.id)
  }, [session?.user?.id])

  return (
    <div style={{ paddingBottom: 40, maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>O que há de novo</div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
          Funcionalidades adicionadas ao Themis Jur recentemente
        </div>
      </div>

      {NOVIDADES_APP.map((n, i) => (
        <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < NOVIDADES_APP.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
          <div style={{ fontSize: 11, color: theme.gold, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 4 }}>
            {new Date(n.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 15, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 6 }}>{n.titulo}</div>
          <div style={{ fontSize: 13, color: theme.muted, fontFamily: theme.fontSerif, lineHeight: 1.6 }}>{n.descricao}</div>
        </div>
      ))}
    </div>
  )
}
