import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../theme'
import { AREAS, STATUS_META } from '../shared'
import { TagPill } from './TagInput'
import { supabase } from '../supabase'
import { calcularProximaRevisao, estaPendente } from '../utils/spacedRepetition'
import { Trophy, Dumbbell, BookOpen, Shuffle, Clock } from 'lucide-react'

// ── Embaralhar array ───────────────────────────────────────────────────────
function embaralhar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Construir deck de cartas a partir das entradas ─────────────────────────
function buildDeck(entradas, filtros, revisaoMap, soPendentes) {
  const cartas = []
  for (const entry of entradas) {
    if (filtros.area !== 'all' && entry.area !== filtros.area) continue
    if (filtros.status !== 'all' && entry.status !== filtros.status) continue
    if (filtros.tipo !== 'all' && entry.tipo !== filtros.tipo) continue
    if (soPendentes && !estaPendente(revisaoMap?.[entry.id])) continue

    for (const tese of (entry.teses || [])) {
      if (!tese.tese_assunto?.trim()) continue
      cartas.push({ entry, tese })
    }
  }
  return embaralhar(cartas)
}

// ── Carta individual ───────────────────────────────────────────────────────
function Carta({ carta, virada, onVirar }) {
  const { theme } = useTheme()
  const { entry, tese } = carta
  const am = AREAS[entry.area] || { color: theme.muted }
  const s  = STATUS_META[entry.status || 'vigente']

  return (
    <div
      onClick={!virada ? onVirar : undefined}
      style={{
        background: theme.cardBg, border: `1px solid ${virada ? am.color + '55' : theme.border}`,
        borderLeft: `4px solid ${am.color}`,
        borderRadius: 16, padding: 28,
        minHeight: 280, display: 'flex', flexDirection: 'column',
        cursor: virada ? 'default' : 'pointer',
        transition: 'border-color .2s, box-shadow .2s',
        boxShadow: virada ? `0 8px 32px ${am.color}22` : theme.shadow,
      }}
    >
      {/* Badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ background: am.color + '22', color: am.color, border: `1px solid ${am.color}44`, borderRadius: 4, padding: '1px 8px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{entry.area}</span>
        <span style={{ background: theme.raised, color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 4, padding: '1px 8px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{entry.tipo}</span>
        {entry.status && entry.status !== 'vigente' && (
          <span style={{ background: s.cor + '22', color: s.cor, border: `1px solid ${s.cor}44`, borderRadius: 20, padding: '1px 8px', fontSize: 10 }}>{s.icon} {s.label}</span>
        )}
        {(entry.tags || []).map(t => <TagPill key={t} tag={t} pequena />)}
      </div>

      {/* FRENTE: tema */}
      {!virada && (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontFamily: 'IBM Plex Mono, monospace' }}>
              Qual é a tese?
            </div>
            <div style={{ fontSize: 19, color: theme.text, fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.4 }}>
              {entry.tema}
            </div>
            {entry.fonte && (
              <div style={{ fontSize: 12, color: theme.muted, marginTop: 10 }}>{entry.fonte} · {entry.referencia}</div>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
            toque para revelar ↓
          </div>
        </>
      )}

      {/* VERSO: tese completa */}
      {virada && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }}>
            Resposta
          </div>

          {/* Enunciado */}
          <div style={{ fontSize: 15, color: theme.text, lineHeight: 1.6, marginBottom: 16, fontFamily: 'Playfair Display, serif' }}>
            {tese.tese_assunto}
          </div>

          {/* Detalhes em grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Fundamentação', tese.fundamentacao_legal],
              ['Precedente', tese.precedente_sumula],
              ['Ratio Decidendi', tese.ratio_decidendi],
              ['Aplicação Prática', tese.aplicacao_pratica],
            ].filter(([, v]) => v?.trim()).map(([label, val]) => (
              <div key={label} style={{ background: theme.raised, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: 'IBM Plex Mono, monospace' }}>{label}</div>
                <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.5 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tela de configuração ───────────────────────────────────────────────────
function Configurar({ entradas, revisaoMap, onIniciar }) {
  const { theme } = useTheme()
  const [filtros, setFiltros] = useState({ area: 'all', tipo: 'all', status: 'all' })
  const [soPendentes, setSoPendentes] = useState(false)

  const previewCount = buildDeck(entradas, filtros, revisaoMap, soPendentes).length
  const pendentesCount = buildDeck(entradas, filtros, revisaoMap, true).length

  const sel = (campo, opcoes) => (
    <select value={filtros[campo]} onChange={e => setFiltros(f => ({ ...f, [campo]: e.target.value }))}
      style={{ width: '100%' }}>
      {opcoes.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
    </select>
  )

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><BookOpen size={40} color={theme.gold} /></div>
        <div style={{ fontSize: 22, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>
          Modo Flashcard
        </div>
        <div style={{ fontSize: 13, color: theme.muted }}>
          Revise as teses do repositório. As cartas mostram o tema na frente e a tese completa no verso.
        </div>
      </div>

      {pendentesCount > 0 && (
        <div onClick={() => setSoPendentes(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          background: soPendentes ? theme.gold + '15' : theme.raised,
          border: `1px solid ${soPendentes ? theme.gold + '66' : theme.border}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
        }}>
          <Clock size={16} color={soPendentes ? theme.gold : theme.muted} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: soPendentes ? theme.gold : theme.text, fontWeight: 600 }}>
              {pendentesCount} carta{pendentesCount !== 1 ? 's' : ''} pendente{pendentesCount !== 1 ? 's' : ''} de revisão
            </div>
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>
              {soPendentes ? 'Revisando só as pendentes (repetição espaçada)' : 'Toque para revisar só essas primeiro'}
            </div>
          </div>
          <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${soPendentes ? theme.gold : theme.border}`, background: soPendentes ? theme.gold : 'transparent' }} />
        </div>
      )}

      <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontFamily: 'IBM Plex Mono, monospace' }}>
          Filtrar cartas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Área</div>
            {sel('area', [['all', 'Todas'], ...Object.keys(AREAS).map(a => [a, a])])}
          </div>
          <div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Tipo</div>
            {sel('tipo', [['all', 'Todos'], ...['jurisprudência', 'doutrina', 'súmula', 'lei'].map(t => [t, t])])}
          </div>
          <div>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Status</div>
            {sel('status', [['all', 'Todos'], ...Object.entries(STATUS_META).map(([k, v]) => [k, v.label])])}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: theme.muted, marginBottom: 16 }}>
          {previewCount === 0
            ? 'Nenhuma tese encontrada com esses filtros.'
            : `${previewCount} tese${previewCount !== 1 ? 's' : ''} no deck`}
        </div>
        <button onClick={() => previewCount > 0 && onIniciar(filtros, soPendentes)}
          disabled={previewCount === 0}
          style={{ background: previewCount === 0 ? theme.border : theme.gold, color: previewCount === 0 ? theme.muted : '#0b0f1a', border: 'none', borderRadius: 10, padding: '12px 36px', fontSize: 14, fontWeight: 700, cursor: previewCount === 0 ? 'not-allowed' : 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
          Começar sessão →
        </button>
      </div>
    </div>
  )
}

// ── Resumo da sessão ───────────────────────────────────────────────────────
function Resumo({ stats, total, onReiniciar, onVoltar }) {
  const { theme } = useTheme()
  const pct = n => total > 0 ? Math.round((n / total) * 100) : 0

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        {pct(stats.facil) >= 70 ? <Trophy size={44} color={theme.gold} /> : pct(stats.errei) >= 50 ? <Dumbbell size={44} color={theme.muted} /> : <BookOpen size={44} color={theme.muted} />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: theme.gold, fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>
        Sessão concluída!
      </div>
      <div style={{ fontSize: 13, color: theme.muted, marginBottom: 28 }}>
        {total} tese{total !== 1 ? 's' : ''} revisada{total !== 1 ? 's' : ''}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
        {[
          { label: 'Sabia', val: stats.facil, cor: '#10b981', icon: '✓' },
          { label: 'Difícil', val: stats.dificil, cor: '#f59e0b', icon: '~' },
          { label: 'Errei', val: stats.errei, cor: '#ef4444', icon: '✗' },
        ].map(s => (
          <div key={s.label} style={{ background: theme.cardBg, border: `1px solid ${s.cor}44`, borderRadius: 12, padding: '16px 20px', flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.cor, fontFamily: 'IBM Plex Mono, monospace' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: s.cor, marginTop: 2 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 10, color: theme.muted, marginTop: 2 }}>{pct(s.val)}%</div>
          </div>
        ))}
      </div>

      {/* Barra de acerto */}
      <div style={{ background: theme.border, borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ height: '100%', background: '#10b981', width: `${pct(stats.facil)}%`, transition: 'width 1s ease', borderRadius: 8 }} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={onVoltar}
          style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
          ← Configurar
        </button>
        <button onClick={onReiniciar}
          style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shuffle size={14} /> Novo deck
        </button>
      </div>
    </div>
  )
}

// ── FlashCards principal ───────────────────────────────────────────────────
export default function FlashCards({ entradas, session }) {
  const { theme } = useTheme()
  const [etapa, setEtapa]   = useState('config')   // config | sessao | resumo
  const [deck, setDeck]     = useState([])
  const [idx, setIdx]       = useState(0)
  const [virada, setVirada] = useState(false)
  const [stats, setStats]   = useState({ facil: 0, dificil: 0, errei: 0 })
  const [filtros, setFiltros] = useState(null)
  const [soPendentes, setSoPendentes] = useState(false)
  const [revisaoMap, setRevisaoMap] = useState({}) // entrada_id -> { nivel, proxima_revisao }

  // Carregar estado de repetição espaçada do usuário
  useEffect(() => {
    if (!session) return
    supabase.from('flashcards').select('entrada_id, nivel, proxima_revisao').eq('user_id', session.user.id)
      .then(({ data }) => {
        if (!data) return
        const mapa = {}
        data.forEach(r => { mapa[r.entrada_id] = r })
        setRevisaoMap(mapa)
      })
  }, [session])

  function iniciar(f, pendentes) {
    const d = buildDeck(entradas, f, revisaoMap, pendentes)
    setFiltros(f)
    setSoPendentes(pendentes)
    setDeck(d)
    setIdx(0)
    setVirada(false)
    setStats({ facil: 0, dificil: 0, errei: 0 })
    setEtapa('sessao')
  }

  async function avaliar(resultado) {
    setStats(s => ({ ...s, [resultado]: s[resultado] + 1 }))

    // Persistir repetição espaçada (se logada) — não bloqueia a navegação
    const carta = deck[idx]
    if (session && carta) {
      const nivelAtual = revisaoMap[carta.entry.id]?.nivel || 0
      const { nivel, proximaRevisao } = calcularProximaRevisao(nivelAtual, resultado)
      setRevisaoMap(m => ({ ...m, [carta.entry.id]: { nivel, proxima_revisao: proximaRevisao } }))
      supabase.from('flashcards').upsert({
        user_id: session.user.id,
        entrada_id: carta.entry.id,
        frente: carta.entry.tema,
        verso: carta.tese.tese_assunto,
        nivel,
        proxima_revisao: proximaRevisao,
      }, { onConflict: 'user_id,entrada_id' }).then(() => {})
    }

    const proximo = idx + 1
    if (proximo >= deck.length) {
      setEtapa('resumo')
    } else {
      setVirada(false)
      setTimeout(() => setIdx(proximo), 100)
    }
  }

  // Atalhos de teclado
  useEffect(() => {
    if (etapa !== 'sessao') return
    const handler = (e) => {
      if (!virada && e.key === ' ') { e.preventDefault(); setVirada(true) }
      if (virada) {
        if (e.key === '1') avaliar('facil')
        if (e.key === '2') avaliar('dificil')
        if (e.key === '3') avaliar('errei')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [etapa, virada, idx])

  if (etapa === 'config') return (
    <div style={{ paddingBottom: 40 }}>
      <Configurar entradas={entradas} revisaoMap={revisaoMap} onIniciar={iniciar} />
    </div>
  )

  if (etapa === 'resumo') return (
    <div style={{ paddingBottom: 40 }}>
      <Resumo
        stats={stats} total={deck.length}
        onReiniciar={() => iniciar(filtros, soPendentes)}
        onVoltar={() => setEtapa('config')}
      />
    </div>
  )

  const carta = deck[idx]
  const progresso = Math.round((idx / deck.length) * 100)

  return (
    <div style={{ paddingBottom: 40, maxWidth: 680, margin: '0 auto' }}>

      {/* Header da sessão */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setEtapa('config')}
          style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 13, fontFamily: 'IBM Plex Mono, monospace' }}>
          ← Configurar
        </button>
        <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace' }}>
          {idx + 1} / {deck.length}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}>
          <span style={{ color: '#10b981' }}>✓ {stats.facil}</span>
          <span style={{ color: '#f59e0b' }}>~ {stats.dificil}</span>
          <span style={{ color: '#ef4444' }}>✗ {stats.errei}</span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ background: theme.border, borderRadius: 4, height: 4, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: theme.gold, width: `${progresso}%`, transition: 'width .3s ease', borderRadius: 4 }} />
      </div>

      {/* Carta */}
      <Carta carta={carta} virada={virada} onVirar={() => setVirada(true)} />

      {/* Botões de avaliação (só aparecem após virar) */}
      {virada ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 20 }}>
          {[
            { key: 'errei',   label: 'Errei',   sub: 'rever depois', cor: '#ef4444', icon: '✗', atalho: '3' },
            { key: 'dificil', label: 'Difícil', sub: 'mais prática',  cor: '#f59e0b', icon: '~', atalho: '2' },
            { key: 'facil',   label: 'Sabia',   sub: 'dominado',     cor: '#10b981', icon: '✓', atalho: '1' },
          ].map(b => (
            <button key={b.key} onClick={() => avaliar(b.key)}
              style={{ background: b.cor + '22', border: `1px solid ${b.cor}44`, color: b.cor, borderRadius: 10, padding: '14px 8px', cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all .15s' }}
              onMouseEnter={ev => { ev.currentTarget.style.background = b.cor + '44'; ev.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={ev => { ev.currentTarget.style.background = b.cor + '22'; ev.currentTarget.style.transform = 'none' }}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{b.label}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{b.sub}</span>
              <span style={{ fontSize: 9, opacity: 0.5, marginTop: 2 }}>tecla {b.atalho}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => setVirada(true)}
            style={{ background: theme.gold, border: 'none', color: '#0b0f1a', borderRadius: 10, padding: '12px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
            Revelar resposta
          </button>
          <div style={{ fontSize: 10, color: theme.muted, marginTop: 8 }}>ou pressione Espaço</div>
        </div>
      )}
    </div>
  )
}
