import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { AREAS, STATUS_META, corDaArea } from '../shared'
import { TagPill } from './TagInput'
import SeletorTema from './SeletorTema'
import { Lock } from 'lucide-react'

function gerarABNT(entry) {
  const fonte  = (entry.fonte || '').toUpperCase()
  const tema   = entry.tema   || ''
  const ref    = entry.referencia || ''
  const url    = entry.url    || ''
  const acesso = new Date().toLocaleDateString('pt-BR')
  const tipo   = entry.tipo   || 'jurisprudência'
  if (tipo === 'lei')      return `BRASIL. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'doutrina') return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  if (tipo === 'súmula')   return `${fonte}. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
}

export default function EntradaPublica({ entradaId, onFechar }) {
  const { theme, mode } = useTheme()
  const [entry, setEntry]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro]     = useState('')
  const [copiado, setCopiado] = useState(false)
  const [copiadoABNT, setCopiadoABNT] = useState(false)

  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from('entradas').select('*').eq('id', entradaId).single()
      if (error || !data) setErro('Entrada não encontrada ou acesso negado.')
      else setEntry(data)
      setLoading(false)
    }
    carregar()
  }, [entradaId])

  function copiarFichamento() {
    if (!entry) return
    const lines = [
      `# ${entry.tema}`,
      `- Área: ${entry.area} | Tipo: ${entry.tipo}`,
      `- Fonte: ${entry.fonte}`,
      `- Referência: ${entry.referencia}`,
      entry.url ? `- URL: ${entry.url}` : '',
      '',
      ...(Array.isArray(entry.teses) ? entry.teses : []).flatMap((t, i) => [
        `## Tese ${i + 1}: ${t.tese_assunto}`,
        `Fundamentação: ${t.fundamentacao_legal}`,
        `Precedente: ${t.precedente_sumula}`,
        `Ratio Decidendi: ${t.ratio_decidendi}`,
        `Aplicação Prática: ${t.aplicacao_pratica}`,
        '',
      ]),
    ].join('\n')
    navigator.clipboard.writeText(lines)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function copiarABNT() {
    if (!entry) return
    navigator.clipboard.writeText(gerarABNT(entry))
    setCopiadoABNT(true)
    setTimeout(() => setCopiadoABNT(false), 2000)
  }

  const am     = entry ? { color: corDaArea(entry.area, theme) } : {}
  const status = entry ? (STATUS_META[entry.status] || STATUS_META['vigente']) : null

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg,
      fontFamily: 'IBM Plex Mono, monospace',
    }}>
      {/* Header */}
      <div style={{
        background: theme.surface, borderBottom: `1px solid ${theme.borderGold}`,
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: theme.logoBg, borderRadius: 6, padding: '4px 10px 3px', border: mode === 'light' ? `1px solid ${theme.border}` : 'none' }}>
            <img src="/logo.png" alt="Farias Fusquiani" style={{ height: 28, width: 'auto', display: 'block' }}/>
          </div>
          <div style={{ fontSize: 11, color: theme.muted }}>Repositório Jurídico · entrada compartilhada</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SeletorTema compact />
          {onFechar && (
            <button onClick={onFechar} style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', color: theme.muted, fontSize: 12, cursor: 'pointer' }}>
              ← Voltar ao repositório
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: theme.gold, fontSize: 16, fontFamily: 'Playfair Display, serif' }}>
            Carregando...
          </div>
        )}

        {erro && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ marginBottom: 12, opacity: 0.3, display: 'flex', justifyContent: 'center' }}><Lock size={40} /></div>
            <div style={{ fontSize: 16, color: theme.error }}>{erro}</div>
          </div>
        )}

        {entry && (
          <>
            {/* Alerta de superada */}
            {entry.status === 'superada' && (
              <div style={{ background: mode === 'dark' ? '#3b0f0f' : '#fef2f2', border: '1px solid #ef444466', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>✗</span>
                <div>
                  <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 700, marginBottom: 2 }}>Entendimento superado</div>
                  <div style={{ fontSize: 12, color: theme.muted }}>Esta tese foi marcada como superada. Verifique o entendimento atual antes de usar.</div>
                </div>
              </div>
            )}

            {/* Cabeçalho da entrada */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
                <span style={{ background: am.color + '22', color: am.color, border: `1px solid ${am.color}44`, borderRadius: 4, padding: '2px 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{entry.area}</span>
                <span style={{ background: theme.raised, color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{entry.tipo}</span>
                {status && (
                  <span style={{ background: status.cor + '22', color: status.cor, border: `1px solid ${status.cor}44`, borderRadius: 20, padding: '2px 10px', fontSize: 11 }}>
                    {status.icon} {status.label}
                  </span>
                )}
                {(entry.tags || []).map(t => <TagPill key={t} tag={t} pequena />)}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, serif', lineHeight: 1.3, margin: '0 0 8px' }}>
                {entry.tema}
              </h1>
              <div style={{ fontSize: 12, color: theme.muted }}>
                {entry.fonte && <span>{entry.fonte} · </span>}
                {entry.referencia && <span>{entry.referencia} · </span>}
                Compartilhado em {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              <button onClick={copiarFichamento} style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: copiado ? theme.success : theme.muted, borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>
                {copiado ? '✓ Copiado' : '⎘ Copiar fichamento'}
              </button>
              <button onClick={copiarABNT} style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: copiadoABNT ? theme.success : theme.muted, borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}>
                {copiadoABNT ? '✓ Copiado' : '« Copiar ABNT'}
              </button>
              {entry.url && (
                <a href={entry.url} target="_blank" rel="noreferrer" style={{ background: theme.raised, border: `1px solid ${theme.border}`, color: theme.gold, borderRadius: 8, padding: '8px 14px', fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  ↗ Portal oficial
                </a>
              )}
            </div>

            {/* Metadados */}
            {(entry.fonte || entry.referencia || entry.url) && (
              <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Metadados</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {entry.fonte     && <div><div style={{ fontSize: 10, color: theme.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Fonte</div><div style={{ fontSize: 13, color: theme.text }}>{entry.fonte}</div></div>}
                  {entry.referencia && <div><div style={{ fontSize: 10, color: theme.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Referência</div><div style={{ fontSize: 13, color: theme.text }}>{entry.referencia}</div></div>}
                </div>
                {entry.url && <div style={{ marginTop: 12 }}><div style={{ fontSize: 10, color: theme.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>URL</div><a href={entry.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: theme.gold, wordBreak: 'break-all' }}>{entry.url}</a></div>}
              </div>
            )}

            {/* Teses */}
            {(Array.isArray(entry.teses) ? entry.teses : []).map((t, i) => (
              <div key={i} style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Tese {i + 1}</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['Tese/Assunto', 'Fundamentação Legal', 'Precedente/Súmula', 'Ratio Decidendi', 'Aplicação Prática'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', background: theme.bg, color: theme.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${theme.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {[t.tese_assunto, t.fundamentacao_legal, t.precedente_sumula, t.ratio_decidendi, t.aplicacao_pratica].map((val, ci) => (
                          <td key={ci} style={{ padding: '10px 12px', color: theme.text, borderBottom: `1px solid ${theme.border}22`, verticalAlign: 'top', lineHeight: 1.6 }}>{val || '—'}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Citação ABNT */}
            <div style={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: theme.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Citação ABNT NBR 6023:2018</div>
              <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>{gerarABNT(entry)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
