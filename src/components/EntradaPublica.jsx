import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { AREAS, STATUS_META, corDaArea, labelCampoTese } from '../shared'
import { TagPill } from './TagInput'
import { Check, Copy, ExternalLink, AlertCircle } from 'lucide-react'
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
      fontFamily: "Georgia, 'EB Garamond', serif",
    }}>
      {/* Header */}
      <div style={{
        background: '#5e0018', borderBottom: '2px solid #a9812e',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur" style={{ width: 32, height: 32, objectFit: 'contain', display: 'block' }}/>
          <div style={{ fontSize: 12, color: '#c9a878', fontStyle: 'italic' }}>Entrada compartilhada do repositório</div>
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
              <div style={{ background: mode === 'dark' ? '#2a0f10' : '#fff0f0', border: `1px solid ${theme.penal}55`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <AlertCircle size={18} color={theme.penal} />
                <div>
                  <div style={{ fontSize: 13, color: theme.penal, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 2 }}>Entendimento superado</div>
                  <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic' }}>Esta tese foi marcada como superada. Verifique o entendimento atual antes de usar.</div>
                </div>
              </div>
            )}

            {/* Cabeçalho da entrada */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
                <span style={{ color: am.color, fontSize: 12, fontStyle: 'italic' }}>{entry.area}</span>
                <span style={{ color: theme.muted, fontSize: 12, fontStyle: 'italic' }}>{entry.tipo}</span>
                {status && (
                  <span style={{ color: status.cor, fontSize: 12, fontStyle: 'italic', border: `1px solid ${status.cor}55`, borderRadius: 20, padding: '2px 10px' }}>
                    {status.label}
                  </span>
                )}
                {(entry.tags || []).map(t => <TagPill key={t} tag={t} pequena />)}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: theme.text, fontFamily: 'Playfair Display, serif', lineHeight: 1.3, margin: '0 0 8px' }}>
                {entry.tema}
              </h1>
              <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
                {[entry.fonte, entry.referencia, `Compartilhado em ${new Date().toLocaleDateString('pt-BR')}`].filter(Boolean).join(', ')}
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
              <button onClick={copiarFichamento} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: copiado ? theme.success : theme.textSub, borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
                {copiado ? <Check size={13} /> : <Copy size={13} />} {copiado ? 'Copiado' : 'Copiar fichamento'}
              </button>
              <button onClick={copiarABNT} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: copiadoABNT ? theme.success : theme.gold, borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
                {copiadoABNT ? <Check size={13} /> : <Copy size={13} />} {copiadoABNT ? 'Copiado' : 'Copiar ABNT'}
              </button>
              {entry.url && (
                <a href={entry.url} target="_blank" rel="noreferrer" style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.gold, borderRadius: 6, padding: '8px 14px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif' }}>
                  <ExternalLink size={13} /> Portal oficial
                </a>
              )}
            </div>

            {/* Teses */}
            {(Array.isArray(entry.teses) ? entry.teses : []).map((t, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 14 }}>
                  Tese {i + 1}
                </div>
                {[
                  ['tese_assunto',        t.tese_assunto],
                  ['fundamentacao_legal', t.fundamentacao_legal],
                  ['precedente_sumula',   t.precedente_sumula],
                  ['ratio_decidendi',     t.ratio_decidendi],
                  ['aplicacao_pratica',   t.aplicacao_pratica],
                ].filter(([, val]) => val).map(([campo, val]) => (
                  <div key={campo} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: theme.gold, fontStyle: 'italic', marginBottom: 3 }}>{labelCampoTese(entry.tipo, campo)}</div>
                    <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.7 }}>{val}</div>
                  </div>
                ))}
              </div>
            ))}

            {/* Citação ABNT */}
            <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 16, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: theme.gold, fontStyle: 'italic', marginBottom: 8 }}>Citação ABNT NBR 6023:2018</div>
              <div style={{ fontSize: 13, color: theme.textSub, lineHeight: 1.8 }}>{gerarABNT(entry)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
