import { useMemo, useState, useEffect } from 'react'
import { useTheme } from '../theme'
import { AreaDot } from '../shared'
import { supabase } from '../supabase'

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000

export default function Hoje({ entradas, session, onSelectEntrada }) {
  const { theme } = useTheme()
  const [historico, setHistorico] = useState([])

  useEffect(() => {
    if (!session?.user?.id) { setHistorico([]); return }
    supabase.from('historico_leitura')
      .select('entrada_id')
      .eq('user_id', session.user.id)
      .order('visto_em', { ascending: false })
      .limit(3)
      .then(({ data }) => setHistorico(data || []))
  }, [session?.user?.id])

  const continuarLendo = useMemo(() => {
    if (!historico.length) return []
    const mapa = new Map(entradas.map(e => [e.id, e]))
    return historico.map(h => mapa.get(h.entrada_id)).filter(Boolean)
  }, [historico, entradas])

  const novidades = useMemo(() => {
    const agora = Date.now()
    const recentes = entradas.filter(e => e.criado_em && (agora - new Date(e.criado_em).getTime()) < SETE_DIAS_MS)
    const base = recentes.length > 0 ? recentes : [...entradas].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 5)
    return [...base].sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).slice(0, 8)
  }, [entradas])

  const data = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
  const dataCapitalizada = data.charAt(0).toUpperCase() + data.slice(1)

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>
          Hoje
        </div>
        <div style={{ fontSize: 13, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>{dataCapitalizada}</div>
      </div>

      {continuarLendo.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 4 }}>
            Continuar de onde parei
          </div>
          {continuarLendo.map(e => (
            <div key={e.id} onClick={() => onSelectEntrada?.(e)}
              style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: `0.5px solid ${theme.border}`, cursor: onSelectEntrada ? 'pointer' : 'default' }}>
              <div style={{ paddingTop: 3, flexShrink: 0 }}>
                <AreaDot area={e.area} theme={theme} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.tema}
                </div>
                <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 2 }}>
                  {[e.area, e.tipo].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 4 }}>
        Novidades
      </div>

      {novidades.length === 0 ? (
        <div style={{ color: theme.muted, fontSize: 13, fontStyle: 'italic', fontFamily: theme.fontSerif, padding: '14px 0' }}>Nenhuma entrada ainda.</div>
      ) : (
        novidades.map((e, i) => (
          <div key={e.id} onClick={() => onSelectEntrada?.(e)}
            style={{
              display: 'flex', gap: 10, padding: '14px 0',
              borderBottom: `0.5px solid ${theme.border}`,
              cursor: onSelectEntrada ? 'pointer' : 'default',
            }}>
            <div style={{ paddingTop: 4, flexShrink: 0 }}>
              <AreaDot area={e.area} theme={theme} />
            </div>
            <div style={{ fontSize: 13, color: theme.muted, flexShrink: 0, width: 20, paddingTop: 2, fontFamily: theme.fontSerif }}>{i + 1}.</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.tema}
              </div>
              <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 3 }}>
                {[e.area, e.fonte, new Date(e.criado_em).toLocaleDateString('pt-BR')].filter(Boolean).join(', ')}
              </div>
            </div>
            {e.area === 'Informativo' && (
              <div style={{ fontSize: 11, color: theme.gold, fontStyle: 'italic', fontFamily: theme.fontSerif, flexShrink: 0, paddingTop: 2 }}>novo</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
