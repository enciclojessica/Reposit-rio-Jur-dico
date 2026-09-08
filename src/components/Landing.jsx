import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import SeletorTema from './SeletorTema'

// Balança em linha fina + monograma FF — mesma marca em toda a página,
// só muda de cor por seção e de tamanho.
function IconeBalanca({ cor, size = 20 }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 40 44" aria-hidden="true">
      <line x1="20" y1="6" x2="20" y2="28" stroke={cor} strokeWidth="1" />
      <line x1="8" y1="11" x2="32" y2="11" stroke={cor} strokeWidth="1" />
      <path d="M4 20 A8 6 0 0 0 12 20" fill="none" stroke={cor} strokeWidth="0.9" />
      <path d="M28 20 A8 6 0 0 0 36 20" fill="none" stroke={cor} strokeWidth="0.9" />
      <line x1="8" y1="11" x2="4" y2="20" stroke={cor} strokeWidth="0.7" />
      <line x1="8" y1="11" x2="12" y2="20" stroke={cor} strokeWidth="0.7" />
      <line x1="32" y1="11" x2="28" y2="20" stroke={cor} strokeWidth="0.7" />
      <line x1="32" y1="11" x2="36" y2="20" stroke={cor} strokeWidth="0.7" />
      <circle cx="20" cy="6" r="1.6" fill={cor} />
      <text x="20" y="40" textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="12" fill={cor}>FF</text>
    </svg>
  )
}

function MarcaCanto({ cor }) {
  return (
    <div style={{ position: 'absolute', right: 18, top: 16, opacity: 0.55 }}>
      <IconeBalanca cor={cor} size={20} />
    </div>
  )
}

// Rótulo pequeno com barrinha dourada antes do título — técnica emprestada
// de landing pages de SaaS jurídico (ex: jusratio.com.br), adaptada pra
// tipografia serifada e paleta vinho/ouro do Themis Jur em vez do
// navy/laranja/sans-serif original.
function RotuloComBarra({ texto, cor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 28, height: 2, background: cor }} />
      <div style={{ fontFamily: "Georgia, 'EB Garamond', serif", fontStyle: 'italic', fontSize: 13, color: cor, letterSpacing: 0.5 }}>{texto}</div>
    </div>
  )
}

// Item numerado com entrada em cascata (delay por índice) e leve elevação
// ao passar o mouse — só o essencial, sem exagero, mantendo o registro
// editorial do resto do app.
function ItemNumerado({ numero, texto, cor, atraso, corpoStyle }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: 14, borderRadius: 8, marginBottom: 12,
        animation: `fadeUp .5s ease both`, animationDelay: `${atraso}s`,
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover ? '0 10px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'transform .2s ease, box-shadow .2s ease',
      }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: cor, marginBottom: 6, lineHeight: 1 }}>{numero}</div>
      <div style={corpoStyle}>{texto}</div>
    </div>
  )
}

// Barra horizontal proporcional — mesmo princípio já usado no Painel de
// Métricas (lacunas por área), pra mostrar composição sem virar tabela.
function BarraItem({ label, valor, max, cor, atraso }) {
  return (
    <div style={{ marginBottom: 14, animation: 'fadeUp .5s ease both', animationDelay: `${atraso}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#2c241b', fontFamily: 'Georgia, serif' }}>{label}</span>
        <span style={{ fontSize: 13, color: cor, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>{valor.toLocaleString('pt-BR')}</span>
      </div>
      <div style={{ background: '#e4ddd0', borderRadius: 3, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(3, (valor / max) * 100)}%`, height: '100%', background: cor, borderRadius: 3 }} />
      </div>
    </div>
  )
}

export default function Landing({ onEntrar }) {
  const { theme } = useTheme()
  const [pagina, setPagina] = useState(0)
  const touchStart = useRef(null)

  // Números reais do acervo, buscados ao vivo (função contar_acervo_publico,
  // security definer — só devolve agregados, nunca conteúdo de entrada
  // nenhuma) — atualizam sozinhos conforme o acervo cresce, nunca fixos.
  const [numeros, setNumeros] = useState(null)
  useEffect(() => {
    supabase.rpc('contar_acervo_publico').then(({ data }) => {
      if (data) setNumeros(data)
    })
  }, [])

  const NOME_TIPO = { 'jurisprudência': 'Jurisprudência', 'doutrina': 'Doutrina', 'súmula': 'Súmula', 'lei': 'Legislação' }
  const NOME_CODIGO_LANDING = {
    cc: 'Código Civil', cpc: 'Código de Processo Civil', cpp: 'Código de Processo Penal',
    cdc: 'Código de Defesa do Consumidor', cf: 'Constituição Federal',
    ctb: 'Código de Trânsito Brasileiro', lei9099: 'Lei 9.099/1995 (Juizados Especiais)',
  }

  const numeral = { fontFamily: theme.fontTitle, fontSize: 13, flexShrink: 0 }
  const corpo = { fontFamily: theme.fontSerif, fontSize: 14, color: '#3a3128', lineHeight: 1.65 }

  const paginas = [
    // 0 — Hero
    <div key="hero" style={{ background: '#3d0012', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="fade-up" style={{ position: 'absolute', right: -60, top: -30, opacity: 0.15, animation: 'respirar 6s ease-in-out infinite' }}>
        <svg width="300" height="210" viewBox="0 0 260 180" aria-hidden="true">
          <line x1="130" y1="10" x2="130" y2="90" stroke="#e8c98a" strokeWidth="1.1" />
          <line x1="80" y1="30" x2="180" y2="30" stroke="#e8c98a" strokeWidth="1.1" />
          <path d="M64 30 A16 12 0 0 0 96 30" fill="none" stroke="#e8c98a" strokeWidth="0.8" />
          <path d="M164 30 A16 12 0 0 0 196 30" fill="none" stroke="#e8c98a" strokeWidth="0.8" />
          <line x1="105" y1="105" x2="155" y2="105" stroke="#e8c98a" strokeWidth="1.1" />
        </svg>
      </div>
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%', animation: 'fadeUp .5s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <span style={{ fontFamily: theme.fontTitle, fontSize: 14, color: '#f2e9d8' }}>Themis Jur</span>
        </div>
        <div style={{ fontStyle: 'italic', fontSize: 13, color: '#c9a878', marginBottom: 12 }}>
          Acervo curado de jurisprudência, doutrina e legislação
        </div>
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 28, lineHeight: 1.25, color: '#f2e9d8', marginBottom: 24 }}>
          A tese certa, na hora da peça.
        </div>
        <button onClick={() => setPagina(1)} style={{ background: 'transparent', border: '1px solid #e8c98a', color: '#e8c98a', fontSize: 13, padding: '10px 22px', cursor: 'pointer', fontFamily: theme.fontSerif }}>
          Conhecer o acervo
        </button>
      </div>
    </div>,

    // 1 — Por que existe
    <div key="porque" style={{ background: '#f6ede0', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', right: -60, bottom: -80, opacity: 0.14, animation: 'respirar 6s ease-in-out infinite' }}>
        <svg width="260" height="260" viewBox="0 0 220 220" aria-hidden="true">
          <circle cx="110" cy="110" r="90" fill="none" stroke="#a9812e" strokeWidth="0.8" />
          <circle cx="110" cy="110" r="62" fill="none" stroke="#a9812e" strokeWidth="0.8" />
          <circle cx="110" cy="110" r="34" fill="none" stroke="#a9812e" strokeWidth="0.8" />
        </svg>
      </div>
      <MarcaCanto cor="#a9812e" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%', animation: 'fadeUp .5s ease both' }}>
        <div style={{ fontFamily: theme.fontTitle, fontSize: 44, color: '#a9812e', lineHeight: 0.5, marginBottom: 12 }}>"</div>
        <div style={{ ...corpo, fontSize: 16, marginBottom: 18 }}>
          A curadoria começou por necessidade prática: reunir num só lugar o que antes ficava espalhado entre anotações e pastas soltas. O que era organização pessoal virou repositório.
        </div>
        <div style={{ fontFamily: theme.fontTitle, fontSize: 14, color: '#2c241b' }}>Jessica Farias Fusquiani</div>
        <div style={{ fontStyle: 'italic', fontSize: 12, color: '#736b62' }}>Idealizadora do Themis Jur</div>
      </div>
    </div>,

    // 2 — O que tem de diferente
    <div key="diferente" style={{ background: '#fdfbf7', borderTop: '4px solid #a9812e', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', right: -40, bottom: -30, opacity: 0.13, animation: 'respirar 6s ease-in-out infinite' }}>
        <svg width="230" height="160" viewBox="0 0 200 140" aria-hidden="true">
          <line x1="20" y1="30" x2="180" y2="30" stroke="#a9812e" strokeWidth="0.8" />
          <line x1="100" y1="30" x2="100" y2="10" stroke="#a9812e" strokeWidth="0.8" />
          <line x1="20" y1="30" x2="45" y2="80" stroke="#a9812e" strokeWidth="0.8" />
          <line x1="20" y1="30" x2="-5" y2="80" stroke="#a9812e" strokeWidth="0.8" />
          <line x1="-5" y1="80" x2="45" y2="80" stroke="#a9812e" strokeWidth="0.8" />
          <line x1="180" y1="30" x2="205" y2="80" stroke="#a9812e" strokeWidth="0.8" />
          <line x1="180" y1="30" x2="155" y2="80" stroke="#a9812e" strokeWidth="0.8" />
          <line x1="155" y1="80" x2="205" y2="80" stroke="#a9812e" strokeWidth="0.8" />
        </svg>
      </div>
      <MarcaCanto cor="#a9812e" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 600, fontSize: 17, color: '#2c241b', marginBottom: 14 }}>O que tem de diferente</div>
        <ItemNumerado numero="01" cor="#a9812e" atraso={0.05} corpoStyle={corpo}
          texto="Cada entrada reúne tese, fundamento e uma indicação de uso prático: não é ementa solta, é material pronto para consulta em peça." />
        <ItemNumerado numero="02" cor="#a9812e" atraso={0.18} corpoStyle={corpo}
          texto="Por enquanto, a curadoria é de uma pessoa só. Cada fonte passa por conferência antes de entrar no acervo." />
        <ItemNumerado numero="03" cor="#a9812e" atraso={0.31} corpoStyle={corpo}
          texto="Legislação, jurisprudência e doutrina convivem no mesmo espaço, e uma remete à outra." />
      </div>
    </div>,

    // 3 — Para quem é
    <div key="paraquem" style={{ background: '#fdfbf7', borderTop: '4px solid #7a1128', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', right: -40, bottom: -30, opacity: 0.12, animation: 'respirar 6s ease-in-out infinite' }}>
        <svg width="210" height="180" viewBox="0 0 180 150" aria-hidden="true">
          <circle cx="40" cy="30" r="5" fill="none" stroke="#7a1128" strokeWidth="1" />
          <circle cx="90" cy="20" r="5" fill="none" stroke="#7a1128" strokeWidth="1" />
          <circle cx="140" cy="45" r="5" fill="none" stroke="#7a1128" strokeWidth="1" />
          <circle cx="60" cy="80" r="5" fill="none" stroke="#7a1128" strokeWidth="1" />
          <circle cx="120" cy="90" r="5" fill="none" stroke="#7a1128" strokeWidth="1" />
          <line x1="40" y1="30" x2="90" y2="20" stroke="#7a1128" strokeWidth="0.6" />
          <line x1="90" y1="20" x2="140" y2="45" stroke="#7a1128" strokeWidth="0.6" />
          <line x1="40" y1="30" x2="60" y2="80" stroke="#7a1128" strokeWidth="0.6" />
          <line x1="60" y1="80" x2="120" y2="90" stroke="#7a1128" strokeWidth="0.6" />
          <line x1="90" y1="20" x2="60" y2="80" stroke="#7a1128" strokeWidth="0.6" />
        </svg>
      </div>
      <MarcaCanto cor="#7a1128" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 600, fontSize: 17, color: '#2c241b', marginBottom: 14 }}>Para quem é</div>
        <ItemNumerado numero="01" cor="#7a1128" atraso={0.05} corpoStyle={corpo}
          texto="Para quem inicia os estudos, o acervo oferece fonte primária no lugar do resumo de resumo." />
        <ItemNumerado numero="02" cor="#7a1128" atraso={0.18} corpoStyle={corpo}
          texto="Para quem já advoga, é citação pronta e tese comentada em meio à rotina." />
        <ItemNumerado numero="03" cor="#7a1128" atraso={0.31} corpoStyle={corpo}
          texto="Para quem leciona, o material já chega organizado por área e por tipo." />
      </div>
    </div>,

    // 4 — O acervo em números (dados ao vivo)
    <div key="numeros" style={{ background: '#fdfbf7', borderTop: '4px solid #2c4a6e', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <MarcaCanto cor="#2c4a6e" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <RotuloComBarra texto="o acervo em números" cor="#2c4a6e" />
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 19, color: '#2c241b', marginBottom: 24 }}>
          Curadoria real, não promessa vazia
        </div>
        {!numeros ? (
          <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', fontFamily: theme.fontSerif }}>Carregando números do acervo…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            <div style={{ animation: 'fadeUp .5s ease both', animationDelay: '.05s' }}>
              <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 36, color: '#7a1128', lineHeight: 1 }}>{numeros.total_entradas}</div>
              <div style={{ fontSize: 12, color: '#3a3128', fontFamily: theme.fontSerif, marginTop: 6, lineHeight: 1.4 }}>entradas curadas</div>
            </div>
            <div style={{ animation: 'fadeUp .5s ease both', animationDelay: '.15s' }}>
              <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 36, color: '#a9812e', lineHeight: 1 }}>{numeros.total_artigos_vigentes.toLocaleString('pt-BR')}</div>
              <div style={{ fontSize: 12, color: '#3a3128', fontFamily: theme.fontSerif, marginTop: 6, lineHeight: 1.4 }}>artigos de lei vigentes</div>
            </div>
            <div style={{ animation: 'fadeUp .5s ease both', animationDelay: '.25s' }}>
              <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 36, color: '#2c4a6e', lineHeight: 1 }}>{numeros.total_codigos}</div>
              <div style={{ fontSize: 12, color: '#3a3128', fontFamily: theme.fontSerif, marginTop: 6, lineHeight: 1.4 }}>códigos e diplomas legais</div>
            </div>
            <div style={{ animation: 'fadeUp .5s ease both', animationDelay: '.35s' }}>
              <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 36, color: '#3a3128', lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: 12, color: '#3a3128', fontFamily: theme.fontSerif, marginTop: 6, lineHeight: 1.4 }}>fonte real e rastreável</div>
            </div>
          </div>
        )}
      </div>
    </div>,

    // 5 — Tipos de fonte
    <div key="tipos" style={{ background: '#fdfbf7', borderTop: '4px solid #a9812e', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <MarcaCanto cor="#a9812e" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <RotuloComBarra texto="composição do acervo" cor="#a9812e" />
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 19, color: '#2c241b', marginBottom: 24 }}>
          Jurisprudência, doutrina, súmula e lei, lado a lado
        </div>
        {!numeros ? (
          <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', fontFamily: theme.fontSerif }}>Carregando…</div>
        ) : (() => {
          const maxTipo = Math.max(...Object.values(numeros.por_tipo))
          const cores = { 'jurisprudência': '#7a1128', 'doutrina': '#2c4a6e', 'súmula': '#a34a68', 'lei': '#a9812e' }
          return Object.entries(numeros.por_tipo)
            .sort((a, b) => b[1] - a[1])
            .map(([tipo, valor], i) => (
              <BarraItem key={tipo} label={NOME_TIPO[tipo] || tipo} valor={valor} max={maxTipo} cor={cores[tipo] || '#a9812e'} atraso={i * 0.12} />
            ))
        })()}
      </div>
    </div>,

    // 6 — Legislação por código
    <div key="legislacao" style={{ background: '#fdfbf7', borderTop: '4px solid #2c4a6e', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <MarcaCanto cor="#2c4a6e" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <RotuloComBarra texto="legislação vigente no acervo" cor="#2c4a6e" />
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 19, color: '#2c241b', marginBottom: 24 }}>
          Artigo por artigo, código por código
        </div>
        {!numeros ? (
          <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', fontFamily: theme.fontSerif }}>Carregando…</div>
        ) : (() => {
          const maxCodigo = Math.max(...Object.values(numeros.por_codigo))
          return Object.entries(numeros.por_codigo)
            .sort((a, b) => b[1] - a[1])
            .map(([codigo, valor], i) => (
              <BarraItem key={codigo} label={NOME_CODIGO_LANDING[codigo] || codigo.toUpperCase()} valor={valor} max={maxCodigo} cor="#2c4a6e" atraso={i * 0.1} />
            ))
        })()}
      </div>
    </div>,

    // 7 — Tribunais representados
    <div key="tribunais" style={{ background: '#fdfbf7', borderTop: '4px solid #7a1128', padding: '40px 24px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <MarcaCanto cor="#7a1128" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <RotuloComBarra texto="jurisprudência e súmula, por tribunal" cor="#7a1128" />
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 19, color: '#2c241b', marginBottom: 24 }}>
          De onde vêm as decisões
        </div>
        {!numeros ? (
          <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', fontFamily: theme.fontSerif }}>Carregando…</div>
        ) : (() => {
          const maxTribunal = Math.max(...Object.values(numeros.por_tribunal))
          return Object.entries(numeros.por_tribunal)
            .sort((a, b) => b[1] - a[1])
            .map(([tribunal, valor], i) => (
              <BarraItem key={tribunal} label={tribunal} valor={valor} max={maxTribunal} cor="#7a1128" atraso={i * 0.1} />
            ))
        })()}
      </div>
    </div>,

    // 8 — Do acervo, agora
    <div key="acervo" style={{ background: '#fdfbf7', borderTop: '4px solid #2c4a6e', padding: '40px 24px', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <MarcaCanto cor="#2c4a6e" />
      <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div style={{ fontFamily: theme.fontTitle, fontWeight: 600, fontSize: 17, color: '#2c241b', marginBottom: 18 }}>Do acervo, agora</div>

        <div style={{ borderTop: '2px solid #a34a68', paddingTop: 8, marginBottom: 16 }}>
          <div style={{ fontFamily: theme.fontSerif, fontSize: 14, color: '#2c241b' }}>
            <b>União estável.</b> Comunicabilidade do patrimônio formado durante a relação, ainda que a contribuição não tenha sido financeira.
          </div>
          <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', marginTop: 4 }}>STJ, REsp 1.234.567/SP, Família</div>
        </div>

        <div style={{ borderTop: '2px solid #7a1128', paddingTop: 8, marginBottom: 26 }}>
          <div style={{ fontFamily: theme.fontSerif, fontSize: 14, color: '#2c241b' }}>
            <b>Pronúncia.</b> Dúvida sobre legítima defesa não autoriza absolvição sumária; apreciação cabe ao Tribunal do Júri.
          </div>
          <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', marginTop: 4 }}>STJ, AgRg no AREsp 872.992/PE, Penal</div>
        </div>

        <button onClick={onEntrar} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: '1px solid #7a1128', color: '#7a1128', fontSize: 14, padding: '12px', cursor: 'pointer', fontFamily: theme.fontSerif }}>
          Pedir acesso
        </button>
        <div style={{ fontSize: 11, color: '#736b62', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }}>
          Acesso por convite. Envie uma mensagem e a curadora entra em contato.
        </div>
      </div>
    </div>,
  ]

  function irPara(i) {
    setPagina((i + paginas.length) % paginas.length)
  }

  function onTouchStart(e) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStart.current == null) return
    const delta = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(delta) > 50) {
      if (delta < 0 && pagina < paginas.length - 1) irPara(pagina + 1)
      if (delta > 0 && pagina > 0) irPara(pagina - 1)
    }
    touchStart.current = null
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'ArrowRight') irPara(pagina + 1)
      if (e.key === 'ArrowLeft') irPara(pagina - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pagina])

  const [estreito, setEstreito] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : true)
  useEffect(() => {
    function onResize() { setEstreito(window.innerWidth <= 640) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const [hoverEsquerda, setHoverEsquerda] = useState(false)
  const [hoverDireita, setHoverDireita] = useState(false)

  return (
    <div style={{
      minHeight: '100vh', background: estreito ? '#fdfbf7' : '#1a1410',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: estreito ? 0 : 24, boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', maxWidth: 560, height: estreito ? '100vh' : 'min(760px, calc(100vh - 48px))',
        background: '#fdfbf7', fontFamily: theme.fontSerif,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative',
        borderRadius: estreito ? 0 : 14,
        boxShadow: estreito ? 'none' : '0 24px 60px #00000066',
      }}>

      {/* Header, sempre visível */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SeletorTema compact />
          <button onClick={onEntrar} style={{ background: 'none', border: 'none', color: '#736b62', fontSize: 12, fontStyle: 'italic', cursor: 'pointer', fontFamily: theme.fontSerif }}>
            Já tenho acesso
          </button>
        </div>
      </div>

      {/* Página atual, com transição */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {paginas.map((conteudo, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === pagina ? 1 : 0,
            transform: i === pagina ? 'translateX(0)' : (i < pagina ? 'translateX(-16px)' : 'translateX(16px)'),
            transition: 'opacity .35s ease, transform .35s ease',
            pointerEvents: i === pagina ? 'auto' : 'none',
          }}>
            {conteudo}
          </div>
        ))}

        {pagina > 0 && (
          <div onClick={() => irPara(pagina - 1)}
            onMouseEnter={() => setHoverEsquerda(true)} onMouseLeave={() => setHoverEsquerda(false)}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 8, cursor: 'pointer', zIndex: 5 }}>
            <ChevronLeft size={24} color="#736b62" style={{ opacity: hoverEsquerda ? 0.9 : 0, transition: 'opacity .2s ease' }} />
          </div>
        )}
        {pagina < paginas.length - 1 && (
          <div onClick={() => irPara(pagina + 1)}
            onMouseEnter={() => setHoverDireita(true)} onMouseLeave={() => setHoverDireita(false)}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 56, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, cursor: 'pointer', zIndex: 5 }}>
            <ChevronRight size={24} color="#736b62" style={{ opacity: hoverDireita ? 0.9 : 0, transition: 'opacity .2s ease' }} />
          </div>
        )}
      </div>

      {/* Navegação: setas + pontos, sempre visível */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 16px', flexShrink: 0 }}>
        <button onClick={() => irPara(pagina - 1)} aria-label="Página anterior"
          style={{ background: 'none', border: 'none', color: '#736b62', cursor: 'pointer', padding: 6, visibility: pagina === 0 ? 'hidden' : 'visible' }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {paginas.map((_, i) => (
            <div key={i} onClick={() => irPara(i)}
              style={{ width: 7, height: 7, borderRadius: '50%', cursor: 'pointer', background: i === pagina ? '#a9812e' : '#e4ddd0' }} />
          ))}
        </div>
        <button onClick={() => irPara(pagina + 1)} aria-label="Próxima página"
          style={{ background: 'none', border: 'none', color: '#736b62', cursor: 'pointer', padding: 6, visibility: pagina === paginas.length - 1 ? 'hidden' : 'visible' }}>
          <ChevronRight size={22} />
        </button>
      </div>
      </div>
    </div>
  )
}
