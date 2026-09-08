import { useState, useEffect, useRef } from 'react'
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
    <div style={{ position: 'absolute', right: 24, top: 20, opacity: 0.55 }}>
      <IconeBalanca cor={cor} size={20} />
    </div>
  )
}

function RotuloComBarra({ texto, cor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 28, height: 2, background: cor }} />
      <div style={{ fontFamily: "Georgia, 'EB Garamond', serif", fontStyle: 'italic', fontSize: 13, color: cor, letterSpacing: 0.5 }}>{texto}</div>
    </div>
  )
}

// Revela a seção com fade+subida assim que ela entra na tela ao rolar —
// a mesma técnica de "scroll reveal" usada em landing pages modernas
// (ex: jusratio.com.br), via IntersectionObserver: dispara uma vez,
// não fica reanimando toda hora que a seção entra e sai da tela.
function useRevelar() {
  const ref = useRef(null)
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entrada]) => { if (entrada.isIntersecting) { setVisivel(true); obs.disconnect() } },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visivel]
}

function Secao({ children, style, id }) {
  const [ref, visivel] = useRevelar()
  return (
    <section ref={ref} id={id} style={{
      opacity: visivel ? 1 : 0,
      transform: visivel ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity .7s ease, transform .7s ease',
      ...style,
    }}>
      {children}
    </section>
  )
}

function ItemNumerado({ numero, texto, cor, corpoStyle }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: 16, borderRadius: 8, marginBottom: 14,
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover ? '0 10px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'transform .2s ease, box-shadow .2s ease',
      }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: cor, marginBottom: 6, lineHeight: 1 }}>{numero}</div>
      <div style={corpoStyle}>{texto}</div>
    </div>
  )
}

function BarraItem({ label, valor, max, cor }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: '#2c241b', fontFamily: 'Georgia, serif' }}>{label}</span>
        <span style={{ fontSize: 13, color: cor, fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>{valor.toLocaleString('pt-BR')}</span>
      </div>
      <div style={{ background: '#e4ddd0', borderRadius: 3, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(3, (valor / max) * 100)}%`, height: '100%', background: cor, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

const NOME_TIPO = { 'jurisprudência': 'Jurisprudência', 'doutrina': 'Doutrina', 'súmula': 'Súmula', 'lei': 'Legislação' }
const NOME_CODIGO_LANDING = {
  cc: 'Código Civil', cpc: 'Código de Processo Civil', cpp: 'Código de Processo Penal',
  cdc: 'Código de Defesa do Consumidor', cf: 'Constituição Federal',
  ctb: 'Código de Trânsito Brasileiro', lei9099: 'Lei 9.099/1995 (Juizados Especiais)',
}

export default function Landing({ onEntrar }) {
  const { theme } = useTheme()
  const corpo = { fontFamily: theme.fontSerif, fontSize: 15, color: '#3a3128', lineHeight: 1.7 }

  const [numeros, setNumeros] = useState(null)
  useEffect(() => {
    supabase.rpc('contar_acervo_publico').then(({ data }) => { if (data) setNumeros(data) })
  }, [])

  return (
    <div style={{ background: '#fdfbf7', fontFamily: theme.fontSerif }}>

      {/* Header fixo no topo, sempre visível durante a rolagem */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fdfbf7ee', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid #e4ddd0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ fontFamily: theme.fontTitle, fontSize: 14, color: '#2c241b' }}>Themis Jur</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SeletorTema compact />
          <button onClick={onEntrar} style={{ background: 'none', border: 'none', color: '#736b62', fontSize: 12, fontStyle: 'italic', cursor: 'pointer', fontFamily: theme.fontSerif }}>
            Já tenho acesso
          </button>
        </div>
      </div>

      {/* Hero */}
      <Secao style={{ background: '#3d0012', padding: '90px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -30, opacity: 0.15, animation: 'respirar 6s ease-in-out infinite' }}>
          <svg width="340" height="240" viewBox="0 0 260 180" aria-hidden="true">
            <line x1="130" y1="10" x2="130" y2="90" stroke="#e8c98a" strokeWidth="1.1" />
            <line x1="80" y1="30" x2="180" y2="30" stroke="#e8c98a" strokeWidth="1.1" />
            <path d="M64 30 A16 12 0 0 0 96 30" fill="none" stroke="#e8c98a" strokeWidth="0.8" />
            <path d="M164 30 A16 12 0 0 0 196 30" fill="none" stroke="#e8c98a" strokeWidth="0.8" />
            <line x1="105" y1="105" x2="155" y2="105" stroke="#e8c98a" strokeWidth="1.1" />
          </svg>
        </div>
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontStyle: 'italic', fontSize: 13, color: '#c9a878', marginBottom: 14 }}>
            Acervo curado de jurisprudência, doutrina e legislação
          </div>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 34, lineHeight: 1.3, color: '#f2e9d8', marginBottom: 28 }}>
            A tese certa, na hora da peça.
          </div>
          <button onClick={() => document.getElementById('porque')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'transparent', border: '1px solid #e8c98a', color: '#e8c98a', fontSize: 13, padding: '11px 26px', cursor: 'pointer', fontFamily: theme.fontSerif }}>
            Conhecer o acervo
          </button>
        </div>
      </Secao>

      {/* Por que existe */}
      <Secao id="porque" style={{ background: '#f6ede0', padding: '80px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, bottom: -80, opacity: 0.14, animation: 'respirar 6s ease-in-out infinite' }}>
          <svg width="280" height="280" viewBox="0 0 220 220" aria-hidden="true">
            <circle cx="110" cy="110" r="90" fill="none" stroke="#a9812e" strokeWidth="0.8" />
            <circle cx="110" cy="110" r="62" fill="none" stroke="#a9812e" strokeWidth="0.8" />
            <circle cx="110" cy="110" r="34" fill="none" stroke="#a9812e" strokeWidth="0.8" />
          </svg>
        </div>
        <MarcaCanto cor="#a9812e" />
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontFamily: theme.fontTitle, fontSize: 48, color: '#a9812e', lineHeight: 0.5, marginBottom: 14 }}>"</div>
          <div style={{ ...corpo, fontSize: 17, marginBottom: 22 }}>
            A curadoria começou por necessidade prática: reunir num só lugar o que antes ficava espalhado entre anotações e pastas soltas. O que era organização pessoal virou repositório.
          </div>
          <div style={{ fontFamily: theme.fontTitle, fontSize: 15, color: '#2c241b' }}>Jessica Farias Fusquiani</div>
          <div style={{ fontStyle: 'italic', fontSize: 13, color: '#736b62' }}>Idealizadora do Themis Jur</div>
        </div>
      </Secao>

      {/* O que tem de diferente */}
      <Secao style={{ background: '#fdfbf7', borderTop: '4px solid #a9812e', padding: '80px 28px', position: 'relative', overflow: 'hidden' }}>
        <MarcaCanto cor="#a9812e" />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 22, color: '#2c241b', marginBottom: 30 }}>O que tem de diferente</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <ItemNumerado numero="01" cor="#a9812e" corpoStyle={corpo}
              texto="Cada entrada reúne tese, fundamento e uma indicação de uso prático: não é ementa solta, é material pronto para consulta em peça." />
            <ItemNumerado numero="02" cor="#a9812e" corpoStyle={corpo}
              texto="Por enquanto, a curadoria é de uma pessoa só. Cada fonte passa por conferência antes de entrar no acervo." />
            <ItemNumerado numero="03" cor="#a9812e" corpoStyle={corpo}
              texto="Legislação, jurisprudência e doutrina convivem no mesmo espaço, e uma remete à outra." />
          </div>
        </div>
      </Secao>

      {/* Para quem é */}
      <Secao style={{ background: '#fdfbf7', borderTop: '4px solid #7a1128', padding: '80px 28px', position: 'relative', overflow: 'hidden' }}>
        <MarcaCanto cor="#7a1128" />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 22, color: '#2c241b', marginBottom: 30 }}>Para quem é</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <ItemNumerado numero="01" cor="#7a1128" corpoStyle={corpo}
              texto="Para quem inicia os estudos, o acervo oferece fonte primária no lugar do resumo de resumo." />
            <ItemNumerado numero="02" cor="#7a1128" corpoStyle={corpo}
              texto="Para quem já advoga, é citação pronta e tese comentada em meio à rotina." />
            <ItemNumerado numero="03" cor="#7a1128" corpoStyle={corpo}
              texto="Para quem leciona, o material já chega organizado por área e por tipo." />
          </div>
        </div>
      </Secao>

      {/* O acervo em números */}
      <Secao style={{ background: '#fdfbf7', borderTop: '4px solid #2c4a6e', padding: '80px 28px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <RotuloComBarra texto="o acervo em números" cor="#2c4a6e" />
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 22, color: '#2c241b', marginBottom: 30 }}>
            Curadoria real, não promessa vazia
          </div>
          {!numeros ? (
            <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic' }}>Carregando números do acervo…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 26 }}>
              <div><div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 42, color: '#7a1128', lineHeight: 1 }}>{numeros.total_entradas}</div><div style={{ fontSize: 13, color: '#3a3128', marginTop: 8 }}>entradas curadas</div></div>
              <div><div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 42, color: '#a9812e', lineHeight: 1 }}>{numeros.total_artigos_vigentes.toLocaleString('pt-BR')}</div><div style={{ fontSize: 13, color: '#3a3128', marginTop: 8 }}>artigos de lei vigentes</div></div>
              <div><div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 42, color: '#2c4a6e', lineHeight: 1 }}>{numeros.total_codigos}</div><div style={{ fontSize: 13, color: '#3a3128', marginTop: 8 }}>códigos e diplomas legais</div></div>
              <div><div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 42, color: '#3a3128', lineHeight: 1 }}>100%</div><div style={{ fontSize: 13, color: '#3a3128', marginTop: 8 }}>fonte real e rastreável</div></div>
            </div>
          )}
        </div>
      </Secao>

      {/* Composição por tipo + Legislação + Tribunais, lado a lado em tela larga */}
      <Secao style={{ background: '#f6ede0', padding: '80px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 48 }}>
          <div>
            <RotuloComBarra texto="composição do acervo" cor="#a9812e" />
            <div style={{ fontFamily: theme.fontTitle, fontWeight: 600, fontSize: 16, color: '#2c241b', marginBottom: 18 }}>Por tipo de fonte</div>
            {numeros && (() => {
              const max = Math.max(...Object.values(numeros.por_tipo))
              const cores = { 'jurisprudência': '#7a1128', 'doutrina': '#2c4a6e', 'súmula': '#a34a68', 'lei': '#a9812e' }
              return Object.entries(numeros.por_tipo).sort((a, b) => b[1] - a[1]).map(([tipo, v]) => (
                <BarraItem key={tipo} label={NOME_TIPO[tipo] || tipo} valor={v} max={max} cor={cores[tipo] || '#a9812e'} />
              ))
            })()}
          </div>
          <div>
            <RotuloComBarra texto="legislação vigente" cor="#2c4a6e" />
            <div style={{ fontFamily: theme.fontTitle, fontWeight: 600, fontSize: 16, color: '#2c241b', marginBottom: 18 }}>Por código</div>
            {numeros && (() => {
              const max = Math.max(...Object.values(numeros.por_codigo))
              return Object.entries(numeros.por_codigo).sort((a, b) => b[1] - a[1]).map(([codigo, v]) => (
                <BarraItem key={codigo} label={NOME_CODIGO_LANDING[codigo] || codigo.toUpperCase()} valor={v} max={max} cor="#2c4a6e" />
              ))
            })()}
          </div>
          <div>
            <RotuloComBarra texto="jurisprudência e súmula" cor="#7a1128" />
            <div style={{ fontFamily: theme.fontTitle, fontWeight: 600, fontSize: 16, color: '#2c241b', marginBottom: 18 }}>Por tribunal</div>
            {numeros && (() => {
              const max = Math.max(...Object.values(numeros.por_tribunal))
              return Object.entries(numeros.por_tribunal).sort((a, b) => b[1] - a[1]).map(([trib, v]) => (
                <BarraItem key={trib} label={trib} valor={v} max={max} cor="#7a1128" />
              ))
            })()}
          </div>
        </div>
      </Secao>

      {/* Do acervo, agora + CTA final */}
      <Secao style={{ background: '#fdfbf7', borderTop: '4px solid #2c4a6e', padding: '80px 28px 100px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 22, color: '#2c241b', marginBottom: 28 }}>Do acervo, agora</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 44 }}>
            <div style={{ borderTop: '2px solid #a34a68', paddingTop: 10 }}>
              <div style={{ ...corpo, fontSize: 14 }}><b>União estável.</b> Comunicabilidade do patrimônio formado durante a relação, ainda que a contribuição não tenha sido financeira.</div>
              <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', marginTop: 6 }}>STJ, REsp 1.234.567/SP, Família</div>
            </div>
            <div style={{ borderTop: '2px solid #7a1128', paddingTop: 10 }}>
              <div style={{ ...corpo, fontSize: 14 }}><b>Pronúncia.</b> Dúvida sobre legítima defesa não autoriza absolvição sumária; apreciação cabe ao Tribunal do Júri.</div>
              <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', marginTop: 6 }}>STJ, AgRg no AREsp 872.992/PE, Penal</div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={onEntrar} style={{ background: 'transparent', border: '1px solid #7a1128', color: '#7a1128', fontSize: 15, padding: '13px 40px', cursor: 'pointer', fontFamily: theme.fontSerif }}>
              Pedir acesso
            </button>
            <div style={{ fontSize: 12, color: '#736b62', fontStyle: 'italic', marginTop: 12 }}>
              Acesso por convite. Envie uma mensagem e a curadora entra em contato.
            </div>
          </div>
        </div>
      </Secao>

    </div>
  )
}
