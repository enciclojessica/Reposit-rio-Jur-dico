import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { NOME_CODIGO } from '../data/legislacaoNomes'
import { Check, Copy } from 'lucide-react'
import SeletorTema from './SeletorTema'

const CODIGOS_META = {
  cpc:     { label: 'CPC',          cor: '#2c5a6e' },
  cdc:     { label: 'CDC',          cor: '#5a4a7a' },
  cc:      { label: 'CC',           cor: '#2c4a6e' },
  cpp:     { label: 'CPP',          cor: '#7a1128' },
  cf:      { label: 'CF/88',        cor: '#3f4a7a' },
  ctb:     { label: 'CTB',          cor: '#8a5a2e' },
  lei9099: { label: 'Lei 9.099/95', cor: '#8a5a2e' },
}

export default function LegislacaoPublica({ codigo, numero, onFechar }) {
  const { theme } = useTheme()
  const [grupos, setGrupos]   = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro]       = useState('')
  const [copiado, setCopiado] = useState(false)
  const meta = CODIGOS_META[codigo] || { label: (codigo || '').toUpperCase(), cor: theme.gold }

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from('legislacao').select('*')
        .eq('codigo', codigo).eq('numero', numero).eq('vigente', true)
        .order('paragrafo', { ascending: true, nullsFirst: true })

      if (error || !data || data.length === 0) { setErro('Artigo não encontrado, ou ainda não importado no repositório.'); setLoading(false); return }

      const mapa = new Map()
      for (const item of data) {
        const chave = item.titulo || ''
        if (!mapa.has(chave)) mapa.set(chave, { titulo: item.titulo, itens: [] })
        mapa.get(chave).itens.push(item)
      }
      setGrupos([...mapa.values()])
      setLoading(false)
    }
    carregar()
  }, [codigo, numero])

  function copiar(grupo) {
    const corpo = grupo.itens.map(i => i.texto).join('\n')
    navigator.clipboard.writeText(`${meta.label} ${grupo.titulo || `Art. ${numero}`}\n\n${corpo}`)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "Georgia, 'EB Garamond', serif" }}>
      <div style={{ background: '#5e0018', borderBottom: '2px solid #a9812e', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur" style={{ width: 32, height: 32, objectFit: 'contain', display: 'block' }}/>
          <div style={{ fontSize: 12, color: '#c9a878', fontStyle: 'italic' }}>Legislação, Themis Jur</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SeletorTema compact />
          {onFechar && (
            <button onClick={onFechar} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', color: '#e8dfc8', fontSize: 12, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif", cursor: 'pointer' }}>
              Voltar ao repositório
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px' }}>
        {loading && <div style={{ color: theme.muted, fontStyle: 'italic' }}>Carregando…</div>}

        {erro && (
          <div style={{ color: theme.penal, fontStyle: 'italic' }}>{erro}</div>
        )}

        {!loading && !erro && grupos.map((grupo, gi) => (
          <div key={gi} style={{ marginBottom: 32, paddingBottom: 24, borderBottom: gi < grupos.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ color: meta.cor, fontSize: 13, fontStyle: 'italic' }}>{meta.label}</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle }}>
                  {grupo.titulo || `Art. ${numero}`}
                </span>
              </div>
              <button onClick={() => copiar(grupo)} style={{ background: 'transparent', color: copiado ? theme.success : theme.textSub, border: `1px solid ${copiado ? theme.success : theme.border}`, borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', marginBottom: 14 }}>
              {NOME_CODIGO[codigo] || meta.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {grupo.itens.map((item, i) => (
                <div key={i} style={{ fontSize: 15, color: theme.text, lineHeight: 1.8, paddingLeft: (item.inciso || item.paragrafo) ? 16 : 0 }}>
                  {item.texto}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!loading && !erro && (
          <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', marginTop: 20 }}>
            Texto de lei em domínio público, curado pela Themis Jur para consulta rápida. Sempre confira a redação vigente na fonte oficial antes de usar em peça processual.
          </div>
        )}
      </div>
    </div>
  )
}
