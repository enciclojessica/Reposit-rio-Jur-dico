import { useState, useEffect, useMemo } from 'react'
import { FileUp, Check, AlertTriangle, RotateCcw, X } from 'lucide-react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { parseEmenda, compararComBanco, montarOperacoes, rotuloDispositivo } from '../utils/parserAtualizacao'

const CODIGOS = ['cf', 'adct', 'cc', 'cdc', 'cp', 'cpc', 'cpp', 'ctb', 'lep', 'clt', 'ctn', 'lei15040', 'lei9099', 'lei8906', 'cedoab']
const PADRAO_REFERENCIA = ['cc', 'cdc', 'cp', 'cpc', 'lei9099']
const ROTULO_STATUS = { alterar: 'Alterar', inserir: 'Inserir', igual: 'Já idêntico', ambiguo: 'Ambíguo' }

async function textoDoPdf(arquivo) {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  const doc = await pdfjs.getDocument({ data: await arquivo.arrayBuffer() }).promise
  const saida = []
  for (let p = 1; p <= doc.numPages; p++) {
    const pagina = await doc.getPage(p)
    const conteudo = await pagina.getTextContent()
    const linhas = new Map()
    for (const it of conteudo.items) {
      if (!('str' in it)) continue
      const y = Math.round(it.transform[5])
      if (!linhas.has(y)) linhas.set(y, [])
      linhas.get(y).push({ x: it.transform[4], s: it.str })
    }
    const ys = [...linhas.keys()].sort((a, b) => b - a)
    for (const y of ys) saida.push(linhas.get(y).sort((a, b) => a.x - b.x).map(i => i.s).join(' '))
  }
  return saida.join('\n')
}

export default function Atualizacoes() {
  const { theme } = useTheme()
  const [alertas, setAlertas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [alertaSel, setAlertaSel] = useState(null)
  const [codigo, setCodigo] = useState('cf')
  const [texto, setTexto] = useState('')
  const [lendo, setLendo] = useState(false)
  const [itens, setItens] = useState([])
  const [avisosGerais, setAvisosGerais] = useState([])
  const [marcados, setMarcados] = useState(new Set())
  const [autorizaPadrao, setAutorizaPadrao] = useState(false)
  const [aplicando, setAplicando] = useState(false)
  const [leiAlteradora, setLeiAlteradora] = useState('')
  const [dataNorma, setDataNorma] = useState('')
  const [msg, setMsg] = useState(null)
  const [revisar, setRevisar] = useState([])

  const ops = useMemo(() => montarOperacoes(itens, { selecionados: marcados }), [itens, marcados])
  const tocaPadrao = PADRAO_REFERENCIA.includes(codigo) && ops.length > 0

  async function carregarAlertas() {
    setCarregando(true)
    const { data, error } = await supabase.from('legislacao_alertas').select('*').order('detectado_em', { ascending: false })
    if (error) setMsg({ tipo: 'err', texto: `Não foi possível carregar os alertas: ${error.message}` })
    setAlertas(data || [])
    setCarregando(false)
  }

  async function carregarRevisar() {
    const { data, error } = await supabase.from('legislacao')
      .select('id,codigo,numero,titulo,texto,contexto,aplicacao_pratica')
      .eq('comentario_revisar', true).order('codigo').order('numero').limit(300)
    if (error) { setMsg({ tipo: 'err', texto: `Não foi possível carregar os comentários a revisar: ${error.message}` }); return }
    setRevisar(data || [])
  }

  async function marcarRevisado(l) {
    const { error } = await supabase.from('legislacao').update({ comentario_revisar: false }).eq('id', l.id)
    if (error) { setMsg({ tipo: 'err', texto: `Erro ao marcar como revisado: ${error.message}` }); return }
    setMsg({ tipo: 'ok', texto: `Comentário de ${l.codigo.toUpperCase()} ${l.titulo || `Art. ${l.numero}`} marcado como revisado.` })
    carregarRevisar()
  }

  useEffect(() => { carregarAlertas(); carregarRevisar() }, [])

  function escolherAlerta(a) {
    setAlertaSel(a)
    if (a?.codigos?.[0]) setCodigo(a.codigos[0])
    const ano = String(a?.data_norma || '').match(/\d{4}/)?.[0]
    setLeiAlteradora(a ? `${a.tipo.toUpperCase()} ${a.numero}${ano ? `/${ano}` : ''}` : '')
    setItens([]); setMarcados(new Set()); setMsg(null)
  }

  async function mudarStatus(a, status) {
    const { error } = await supabase.from('legislacao_alertas').update({ status }).eq('id', a.id)
    if (error) { setMsg({ tipo: 'err', texto: `Erro ao mudar o status: ${error.message}` }); return }
    setMsg({ tipo: 'ok', texto: `Alerta ${a.tipo.toUpperCase()} ${a.numero} marcado como ${status}.` })
    if (alertaSel?.id === a.id) setAlertaSel({ ...a, status })
    carregarAlertas()
  }

  async function lerPdf(e) {
    const arq = e.target.files?.[0]
    if (!arq) return
    setLendo(true); setMsg(null)
    try {
      setTexto(await textoDoPdf(arq))
    } catch (err) {
      setMsg({ tipo: 'err', texto: `Não foi possível ler o PDF: ${err.message}. Cole o texto da norma no campo.` })
    }
    setLendo(false)
    e.target.value = ''
  }

  async function compararTexto() {
    setLendo(true); setMsg(null); setItens([])
    const { dispositivos, avisos } = parseEmenda(texto, { codigo })
    if (dispositivos.length === 0) {
      setAvisosGerais(avisos)
      setMsg({ tipo: 'err', texto: 'Nenhum dispositivo entre aspas foi reconhecido. Confira se o texto é o da norma (blocos "Art. ... (NR)").' })
      setLendo(false); return
    }
    const numeros = [...new Set(dispositivos.map(d => d.numero))]
    const { data, error } = await supabase.from('legislacao')
      .select('id,numero,titulo,inciso,paragrafo,texto,vigente')
      .eq('codigo', codigo).in('numero', numeros).limit(5000)
    if (error) {
      setMsg({ tipo: 'err', texto: `Erro ao ler o banco: ${error.message}` })
      setLendo(false); return
    }
    const r = compararComBanco(dispositivos, data || [])
    setItens(r.itens)
    setAvisosGerais(avisos)
    setMarcados(new Set(r.itens.map((d, i) => (d.status === 'alterar' || d.status === 'inserir') ? i : -1).filter(i => i >= 0)))
    setLendo(false)
  }

  function editarTexto(idx, novo) {
    setItens(l => l.map((d, i) => i === idx ? { ...d, texto: novo } : d))
  }

  function alternar(idx) {
    setMarcados(s => { const n = new Set(s); if (n.has(idx)) n.delete(idx); else n.add(idx); return n })
  }

  async function aplicar() {
    if (ops.length === 0) return
    if (!window.confirm(`Aplicar ${ops.length} operação(ões) em ${codigo.toUpperCase()}? A redação anterior fica guardada no histórico.`)) return
    setAplicando(true); setMsg(null)
    const { data, error } = await supabase.rpc('aplicar_atualizacao', {
      p_ops: ops,
      p_alerta_tipo: alertaSel?.tipo ?? null,
      p_alerta_numero: alertaSel?.numero ?? null,
      p_autorizar_padrao: autorizaPadrao,
      p_lei_alteradora: leiAlteradora.trim() || null,
      p_data_norma: dataNorma || null,
    })
    setAplicando(false)
    if (error) { setMsg({ tipo: 'err', texto: `Nada foi gravado. ${error.message}` }); return }
    setMsg({ tipo: 'ok', texto: `Aplicado: ${data.atualizados} atualizado(s), ${data.inseridos} inserido(s).` })
    setItens([]); setMarcados(new Set()); setTexto('')
    carregarAlertas()
    carregarRevisar()
  }

  const card = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }
  const secao = { fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 14 }
  const campo = { background: theme.inputBg, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '8px 12px', color: theme.text, fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }
  const botao = (ativo) => ({
    background: ativo ? theme.gold : theme.border, color: ativo ? '#fdfbf7' : theme.muted, border: 'none', borderRadius: 6,
    padding: '10px 18px', fontSize: 13, lineHeight: 1.2, fontWeight: 600, cursor: ativo ? 'pointer' : 'not-allowed', fontFamily: 'Inter, sans-serif',
  })
  const corStatus = (s) => s === 'pendente' ? theme.gold : s === 'aplicado' ? theme.success : theme.muted

  return (
    <div style={{ paddingBottom: 40, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>
          Atualizações legislativas
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
          A rotina semanal avisa das normas novas; aqui você confere a diferença e aprova. O texto vem do compilado do Planalto.
        </div>
      </div>

      {msg && (
        <div role="status" style={{
          ...card, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start',
          borderColor: msg.tipo === 'ok' ? theme.success : theme.error, color: msg.tipo === 'ok' ? theme.success : theme.error,
          fontSize: 13, fontFamily: theme.fontSerif,
        }}>
          {msg.tipo === 'ok' ? <Check size={15} /> : <AlertTriangle size={15} />}<span>{msg.texto}</span>
        </div>
      )}

      <div style={card}>
        <div style={secao}>Alertas de normas novas</div>
        {carregando ? <div style={{ color: theme.muted, fontSize: 13 }}>Carregando…</div>
          : alertas.length === 0 ? <div style={{ color: theme.muted, fontSize: 13, fontFamily: theme.fontSerif }}>Nenhum alerta registrado.</div>
          : alertas.map((a, i) => (
            <div key={a.id} style={{
              display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0',
              borderBottom: i < alertas.length - 1 ? `0.5px solid ${theme.border}` : 'none',
              background: alertaSel?.id === a.id ? theme.btnMutedBg : 'transparent',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: theme.text, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  {a.tipo.toUpperCase()} {a.numero}{a.data_norma ? `, ${a.data_norma}` : ''}
                  <span style={{ marginLeft: 8, fontSize: 11, color: corStatus(a.status), fontWeight: 600 }}>{a.status}</span>
                </div>
                <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.fontSerif, lineHeight: 1.5 }}>
                  {a.ementa}{a.codigos?.length ? ` (${a.codigos.join(', ')})` : ''}
                </div>
                {a.url && <a href={a.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: theme.gold }}>Abrir no Planalto</a>}
              </div>
              <button onClick={() => escolherAlerta(a)} style={{ ...campo, cursor: 'pointer' }}>Conferir</button>
              {a.status === 'pendente'
                ? <button onClick={() => mudarStatus(a, 'descartado')} title="Descartar" style={{ ...campo, cursor: 'pointer' }}><X size={13} /></button>
                : <button onClick={() => mudarStatus(a, 'pendente')} title="Reabrir" style={{ ...campo, cursor: 'pointer' }}><RotateCcw size={13} /></button>}
            </div>
          ))}
      </div>

      {revisar.length > 0 && (
        <div style={card}>
          <div style={secao}>Comentários a revisar ({revisar.length})</div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.fontSerif, marginBottom: 10 }}>
            O texto do artigo mudou depois que o comentário foi escrito. Revise o Comentário didático e a Aplicação prática e marque como revisado.
          </div>
          {revisar.map((l, i) => (
            <div key={l.id} style={{ padding: '10px 0', borderTop: i > 0 ? `0.5px solid ${theme.border}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{l.codigo.toUpperCase()} {l.titulo || `Art. ${l.numero}`}</span>
                <button onClick={() => marcarRevisado(l)} style={{ ...campo, cursor: 'pointer', display: 'inline-flex', gap: 6, alignItems: 'center' }}><Check size={13} /> Marcar como revisado</button>
              </div>
              <div style={{ fontSize: 12, color: theme.text, fontFamily: theme.fontSerif, lineHeight: 1.5 }}><strong>Artigo:</strong> {l.texto}</div>
              {l.contexto && <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.fontSerif, lineHeight: 1.5, marginTop: 3 }}><strong>Comentário:</strong> {l.contexto}</div>}
              {l.aplicacao_pratica && <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.fontSerif, lineHeight: 1.5, marginTop: 3 }}><strong>Aplicação:</strong> {l.aplicacao_pratica}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={card}>
        <div style={secao}>
          Texto da norma{alertaSel ? `: ${alertaSel.tipo.toUpperCase()} ${alertaSel.numero}` : ' (avulsa)'}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: theme.muted }}>Código
            <select value={codigo} onChange={e => { setCodigo(e.target.value); setItens([]) }} style={{ ...campo, marginLeft: 8 }}>
              {CODIGOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label style={{ ...campo, cursor: 'pointer', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <FileUp size={14} /> {lendo ? 'Lendo…' : 'Enviar PDF'}
            <input type="file" accept="application/pdf" onChange={lerPdf} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: theme.muted }}>Norma alteradora (selo no cartão)
            <input value={leiAlteradora} onChange={e => setLeiAlteradora(e.target.value)} placeholder="EC 141/2026" style={{ ...campo, marginLeft: 8, width: 150 }} />
          </label>
          <label style={{ fontSize: 12, color: theme.muted }}>Data da norma
            <input type="date" value={dataNorma} onChange={e => setDataNorma(e.target.value)} style={{ ...campo, marginLeft: 8 }} />
          </label>
        </div>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={8}
          placeholder="Cole aqui o texto da emenda ou lei (com os blocos entre aspas) ou envie o PDF do Planalto."
          style={{ ...campo, width: '100%', fontFamily: theme.fontSerif, lineHeight: 1.5, resize: 'vertical' }} />
        <div style={{ marginTop: 12 }}>
          <button onClick={compararTexto} disabled={!texto.trim() || lendo} style={botao(!!texto.trim() && !lendo)}>
            Comparar com o banco
          </button>
        </div>
      </div>

      {avisosGerais.length > 0 && (
        <div style={{ ...card, borderColor: theme.gold }}>
          {avisosGerais.map((a, i) => <div key={i} style={{ fontSize: 12, color: theme.text, fontFamily: theme.fontSerif }}>{a}</div>)}
        </div>
      )}

      {itens.length > 0 && (
        <div style={card}>
          <div style={secao}>Relatório de diferenças ({itens.length} dispositivos)</div>
          {itens.map((d, idx) => (
            <div key={idx} style={{ padding: '12px 0', borderBottom: `0.5px solid ${theme.border}` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                <input type="checkbox" checked={marcados.has(idx)} disabled={d.status === 'igual' || d.status === 'ambiguo'}
                  onChange={() => alternar(idx)} aria-label={`Aplicar ${rotuloDispositivo(d)}`} />
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: 'Inter, sans-serif' }}>{rotuloDispositivo(d)}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: d.status === 'igual' ? theme.muted : d.status === 'ambiguo' ? theme.error : theme.gold }}>
                  {ROTULO_STATUS[d.status]}
                </span>
              </div>
              {d.status === 'alterar' && (
                <div style={{ fontSize: 12, color: theme.muted, fontFamily: theme.fontSerif, lineHeight: 1.5, marginBottom: 6 }}>
                  <strong>Banco:</strong> {d.anterior}
                </div>
              )}
              <textarea value={d.texto} onChange={e => editarTexto(idx, e.target.value)} rows={3}
                disabled={d.status === 'igual' || d.status === 'ambiguo'}
                style={{ ...campo, width: '100%', fontFamily: theme.fontSerif, lineHeight: 1.5, resize: 'vertical' }} />
              {d.avisos.map((a, i) => (
                <div key={i} style={{ fontSize: 12, color: theme.gold, marginTop: 4, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <AlertTriangle size={13} style={{ marginTop: 2, flexShrink: 0 }} /><span>{a}</span>
                </div>
              ))}
            </div>
          ))}

          {tocaPadrao && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '14px 0', fontSize: 12, color: theme.error, fontFamily: theme.fontSerif }}>
              <input type="checkbox" checked={autorizaPadrao} onChange={e => setAutorizaPadrao(e.target.checked)} />
              {codigo.toUpperCase()} é padrão de referência: confirmo a autorização expressa para alterá-lo.
            </label>
          )}
          <div style={{ marginTop: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={aplicar} disabled={aplicando || ops.length === 0 || (tocaPadrao && !autorizaPadrao)}
              style={botao(!aplicando && ops.length > 0 && (!tocaPadrao || autorizaPadrao))}>
              {aplicando ? 'Aplicando…' : `Aplicar ${ops.length} operação(ões)`}
            </button>
            <span style={{ fontSize: 12, color: theme.muted, fontFamily: theme.fontSerif }}>
              Tudo ou nada: se qualquer linha falhar, nada é gravado. A redação anterior vai para o histórico.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
