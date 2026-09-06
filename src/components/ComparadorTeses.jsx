import { useState, useMemo } from 'react'
import { X, Search, ArrowLeftRight, Copy, Check } from 'lucide-react'
import { useTheme } from '../theme'
import { AreaDot, labelCampoTese } from '../shared'

function Seletor({ entradas, valor, onEscolher, cor, theme }) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)

  const resultados = useMemo(() => {
    if (!busca.trim()) return []
    const q = busca.toLowerCase()
    return entradas.filter(e => e.tema?.toLowerCase().includes(q)).slice(0, 8)
  }, [busca, entradas])

  if (valor) {
    return (
      <div style={{ border: `1px solid ${cor}55`, borderTop: `3px solid ${cor}`, borderRadius: 8, padding: 14, position: 'relative' }}>
        <button onClick={() => onEscolher(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}>
          <X size={15} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <AreaDot area={valor.area} theme={theme} />
          <span style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>{valor.area}, {valor.tipo}</span>
        </div>
        <div style={{ fontSize: 14, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, paddingRight: 20 }}>{valor.tema}</div>
      </div>
    )
  }

  return (
    <div style={{ border: `1px dashed ${theme.border}`, borderRadius: 8, padding: 14, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: aberto ? 10 : 0 }}>
        <Search size={14} color={theme.muted} />
        <input
          value={busca}
          onChange={e => { setBusca(e.target.value); setAberto(true) }}
          onFocus={() => setAberto(true)}
          placeholder="Buscar entrada por tema…"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: theme.text, fontSize: 13, fontFamily: theme.fontSerif }}
        />
      </div>
      {aberto && resultados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
          {resultados.map(e => (
            <div key={e.id} onClick={() => { onEscolher(e); setBusca(''); setAberto(false) }}
              style={{ padding: '8px 6px', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={ev => ev.currentTarget.style.background = theme.raised}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
              <AreaDot area={e.area} theme={theme} />
              <span style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontSerif, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.tema}</span>
            </div>
          ))}
        </div>
      )}
      {aberto && busca.trim() && resultados.length === 0 && (
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, padding: '6px 4px' }}>Nada encontrado.</div>
      )}
    </div>
  )
}

function ColunaEntrada({ entrada, cor, theme }) {
  return (
    <div style={{ borderTop: `3px solid ${cor}`, background: theme.raised, borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <AreaDot area={entrada.area} theme={theme} />
        <span style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>{entrada.area}, {entrada.tipo}, {entrada.fonte}</span>
      </div>
      <div style={{ fontSize: 16, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 14 }}>{entrada.tema}</div>
      {(entrada.teses || []).map((t, i) => (
        <div key={i} style={{ marginBottom: 16, paddingTop: i > 0 ? 12 : 0, borderTop: i > 0 ? `1px solid ${theme.border}` : 'none' }}>
          {['tese_assunto', 'fundamentacao_legal', 'ratio_decidendi', 'aplicacao_pratica'].map(campo => (
            t[campo] ? (
              <div key={campo} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: cor, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 2 }}>
                  {labelCampoTese(entrada.tipo, campo)}
                </div>
                <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontSerif, lineHeight: 1.55 }}>{t[campo]}</div>
              </div>
            ) : null
          ))}
        </div>
      ))}
    </div>
  )
}

export default function ComparadorTeses({ entradas, prefilA }) {
  const { theme } = useTheme()
  const [a, setA] = useState(prefilA || null)
  const [b, setB] = useState(null)
  const [copiado, setCopiado] = useState(false)

  const corA = theme.civel || '#3b6ea5'
  const corB = theme.penal || '#7a1128'

  function textoEntrada(entrada) {
    const linhas = [
      `${entrada.tema}`,
      `(${entrada.area}, ${entrada.tipo}, ${entrada.fonte || ''})`,
      '',
    ]
    ;(entrada.teses || []).forEach((t, i) => {
      if (i > 0) linhas.push('')
      ;['tese_assunto', 'fundamentacao_legal', 'ratio_decidendi', 'aplicacao_pratica'].forEach(campo => {
        if (t[campo]) linhas.push(`${labelCampoTese(entrada.tipo, campo)}: ${t[campo]}`)
      })
    })
    return linhas.join('\n')
  }

  function copiarComparacao() {
    if (!a || !b) return
    const texto = [
      'COMPARAÇÃO DE TESES', '',
      textoEntrada(a), '',
      '---', '',
      textoEntrada(b),
    ].join('\n')
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeftRight size={17} /> Comparador de teses
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
            Escolha duas entradas do repositório para ver lado a lado
          </div>
        </div>
        {a && b && (
          <button onClick={copiarComparacao} style={{
            background: 'transparent', border: `1px solid ${copiado ? theme.success : theme.border}`,
            color: copiado ? theme.success : theme.textSub, borderRadius: 6, padding: '7px 12px',
            fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            {copiado ? <Check size={13} /> : <Copy size={13} />} {copiado ? 'Copiado' : 'Copiar comparação'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: a && b ? 24 : 0 }}>
        <Seletor entradas={entradas} valor={a} onEscolher={setA} cor={corA} theme={theme} />
        <Seletor entradas={entradas} valor={b} onEscolher={setB} cor={corB} theme={theme} />
      </div>

      {a && b && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <ColunaEntrada entrada={a} cor={corA} theme={theme} />
          <ColunaEntrada entrada={b} cor={corB} theme={theme} />
        </div>
      )}
    </div>
  )
}
