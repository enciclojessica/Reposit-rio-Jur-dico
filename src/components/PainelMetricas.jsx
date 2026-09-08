import { useState, useEffect } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'

import { AREAS_VALIDAS } from '../../lib/normalizarArea'

function StatBox({ label, valor, theme, cor }) {
  return (
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderTop: `2px solid ${cor || theme.gold}`, borderRadius: 8, padding: '14px 16px' }}>
      <div style={{ fontSize: 24, fontWeight: 600, color: cor || theme.gold, fontFamily: theme.fontTitle }}>{valor}</div>
      <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function PainelMetricas({ entradas }) {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState(null)

  useEffect(() => {
    async function carregar() {
      const [membrosRes, anotacoesRes, favoritosRes, rascunhosRes, historicoRes] = await Promise.all([
        supabase.from('membros').select('role, pago, criado_em'),
        supabase.from('anotacoes').select('id', { count: 'exact', head: true }),
        supabase.from('favoritos').select('id', { count: 'exact', head: true }),
        supabase.from('pecas_rascunhos').select('id', { count: 'exact', head: true }),
        supabase.from('historico_leitura').select('user_id, entrada_id, visto_em'),
      ])

      const membros = membrosRes.data || []
      const porRole = membros.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc }, {})
      const pagantes = membros.filter(m => m.pago).length

      const historico = historicoRes.data || []
      const agora = Date.now()
      const dia = 24 * 60 * 60 * 1000
      const ativos7 = new Set(historico.filter(h => agora - new Date(h.visto_em).getTime() < 7 * dia).map(h => h.user_id)).size
      const ativos30 = new Set(historico.filter(h => agora - new Date(h.visto_em).getTime() < 30 * dia).map(h => h.user_id)).size

      // Últimos 14 dias, contagem de leituras por dia (não usuários distintos:
      // é atividade bruta, útil pra ver o ritmo de uso do acervo).
      const porDia = {}
      for (let i = 13; i >= 0; i--) {
        const chave = new Date(agora - i * dia).toISOString().slice(0, 10)
        porDia[chave] = 0
      }
      historico.forEach(h => {
        const chave = h.visto_em.slice(0, 10)
        if (chave in porDia) porDia[chave]++
      })

      const vistasSet = new Set(historico.map(h => h.entrada_id))

      setDados({
        totalMembros: membros.length,
        porRole,
        pagantes,
        totalAnotacoes: anotacoesRes.count || 0,
        totalFavoritos: favoritosRes.count || 0,
        totalRascunhos: rascunhosRes.count || 0,
        ativos7, ativos30,
        porDia,
        vistasSet,
      })
      setLoading(false)
    }
    carregar()
  }, [])

  if (loading) return <div style={{ color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>Carregando…</div>
  if (!dados) return null

  const maxDia = Math.max(1, ...Object.values(dados.porDia))

  // Lacunas do acervo: distribuição por área, incluindo as 12 áreas
  // oficiais que não têm nenhuma entrada ainda (por isso a lista vem de
  // AREAS_VALIDAS, não das áreas já presentes nas entradas — senão uma
  // área vazia simplesmente não apareceria em lugar nenhum).
  const porArea = (entradas || []).reduce((acc, e) => { acc[e.area] = (acc[e.area] || 0) + 1; return acc }, {})
  const distribuicaoAreas = AREAS_VALIDAS
    .map(area => ({ area, count: porArea[area] || 0 }))
    .sort((a, b) => b.count - a.count)
  const maxArea = Math.max(1, ...distribuicaoAreas.map(a => a.count))

  // Nunca abertas: entradas cuja id não aparece em nenhuma linha de
  // historico_leitura. Mais antigas primeiro (quanto mais tempo sem
  // ninguém abrir, mais forte o sinal de que algo está errado — tag
  // ruim, difícil de achar, ou pouco relevante mesmo).
  const nuncaAbertas = (entradas || [])
    .filter(e => !dados.vistasSet.has(e.id))
    .sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em))

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>Painel de métricas</div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
          Visão de negócio, uso real da plataforma — só você vê essa tela
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatBox label="Membros no total" valor={dados.totalMembros} theme={theme} />
        <StatBox label="Pagantes" valor={dados.pagantes} theme={theme} cor={theme.success} />
        <StatBox label="Ativos, últimos 7 dias" valor={dados.ativos7} theme={theme} cor={theme.civel} />
        <StatBox label="Ativos, últimos 30 dias" valor={dados.ativos30} theme={theme} cor={theme.civel} />
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 12 }}>Membros por papel</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['admin', 'editor', 'leitor'].map(r => (
            <div key={r}>
              <div style={{ fontSize: 20, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600 }}>{dados.porRole[r] || 0}</div>
              <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>{r}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 12 }}>Uso de recursos pessoais (total de linhas)</div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 20, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600 }}>{dados.totalAnotacoes}</div>
            <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>anotações pessoais</div>
          </div>
          <div>
            <div style={{ fontSize: 20, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600 }}>{dados.totalFavoritos}</div>
            <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>favoritos</div>
          </div>
          <div>
            <div style={{ fontSize: 20, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600 }}>{dados.totalRascunhos}</div>
            <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>rascunhos de peças</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 4 }}>Lacunas do acervo, por área</div>
        <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 14 }}>
          As 12 áreas oficiais do app, mesmo as que ainda não têm nenhuma entrada
        </div>
        {distribuicaoAreas.map(({ area, count }) => (
          <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
            <div style={{ width: 110, flexShrink: 0, fontSize: 12, color: count === 0 ? theme.muted : theme.text, fontFamily: "Georgia, 'EB Garamond', serif", fontStyle: count === 0 ? 'italic' : 'normal' }}>
              {area}
            </div>
            <div style={{ flex: 1, background: theme.border + '55', borderRadius: 3, height: 10, overflow: 'hidden' }}>
              {count > 0 && <div style={{ width: `${(count / maxArea) * 100}%`, height: '100%', background: theme.gold, borderRadius: 3 }} />}
            </div>
            <div style={{ width: 26, textAlign: 'right', flexShrink: 0, fontSize: 12, color: count === 0 ? theme.muted : theme.gold, fontFamily: theme.fontTitle }}>
              {count}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 4 }}>
          Nunca abertas ({nuncaAbertas.length})
        </div>
        <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 12 }}>
          Ninguém abriu essas entradas desde que o histórico de leitura começou a ser registrado — não quer dizer que nunca foram lidas antes disso, só que não há registro. Pode ser tag ruim, difícil de achar, ou pouco relevante mesmo.
        </div>
        {nuncaAbertas.length === 0 ? (
          <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>Toda entrada do acervo já foi aberta por alguém.</div>
        ) : (
          <>
            {nuncaAbertas.slice(0, 8).map(e => (
              <div key={e.id} style={{ padding: '6px 0', borderTop: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: 13, color: theme.text, fontFamily: "Georgia, 'EB Garamond', serif" }}>{e.tema}</div>
                <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>{e.area}, {e.tipo}</div>
              </div>
            ))}
            {nuncaAbertas.length > 8 && (
              <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 8 }}>
                + {nuncaAbertas.length - 8} outra(s)
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 12 }}>Leituras por dia, últimos 14 dias</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
          {Object.entries(dados.porDia).map(([dataStr, n]) => (
            <div key={dataStr} title={`${dataStr}: ${n}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: Math.max(2, (n / maxDia) * 60), background: theme.gold, borderRadius: 2 }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 6 }}>
          Começou a ser registrado agora — dias sem leitura ainda aparecem vazios, não é falha.
        </div>
      </div>
    </div>
  )
}
