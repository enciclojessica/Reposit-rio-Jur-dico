import { useState, useEffect } from 'react'
import { Check, Link2, Unlock, Star, ArrowLeftRight } from 'lucide-react'
import { useTheme } from '../theme'
import { AREAS, Badge, STATUS_META, corDaArea, labelCampoTese } from '../shared'
import TextoComReferenciasLegais from './TextoComReferenciasLegais'
import { supabase } from '../supabase'
import { TagPill } from './TagInput'
import AnotacaoPessoal from './AnotacaoPessoal'

// Garante string segura
const s = (v) => (v == null ? '' : String(v))

// Garante array seguro
function arr(v) {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.trim().startsWith('[')) {
    try { const p = JSON.parse(v); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}

function gerarABNT(entry) {
  try {
    const fonte = s(entry.fonte).toUpperCase()
    const tipo  = s(entry.tipo)
    const acesso = new Date().toLocaleDateString('pt-BR')
    const url   = s(entry.url)
    const ref   = s(entry.referencia)
    const tema  = s(entry.tema)
    if (tipo === 'lei')      return `BRASIL. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
    if (tipo === 'súmula')   return `${fonte}. ${ref || tema}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
    if (tipo === 'doutrina') return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
    return `${fonte}. ${tema}. ${ref}.${url ? ` Disponível em: ${url}.` : ''} Acesso em: ${acesso}.`
  } catch { return '' }
}

export default function EntradaDetail({ entry: raw, session, onClose, onDelete, onEdit, readOnly, onStatusChange, onDuplicar, onAbrirArtigoLegislacao, favorito, onAlternarFavorito, onComparar }) {
  const { theme, mode } = useTheme()

  // Normalização defensiva total
  const entry = {
    id:         s(raw?.id),
    area:       s(raw?.area)       || 'Cível',
    tipo:       s(raw?.tipo)       || 'jurisprudência',
    tema:       s(raw?.tema)       || '',
    fonte:      s(raw?.fonte)      || '',
    referencia: s(raw?.referencia) || '',
    url:        s(raw?.url)        || '',
    status:     s(raw?.status)     || 'vigente',
    ia_status:  s(raw?.ia_status)  || 'manual',
    criado_em:  s(raw?.criado_em)  || '',
    teses:      arr(raw?.teses),
    historico:  arr(raw?.historico),
    tags:       arr(raw?.tags),
  }

  const iasPendente = entry.ia_status === 'ia_pendente'

  const [status, setStatus]               = useState(entry.status)
  const [showStatus, setShowStatus]       = useState(false)
  const [copied, setCopied]               = useState(false)
  const [copiedAbnt, setCopiedAbnt]       = useState(false)
  const [linkCopiado, setLinkCopiado]     = useState(false)
  const [erroCompartilhar, setErroCompartilhar] = useState('')
  const [publica, setPublica]             = useState(!!entry.publica)
  const [showPreviewAbnt, setShowPreviewAbnt] = useState(false)
  const [salvandoStatus, setSalvandoStatus] = useState(false)

  // Histórico de leitura — alimenta "Continuar de onde parei" no Hoje.
  // Fora do fluxo visível pro usuário, silencioso, best-effort.
  useEffect(() => {
    if (!session?.user?.id || !entry.id) return
    supabase.from('historico_leitura').upsert({
      user_id: session.user.id, entrada_id: entry.id, visto_em: new Date().toISOString(),
    }, { onConflict: 'user_id,entrada_id' })
  }, [session?.user?.id, entry.id])

  const am = { color: corDaArea(entry.area, theme) }
  const abnt = gerarABNT(entry)

  async function alterarStatus(novo) {
    setSalvandoStatus(true)
    setShowStatus(false)
    const { error } = await supabase.from('entradas').update({ status: novo }).eq('id', entry.id)
    if (!error) {
      setStatus(novo)
      if (onStatusChange) onStatusChange(entry.id, novo)
    }
    setSalvandoStatus(false)
  }

  function copyFichamento() {
    const linhas = [
      `# ${entry.tema}`,
      `- Área: ${entry.area} | Tipo: ${entry.tipo}`,
      `- Fonte: ${entry.fonte}`,
      `- Referência: ${entry.referencia}`,
      entry.url ? `- URL: ${entry.url}` : '',
      '',
      ...entry.teses.flatMap((t, i) => [
        `## Tese ${i+1}: ${s(t?.tese_assunto)}`,
        `Fundamentação: ${s(t?.fundamentacao_legal)}`,
        `Precedente: ${s(t?.precedente_sumula)}`,
        `Fundamento: ${s(t?.ratio_decidendi)}`,
        `Aplicação: ${s(t?.aplicacao_pratica)}`,
        '',
      ]),
    ].join('\n')
    navigator.clipboard.writeText(linhas)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyAbnt() {
    navigator.clipboard.writeText(abnt)
    setCopiedAbnt(true)
    setTimeout(() => setCopiedAbnt(false), 2000)
  }

  async function compartilhar() {
    setErroCompartilhar('')
    if (!publica) {
      const { error } = await supabase.from('entradas').update({ publica: true }).eq('id', entry.id)
      if (error) { setErroCompartilhar('Não foi possível gerar o link. Tente novamente.'); return }
      setPublica(true)
    }
    navigator.clipboard.writeText(`${window.location.origin}/?entrada=${entry.id}`)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2500)
  }

  async function tornarPrivada() {
    const { error } = await supabase.from('entradas').update({ publica: false }).eq('id', entry.id)
    if (!error) setPublica(false)
  }

  const btn = (destaque) => ({
    border: `1px solid ${destaque || theme.border}`, borderRadius: 6, padding: '8px 14px',
    fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'transparent', color: theme.textSub,
  })

  const label = { fontSize: 12, color: theme.gold, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }
  const secao = { fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 14 }

  const sm = STATUS_META[status] || STATUS_META['vigente']

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
          <Badge label={entry.area} color={am.color} />
          <Badge label={entry.tipo} color={theme.muted} />
          {entry.tags.map(t => <TagPill key={t} tag={t} pequena />)}
        </div>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, lineHeight: 1.3, marginBottom: 6 }}>
          {entry.tema}
        </div>
        {(entry.fonte || entry.referencia) && (
          <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
            {[entry.fonte, entry.referencia].filter(Boolean).join(', ')}
          </div>
        )}
        {entry.url && (
          <a href={entry.url} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: theme.gold, wordBreak: 'break-all', display: 'block', marginTop: 4, fontFamily: theme.fontSerif }}>
            {entry.url}
          </a>
        )}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status */}
        {!readOnly && (
          <div style={{ position: 'relative' }}>
            <span onClick={() => setShowStatus(m => !m)}
              style={{ color: sm.cor, border: `1px solid ${sm.cor}55`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontStyle: 'italic', fontFamily: theme.fontSerif, cursor: 'pointer', userSelect: 'none', display: 'inline-block' }}>
              {sm.label}
            </span>
            {showStatus && (
              <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 50, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: theme.shadow, minWidth: 170 }}>
                {Object.entries(STATUS_META).map(([k, meta]) => (
                  <button key={k} onClick={() => alterarStatus(k)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: status === k ? meta.cor+'14' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: status === k ? meta.cor : theme.text, fontFamily: theme.fontSerif, fontStyle: 'italic', textAlign: 'left' }}>
                    {meta.label}
                    {status === k && <Check size={13} style={{ marginLeft: 'auto' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {onAlternarFavorito && (
          <button onClick={() => onAlternarFavorito(entry.id)}
            title={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            style={{ ...btn(favorito ? theme.gold : theme.border), color: favorito ? theme.gold : theme.textSub, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={13} fill={favorito ? theme.gold : 'none'} /> {favorito ? 'Favorito' : 'Favoritar'}
          </button>
        )}

        {onComparar && (
          <button onClick={() => onComparar(entry)} style={{ ...btn(), color: theme.textSub, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeftRight size={13} /> Comparar
          </button>
        )}

        <button onClick={copyFichamento} style={{ ...btn(), color: copied ? theme.success : theme.textSub }}>
          {copied ? 'Copiado' : 'Fichamento'}
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={copyAbnt}
            onMouseEnter={() => setShowPreviewAbnt(true)}
            onMouseLeave={() => setShowPreviewAbnt(false)}
            style={{ ...btn(), color: copiedAbnt ? theme.success : theme.gold }}>
            {copiedAbnt ? 'Copiado' : 'ABNT'}
          </button>
          {showPreviewAbnt && abnt && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: theme.surface, border: `1px solid ${theme.borderGold}`, borderRadius: 8, padding: '12px 16px', width: 340, fontSize: 12, color: theme.text, lineHeight: 1.7, fontFamily: theme.fontSerif, boxShadow: theme.shadow, zIndex: 50 }}>
              <div style={{ fontSize: 11, color: theme.gold, fontStyle: 'italic', marginBottom: 6 }}>Prévia ABNT</div>
              {abnt}
            </div>
          )}
        </div>

        <button onClick={compartilhar} style={{ ...btn(), color: linkCopiado ? theme.success : theme.textSub, display: 'flex', alignItems: 'center', gap: 6 }}>
          {linkCopiado ? <><Check size={13} /> Copiado</> : <><Link2 size={13} /> Compartilhar</>}
        </button>
        {publica && (
          <button onClick={tornarPrivada} title="Qualquer pessoa com o link ainda consegue acessar até você tornar privada de novo"
            style={{ ...btn(theme.success), fontSize: 11, color: theme.success, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Unlock size={12} /> Pública, tornar privada
          </button>
        )}
        {erroCompartilhar && (
          <div style={{ fontSize: 12, color: theme.penal, width: '100%', fontStyle: 'italic', fontFamily: theme.fontSerif }}>{erroCompartilhar}</div>
        )}

        {!readOnly && (
          <>
            {onDuplicar && (
              <button onClick={() => onDuplicar(raw)} style={btn()}>Duplicar</button>
            )}
            <button onClick={onEdit} style={{ ...btn(), marginLeft: 'auto' }}>Editar</button>
            {onDelete && (
              <button onClick={onDelete} style={{ ...btn(theme.penal), color: theme.penal }}>
                Excluir
              </button>
            )}
          </>
        )}
      </div>

      {/* Teses */}
      {entry.teses.length > 0 && entry.teses.map((t, i) => {
        if (!t || typeof t !== 'object') return null
        return (
          <div key={i} style={{ marginBottom: 28 }}>
            <div style={secao}>Tese {i+1}</div>
            {[
              ['tese_assunto',        s(t.tese_assunto),        false],
              ['fundamentacao_legal', s(t.fundamentacao_legal), false],
              ['precedente_sumula',   s(t.precedente_sumula),   false],
              ['ratio_decidendi',     s(t.ratio_decidendi),     true],
              ['aplicacao_pratica',   s(t.aplicacao_pratica),   true],
            ].filter(([, val]) => val).map(([campo, val, isIa]) => (
              <div key={campo} style={{
                marginBottom: 14,
                background: isIa && iasPendente ? (mode === 'dark' ? '#1c160033' : '#fffbeb66') : 'transparent',
                border: isIa && iasPendente ? `1px dashed ${theme.gold}66` : 'none',
                borderRadius: isIa && iasPendente ? 8 : 0,
                padding: isIa && iasPendente ? '10px 12px' : 0,
              }}>
                <div style={label}>
                  {labelCampoTese(entry.tipo, campo)}
                  {isIa && iasPendente && (
                    <span style={{ color: theme.gold, fontSize: 11, fontStyle: 'italic' }}>
                      — sugestão de IA, pendente de revisão
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.7, fontFamily: theme.fontSerif }}>
                  {(campo === 'fundamentacao_legal' || campo === 'ratio_decidendi')
                    ? <TextoComReferenciasLegais texto={val} theme={theme} onAbrirArtigo={onAbrirArtigoLegislacao} />
                    : val}
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {entry.teses.length === 0 && (
        <div style={{ color: theme.muted, fontSize: 13, fontStyle: 'italic', fontFamily: theme.fontSerif, padding: '20px 0' }}>Nenhuma tese cadastrada.</div>
      )}

      {/* Minha Anotação — estudo ativo */}
      <div style={{ marginTop: 8 }}>
        <div style={secao}>Minha anotação</div>
        <AnotacaoPessoal itemId={entry.id} session={session} namespace="entrada" theme={theme} placeholder="Anote aqui o que você aprendeu, uma dúvida, ou como pretende usar isso numa peça..." />
      </div>

      {/* Histórico */}
      {entry.historico.length > 0 && (
        <div style={{ marginTop: 28, opacity: 0.75 }}>
          <div style={{ ...secao, color: theme.muted, borderBottom: `1px solid ${theme.border}` }}>Histórico de alterações</div>
          {entry.historico.slice(0, 10).map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: theme.muted, whiteSpace: 'nowrap', fontStyle: 'italic', fontFamily: theme.fontSerif }}>
                {h?.data ? new Date(h.data).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''}
              </div>
              <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontSerif }}>{s(h?.descricao)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
