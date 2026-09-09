import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import SeletorTema from './SeletorTema'

const VINHO = '#3d0012'
const OURO = '#a9812e'
const OURO_CLARO = '#e8c98a'
const MARFIM = '#fdfbf7'
const MARFIM_ESCURO = '#f6ede0'
const TINTA = '#2c241b'
const TINTA_SUAVE = '#3a3128'
const MUSGO = '#736b62'
const SERIF = "Georgia, 'EB Garamond', serif"

const NOME_TIPO = { 'jurisprudência': 'Jurisprudência', 'doutrina': 'Doutrina', 'súmula': 'Súmula', 'lei': 'Legislação' }
const NOME_CODIGO_LANDING = {
  cc: 'Código Civil', cpc: 'Código de Processo Civil', cpp: 'Código de Processo Penal',
  cdc: 'Código de Defesa do Consumidor', cf: 'Constituição Federal',
  ctb: 'Código de Trânsito Brasileiro', lei9099: 'Lei 9.099/1995 (Juizados Especiais)',
}

// Revela a seção uma vez, quando ela entra na tela ao rolar.
function useRevelar() {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entrada]) => { if (entrada.isIntersecting) { setVisivel(true); obs.disconnect() } },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visivel]
}

// Conta de 0 até o valor real quando a seção fica visível — o único
// momento de movimento de verdade da página. Ele existe porque diz algo
// (o número é real, não estático), não como decoração de entrada.
function useContagem(alvo, ativo, duracaoMs = 1400) {
  const [valor, setValor] = useState(0)
  useEffect(() => {
    if (!ativo || alvo == null) return
    let inicio = null
    let quadro
    function passo(agora) {
      if (inicio === null) inicio = agora
      const progresso = Math.min((agora - inicio) / duracaoMs, 1)
      const suavizado = 1 - Math.pow(1 - progresso, 3)
      setValor(Math.round(alvo * suavizado))
      if (progresso < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [ativo, alvo, duracaoMs])
  return valor
}

// Transição real, ligada à posição de rolagem: a seção entra com leve
// zoom-out e opacidade baixa, e ganha nitidez/escala plena conforme
// ocupa mais da tela — não é um "aparece uma vez e para", responde ao
// scroll em tempo real, inclusive voltando ao rolar pra cima.
function Secao({ children, decoracao, style, id }) {
  const ref = useRef(null)
  const [proporcao, setProporcao] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const passos = Array.from({ length: 21 }, (_, i) => i / 20)
    const obs = new IntersectionObserver(
      ([entrada]) => setProporcao(entrada.intersectionRatio),
      { threshold: passos }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  const forca = Math.min(proporcao / 0.55, 1)
  return (
    <section ref={ref} id={id} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', scrollSnapAlign: 'start', ...style }}>
      {decoracao}
      <div style={{
        opacity: 0.15 + 0.85 * forca,
        transform: `scale(${0.9 + 0.1 * forca})`,
        transition: 'opacity .05s linear, transform .05s linear',
        position: 'relative',
      }}>
        {children}
      </div>
    </section>
  )
}

export default function Landing({ onEntrar }) {
  const { theme } = useTheme()

  const [numeros, setNumeros] = useState(null)
  useEffect(() => {
    supabase.rpc('contar_acervo_publico').then(({ data }) => { if (data) setNumeros(data) })
  }, [])

  const [refStats, statsVisivel] = useRevelar()

  return (
    <div style={{ background: MARFIM, fontFamily: SERIF, height: '100vh', overflowY: 'auto', scrollSnapType: 'y proximity' }}>

      {/* Header fixo */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: MARFIM + 'f2', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: `1px solid ${TINTA}14` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          <span style={{ fontFamily: SERIF, fontSize: 14, color: TINTA }}>Themis Jur</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <SeletorTema compact />
          <button onClick={onEntrar} style={{ background: 'none', border: 'none', color: MUSGO, fontSize: 12, fontStyle: 'italic', cursor: 'pointer', fontFamily: SERIF }}>
            Já tenho acesso
          </button>
        </div>
      </div>

      {/* ── HERO — a tipografia é o gráfico. A balança está desenhada atrás
          do próprio texto, integrada, não num canto pequeno. ─────────── */}
      <Secao style={{ background: VINHO, position: 'relative', overflow: 'hidden', padding: '0 40px' }}
        decoracao={
          <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, opacity: 0.09 }} aria-hidden="true">
            <line x1="500" y1="120" x2="500" y2="520" stroke={OURO_CLARO} strokeWidth="2" />
            <line x1="260" y1="220" x2="740" y2="220" stroke={OURO_CLARO} strokeWidth="2" />
            <path d="M120 220 A140 100 0 0 0 400 220" fill="none" stroke={OURO_CLARO} strokeWidth="1.4" />
            <path d="M600 220 A140 100 0 0 0 880 220" fill="none" stroke={OURO_CLARO} strokeWidth="1.4" />
            <line x1="380" y1="700" x2="620" y2="700" stroke={OURO_CLARO} strokeWidth="2" />
          </svg>
        }>
        <div style={{ position: 'relative', maxWidth: 900 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur"
            style={{ width: 88, height: 88, objectFit: 'contain', marginBottom: 28, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.35))' }} />
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 'clamp(48px, 8vw, 108px)', lineHeight: 0.98, color: MARFIM, marginBottom: 36, letterSpacing: -1 }}>
            A tese certa,<br />na hora da peça.
          </div>
          <div style={{ fontSize: 17, color: OURO_CLARO, fontStyle: 'italic', maxWidth: 480, lineHeight: 1.6, marginBottom: 40 }}>
            Acervo curado de jurisprudência, doutrina e legislação — reunido por uma pessoa só, artigo por artigo.
          </div>
          <button onClick={() => document.getElementById('porque')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'transparent', border: `1px solid ${OURO_CLARO}`, color: OURO_CLARO, fontSize: 13, padding: '13px 30px', cursor: 'pointer', fontFamily: SERIF }}>
            Conhecer o acervo
          </button>
        </div>
      </Secao>

      {/* ── CITAÇÃO — a aspas é a textura de fundo da seção inteira, não um
          símbolo pequeno acima do texto. ──────────────────────────────── */}
      <Secao id="porque" style={{ background: MARFIM_ESCURO, position: 'relative', overflow: 'hidden', padding: '0 40px' }}
        decoracao={
          <div aria-hidden="true" style={{
            position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -58%)',
            fontFamily: theme.fontTitle, fontSize: 'min(70vw, 900px)', lineHeight: 1, color: OURO, opacity: 0.07,
            userSelect: 'none', pointerEvents: 'none',
          }}>”</div>
        }>
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.55, color: TINTA, marginBottom: 32 }}>
            A curadoria começou por necessidade prática: reunir num só lugar o que antes ficava espalhado entre anotações e pastas soltas. O que era organização pessoal virou repositório.
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 'bold', fontSize: 16, color: TINTA }}>Jessica Farias Fusquiani</div>
          <div style={{ fontStyle: 'italic', fontSize: 13, color: MUSGO }}>Idealizadora do Themis Jur</div>
        </div>
      </Secao>

      {/* ── O QUE TEM DE DIFERENTE — glosa marginal, como anotação à margem
          de um volume impresso. Rótulo nomeado, não numerado (não é uma
          sequência). ───────────────────────────────────────────────────── */}
      <Secao style={{ background: MARFIM, padding: '80px 40px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: TINTA, marginBottom: 56 }}>
            O que tem de diferente
          </div>
          {[
            { rotulo: 'Fundamento', texto: 'Cada entrada reúne tese, fundamento legal e uma indicação de uso prático: não é ementa solta, é material pronto para consulta em peça.' },
            { rotulo: 'Curadoria', texto: 'Por enquanto, a curadoria é de uma pessoa só. Cada fonte passa por conferência antes de entrar no acervo.' },
            { rotulo: 'Cruzamento', texto: 'Legislação, jurisprudência e doutrina convivem no mesmo espaço, e uma remete à outra.' },
          ].map((item, i) => (
            <div key={item.rotulo} style={{ display: 'flex', gap: 32, borderTop: i === 0 ? `1px solid ${TINTA}22` : 'none', borderBottom: `1px solid ${TINTA}22`, padding: '28px 0' }}>
              <div style={{ width: 150, flexShrink: 0, fontFamily: SERIF, fontWeight: 'bold', fontSize: 15, color: OURO, paddingTop: 2 }}>{item.rotulo}</div>
              <div style={{ fontSize: 16, color: TINTA_SUAVE, lineHeight: 1.65, maxWidth: 480 }}>{item.texto}</div>
            </div>
          ))}
        </div>
      </Secao>

      {/* ── PARA QUEM É — mesmo dispositivo, rótulo pelo público. ───────── */}
      <Secao style={{ background: VINHO, padding: '80px 40px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: MARFIM, marginBottom: 56 }}>
            Para quem é
          </div>
          {[
            { rotulo: 'Quem estuda', texto: 'O acervo oferece fonte primária no lugar do resumo de resumo, desde o início dos estudos.' },
            { rotulo: 'Quem advoga', texto: 'Citação pronta e tese comentada em meio à rotina, sem precisar reconstruir o raciocínio do zero.' },
            { rotulo: 'Quem leciona', texto: 'O material já chega organizado por área e por tipo, pronto para uso em sala.' },
          ].map((item, i) => (
            <div key={item.rotulo} style={{ display: 'flex', gap: 32, borderTop: i === 0 ? `1px solid ${OURO_CLARO}33` : 'none', borderBottom: `1px solid ${OURO_CLARO}33`, padding: '28px 0' }}>
              <div style={{ width: 150, flexShrink: 0, fontFamily: SERIF, fontWeight: 'bold', fontSize: 15, color: OURO_CLARO, paddingTop: 2 }}>{item.rotulo}</div>
              <div style={{ fontSize: 16, color: '#e8dfd0', lineHeight: 1.65, maxWidth: 480 }}>{item.texto}</div>
            </div>
          ))}
        </div>
      </Secao>

      {/* ── NÚMEROS — o único momento de movimento da página: contagem real
          ao vivo, disparada quando a seção entra na tela. ──────────────── */}
      <Secao style={{ background: MARFIM, padding: '80px 40px' }} id="numeros">
        <div ref={refStats} style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: TINTA, marginBottom: 12 }}>
            Curadoria real, não promessa vazia
          </div>
          <div style={{ fontSize: 14, color: MUSGO, fontStyle: 'italic', marginBottom: 56 }}>
            Números do acervo, ao vivo — crescem sozinhos conforme mais entradas são curadas.
          </div>
          {numeros && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
              <NumeroGrande valor={numeros.total_entradas} ativo={statsVisivel} cor="#7a1128" label="entradas curadas" theme={theme} />
              <NumeroGrande valor={numeros.total_artigos_vigentes} ativo={statsVisivel} cor={OURO} label="artigos de lei vigentes" theme={theme} />
              <NumeroGrande valor={numeros.total_codigos} ativo={statsVisivel} cor="#2c4a6e" label="códigos e diplomas legais" theme={theme} />
              <NumeroGrande valor={100} sufixo="%" ativo={statsVisivel} cor={TINTA} label="fonte real e rastreável" theme={theme} />
            </div>
          )}
        </div>
      </Secao>

      {/* ── LEDGER — composição do acervo, como um sumário/índice impresso,
          não cards. ─────────────────────────────────────────────────────── */}
      <Secao style={{ background: MARFIM_ESCURO, padding: '80px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: TINTA, marginBottom: 56 }}>
            Do que é feito o acervo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 48 }}>
            <Ledger titulo="Por tipo de fonte" dados={numeros?.por_tipo} nomear={k => NOME_TIPO[k] || k} cor="#7a1128" />
            <Ledger titulo="Legislação vigente" dados={numeros?.por_codigo} nomear={k => NOME_CODIGO_LANDING[k] || k.toUpperCase()} cor="#2c4a6e" />
            <Ledger titulo="Por tribunal" dados={numeros?.por_tribunal} nomear={k => k} cor={OURO} />
          </div>
        </div>
      </Secao>

      {/* ── DO ACERVO, AGORA + CTA FINAL ──────────────────────────────────── */}
      <Secao style={{ background: VINHO, padding: '80px 40px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: MARFIM, marginBottom: 48 }}>
            Do acervo, agora
          </div>
          <div style={{ borderTop: `1px solid ${OURO_CLARO}33`, padding: '24px 0' }}>
            <div style={{ fontSize: 16, color: '#e8dfd0', lineHeight: 1.65 }}>
              <b style={{ color: MARFIM }}>União estável.</b> Comunicabilidade do patrimônio formado durante a relação, ainda que a contribuição não tenha sido financeira.
            </div>
            <div style={{ fontSize: 12, color: OURO_CLARO, fontStyle: 'italic', marginTop: 8 }}>STJ, REsp 1.234.567/SP, Família</div>
          </div>
          <div style={{ borderTop: `1px solid ${OURO_CLARO}33`, borderBottom: `1px solid ${OURO_CLARO}33`, padding: '24px 0', marginBottom: 56 }}>
            <div style={{ fontSize: 16, color: '#e8dfd0', lineHeight: 1.65 }}>
              <b style={{ color: MARFIM }}>Pronúncia.</b> Dúvida sobre legítima defesa não autoriza absolvição sumária; apreciação cabe ao Tribunal do Júri.
            </div>
            <div style={{ fontSize: 12, color: OURO_CLARO, fontStyle: 'italic', marginTop: 8 }}>STJ, AgRg no AREsp 872.992/PE, Penal</div>
          </div>
          <button onClick={onEntrar} style={{ background: OURO_CLARO, border: 'none', color: VINHO, fontSize: 15, fontWeight: 'bold', padding: '15px 42px', cursor: 'pointer', fontFamily: SERIF }}>
            Criar conta gratuita
          </button>
          <div style={{ fontSize: 12, color: OURO_CLARO, fontStyle: 'italic', marginTop: 14 }}>
            Acesso ao acervo completo, sem custo. Busca com IA é recurso da versão paga.
          </div>
        </div>
      </Secao>

    </div>
  )
}

function NumeroGrande({ valor, sufixo = '', ativo, cor, label, theme }) {
  const contado = useContagem(valor, ativo)
  return (
    <div>
      <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 'clamp(40px, 5vw, 56px)', color: cor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {contado.toLocaleString('pt-BR')}{sufixo}
      </div>
      <div style={{ fontSize: 13, color: TINTA_SUAVE, marginTop: 10 }}>{label}</div>
    </div>
  )
}

function Ledger({ titulo, dados, nomear, cor }) {
  if (!dados) return null
  const entradas = Object.entries(dados).sort((a, b) => b[1] - a[1])
  return (
    <div>
      <div style={{ fontFamily: SERIF, fontWeight: 'bold', fontSize: 15, color: TINTA, marginBottom: 16, borderBottom: `2px solid ${cor}`, paddingBottom: 8 }}>{titulo}</div>
      {entradas.map(([chave, valor]) => (
        <div key={chave} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${TINTA}14`, fontSize: 14 }}>
          <span style={{ color: TINTA_SUAVE }}>{nomear(chave)}</span>
          <span style={{ color: cor, fontFamily: SERIF, fontWeight: 'bold' }}>{valor.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  )
}
