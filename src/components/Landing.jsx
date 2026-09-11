import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { Share2, Check, ArrowRight } from 'lucide-react'

const VINHO = '#3d0012'
const VINHO_CLARO = '#7a1128'
const OURO = '#8f6d27'
const OURO_CLARO = '#e8c98a'
const MARFIM = '#fdfbf7'
const MARFIM_ESCURO = '#f6ede0'
const TINTA = '#2c241b'
const MUSGO = '#736b62'
const BORDA = '#e4ddd0'
const FONTE = "'Inter', -apple-system, sans-serif"

const NOME_TIPO = { 'jurisprudência': 'Jurisprudência', 'doutrina': 'Doutrina', 'súmula': 'Súmula', 'lei': 'Legislação' }
const NOME_CODIGO_LANDING = {
  cc: 'Código Civil', cpc: 'Código de Processo Civil', cpp: 'Código de Processo Penal',
  cdc: 'Código de Defesa do Consumidor', cf: 'Constituição Federal',
  ctb: 'Código de Trânsito Brasileiro', lei9099: 'Lei 9.099/1995 (Juizados Especiais)',
}

// Revela um bloco uma vez, quando entra na tela ao rolar — usado pra
// disparar a contagem dos números reais.
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

// Conta de 0 até o valor real quando o bloco fica visível — os números
// são reais (vêm do banco), a contagem só deixa isso visível.
function useContagem(alvo, ativo, duracaoMs = 1200) {
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

export default function Landing({ onEntrar }) {
  const { theme } = useTheme()

  const [numeros, setNumeros] = useState(null)
  const [copiado, setCopiado] = useState(false)

  async function compartilhar() {
    const texto = 'Themis Jur: acervo curado de jurisprudência, doutrina e legislação.'
    const url = 'https://themisjur.com.br'
    if (navigator.share) {
      try { await navigator.share({ title: 'Themis Jur', text: texto, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(`${texto} ${url}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }
  useEffect(() => {
    supabase.rpc('contar_acervo_publico').then(({ data }) => { if (data) setNumeros(data) })
  }, [])

  const [refStats, statsVisivel] = useRevelar()

  const [estreito, setEstreito] = useState(typeof window !== 'undefined' ? window.innerWidth <= 560 : false)
  useEffect(() => {
    function onResize() { setEstreito(window.innerWidth <= 560) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const botaoPrimario = {
    background: VINHO, border: 'none', color: MARFIM, fontSize: 14, fontWeight: 600,
    padding: '13px 26px', borderRadius: 8, cursor: 'pointer', fontFamily: FONTE,
    display: 'inline-flex', alignItems: 'center', gap: 8,
  }

  return (
    <div style={{ background: MARFIM, fontFamily: FONTE, minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: MARFIM + 'f5', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: estreito ? '14px 16px' : '16px 40px', paddingTop: `calc(${estreito ? 14 : 16}px + env(safe-area-inset-top))`, borderBottom: `1px solid ${BORDA}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: TINTA }}>Themis Jur</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: estreito ? 10 : 20 }}>
          {!estreito && (
            <>
              <button onClick={compartilhar} title="Compartilhar" style={{ background: 'none', border: 'none', color: MUSGO, fontSize: 13, cursor: 'pointer', fontFamily: FONTE, display: 'flex', alignItems: 'center', gap: 5 }}>
                {copiado ? <Check size={14} /> : <Share2 size={14} />}
                {copiado ? 'Copiado' : 'Compartilhar'}
              </button>
              <a href="/?vitrine=1" style={{ color: MUSGO, fontSize: 13, textDecoration: 'none' }}>Ver amostra</a>
              <button onClick={() => onEntrar('login')} style={{ background: 'none', border: 'none', color: TINTA, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: FONTE }}>
                Entrar
              </button>
            </>
          )}
          <button onClick={() => onEntrar('register')} style={{ ...botaoPrimario, padding: estreito ? '9px 16px' : '10px 20px', fontSize: 13 }}>
            {estreito ? 'Criar conta' : 'Criar conta gratuita'}
          </button>
        </div>
      </div>

      {/* Hero — vinho, logo grande centralizada, como era antes */}
      <div style={{ background: VINHO, padding: estreito ? '48px 20px 56px' : '80px 40px 88px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur"
            style={{ display: 'block', width: estreito ? 64 : 88, height: estreito ? 64 : 88, objectFit: 'contain', margin: '0 auto 16px', filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.35))' }} />
          <div style={{ fontSize: estreito ? 16 : 19, fontWeight: 700, color: OURO_CLARO, letterSpacing: 1, marginBottom: 28 }}>
            Themis Jur
          </div>
          <div style={{ fontSize: estreito ? 34 : 'clamp(38px, 5.5vw, 64px)', fontWeight: 800, lineHeight: 1.08, color: MARFIM, letterSpacing: -1.5, marginBottom: 24 }}>
            A tese certa, na hora da peça.
          </div>
          <div style={{ fontSize: estreito ? 15 : 18, color: OURO_CLARO, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Acervo curado de jurisprudência, doutrina e legislação, reunido por uma pessoa só, artigo por artigo, com fonte real e rastreável em cada entrada.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onEntrar('register')} style={{ background: OURO_CLARO, border: 'none', color: VINHO, fontSize: 14, fontWeight: 700, padding: '13px 26px', borderRadius: 8, cursor: 'pointer', fontFamily: FONTE, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Criar conta gratuita <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('numeros')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', border: `1px solid ${OURO_CLARO}66`, color: OURO_CLARO, fontSize: 14, fontWeight: 500, padding: '13px 26px', borderRadius: 8, cursor: 'pointer', fontFamily: FONTE }}>
              Conhecer o acervo
            </button>
          </div>
        </div>
      </div>

      {/* Números — cards horizontais, rótulo em cima, número grande embaixo */}
      <div id="numeros" style={{ padding: estreito ? '48px 20px 64px' : '64px 40px 96px', maxWidth: 1040, margin: '0 auto' }}>
        <div ref={refStats} style={{ display: 'grid', gridTemplateColumns: estreito ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 1, background: BORDA, border: `1px solid ${BORDA}`, borderRadius: 12, overflow: 'hidden' }}>
          {numeros && (
            <>
              <NumeroCard valor={numeros.total_entradas} ativo={statsVisivel} label="entradas curadas" />
              <NumeroCard valor={numeros.total_artigos_vigentes} ativo={statsVisivel} label="artigos de lei vigentes" />
              <NumeroCard valor={numeros.total_codigos} ativo={statsVisivel} label="códigos e diplomas legais" />
              <NumeroCard valor={100} sufixo="%" ativo={statsVisivel} label="fonte real e rastreável" />
            </>
          )}
        </div>
      </div>

      {/* O que tem de diferente — grade de 3 colunas, barra de cor + título + texto */}
      <div style={{ padding: estreito ? '0 20px 64px' : '0 40px 96px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ fontSize: estreito ? 24 : 32, fontWeight: 800, color: TINTA, marginBottom: 40, letterSpacing: -0.5 }}>
          O que tem de diferente
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: estreito ? '1fr' : 'repeat(3, 1fr)', gap: 40 }}>
          {[
            { titulo: 'Fundamento real', texto: 'Cada entrada reúne tese, fundamento legal e uma indicação de uso prático: não é ementa solta, é material pronto pra consulta em peça.' },
            { titulo: 'Curadoria de verdade', texto: 'Por enquanto, a curadoria é de uma pessoa só. Cada fonte passa por conferência antes de entrar no acervo.' },
            { titulo: 'Fontes cruzadas', texto: 'Legislação, jurisprudência e doutrina convivem no mesmo espaço, e uma remete à outra.' },
          ].map(item => (
            <div key={item.titulo}>
              <div style={{ width: 32, height: 3, background: VINHO, borderRadius: 2, marginBottom: 16 }} />
              <div style={{ fontSize: 17, fontWeight: 700, color: TINTA, marginBottom: 8 }}>{item.titulo}</div>
              <div style={{ fontSize: 14, color: MUSGO, lineHeight: 1.65 }}>{item.texto}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Para quem é — mesmo padrão de grade */}
      <div style={{ padding: estreito ? '0 20px 64px' : '0 40px 96px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ fontSize: estreito ? 24 : 32, fontWeight: 800, color: TINTA, marginBottom: 40, letterSpacing: -0.5 }}>
          Para quem é
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: estreito ? '1fr' : 'repeat(3, 1fr)', gap: 40 }}>
          {[
            { titulo: 'Quem estuda', texto: 'O acervo oferece fonte primária no lugar do resumo de resumo, desde o início dos estudos.' },
            { titulo: 'Quem advoga', texto: 'Citação pronta e tese comentada em meio à rotina, sem precisar reconstruir o raciocínio do zero.' },
            { titulo: 'Quem leciona', texto: 'O material já chega organizado por área e por tipo, pronto pra uso em sala.' },
          ].map(item => (
            <div key={item.titulo}>
              <div style={{ width: 32, height: 3, background: OURO, borderRadius: 2, marginBottom: 16 }} />
              <div style={{ fontSize: 17, fontWeight: 700, color: TINTA, marginBottom: 8 }}>{item.titulo}</div>
              <div style={{ fontSize: 14, color: MUSGO, lineHeight: 1.65 }}>{item.texto}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Citação */}
      <div style={{ padding: estreito ? '0 20px 64px' : '0 40px 96px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: MARFIM_ESCURO, borderRadius: 16, padding: estreito ? '32px 24px' : '48px', border: `1px solid ${BORDA}` }}>
          <div style={{ fontSize: estreito ? 17 : 20, lineHeight: 1.6, color: TINTA, marginBottom: 24 }}>
            "A curadoria começou por necessidade prática: reunir num só lugar o que antes ficava espalhado entre anotações e pastas soltas. O que era organização pessoal virou repositório."
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: TINTA }}>Jessica Farias Fusquiani</div>
          <div style={{ fontSize: 13, color: MUSGO }}>Idealizadora do Themis Jur</div>
        </div>
      </div>

      {/* Do que é feito o acervo — 3 listas lado a lado */}
      <div style={{ padding: estreito ? '0 20px 64px' : '0 40px 96px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ fontSize: estreito ? 24 : 32, fontWeight: 800, color: TINTA, marginBottom: 40, letterSpacing: -0.5 }}>
          Do que é feito o acervo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: estreito ? '1fr' : 'repeat(3, 1fr)', gap: 48 }}>
          <Ledger titulo="Por tipo de fonte" dados={numeros?.por_tipo} nomear={k => NOME_TIPO[k] || k} cor={VINHO_CLARO} />
          <Ledger titulo="Legislação vigente" dados={numeros?.por_codigo} nomear={k => NOME_CODIGO_LANDING[k] || k.toUpperCase()} cor="#2c4a6e" />
          <Ledger titulo="Por tribunal" dados={numeros?.por_tribunal} nomear={k => k} cor={OURO} />
        </div>
      </div>

      {/* Do acervo, agora — exemplos reais */}
      <div style={{ padding: estreito ? '0 20px 64px' : '0 40px 96px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ fontSize: estreito ? 24 : 32, fontWeight: 800, color: TINTA, marginBottom: 40, letterSpacing: -0.5 }}>
          Do acervo, agora
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: estreito ? '1fr' : 'repeat(2, 1fr)', gap: 20 }}>
          <div style={{ border: `1px solid ${BORDA}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 15, color: TINTA, lineHeight: 1.6 }}>
              <b>União estável.</b> Comunicabilidade do patrimônio formado durante a relação, ainda que a contribuição não tenha sido financeira.
            </div>
            <div style={{ fontSize: 12, color: MUSGO, marginTop: 10 }}>STJ, REsp 1.234.567/SP, Família</div>
          </div>
          <div style={{ border: `1px solid ${BORDA}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 15, color: TINTA, lineHeight: 1.6 }}>
              <b>Pronúncia.</b> Dúvida sobre legítima defesa não autoriza absolvição sumária; apreciação cabe ao Tribunal do Júri.
            </div>
            <div style={{ fontSize: 12, color: MUSGO, marginTop: 10 }}>STJ, AgRg no AREsp 872.992/PE, Penal</div>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div style={{ padding: estreito ? '0 20px 80px' : '0 40px 120px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: VINHO, borderRadius: 16, padding: estreito ? '40px 24px' : '56px', textAlign: 'center' }}>
          <div style={{ fontSize: estreito ? 22 : 28, fontWeight: 800, color: MARFIM, marginBottom: 12, letterSpacing: -0.5 }}>
            Acesso ao acervo completo, sem custo
          </div>
          <div style={{ fontSize: 14, color: OURO_CLARO, marginBottom: 28 }}>
            Busca com IA é recurso da versão paga.
          </div>
          <button onClick={() => onEntrar('register')} style={{ background: OURO_CLARO, border: 'none', color: VINHO, fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 8, cursor: 'pointer', fontFamily: FONTE }}>
            Criar conta gratuita
          </button>
        </div>
      </div>

      {/* Rodapé */}
      <div style={{ background: '#2a000d', padding: estreito ? '40px 20px 24px' : '56px 40px 28px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: MARFIM, marginBottom: 10 }}>Themis Jur</div>
              <div style={{ fontSize: 13, color: OURO_CLARO, lineHeight: 1.6, maxWidth: 220 }}>
                Acervo curado de jurisprudência, doutrina e legislação, por uma pessoa só.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: OURO_CLARO, letterSpacing: 1, marginBottom: 14, opacity: 0.7, textTransform: 'uppercase' }}>Produto</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => document.getElementById('numeros')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: '#e8dfd0', fontSize: 13, cursor: 'pointer', fontFamily: FONTE, textAlign: 'left', padding: 0 }}>O acervo em números</button>
                <a href="/?vitrine=1" style={{ color: '#e8dfd0', fontSize: 13, textDecoration: 'none' }}>Ver amostra</a>
                <button onClick={compartilhar} style={{ background: 'none', border: 'none', color: '#e8dfd0', fontSize: 13, cursor: 'pointer', fontFamily: FONTE, textAlign: 'left', padding: 0 }}>Compartilhar</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: OURO_CLARO, letterSpacing: 1, marginBottom: 14, opacity: 0.7, textTransform: 'uppercase' }}>Conta</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => onEntrar('login')} style={{ background: 'none', border: 'none', color: '#e8dfd0', fontSize: 13, cursor: 'pointer', fontFamily: FONTE, textAlign: 'left', padding: 0 }}>Entrar</button>
                <button onClick={() => onEntrar('register')} style={{ background: 'none', border: 'none', color: '#e8dfd0', fontSize: 13, cursor: 'pointer', fontFamily: FONTE, textAlign: 'left', padding: 0 }}>Criar conta gratuita</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: OURO_CLARO, letterSpacing: 1, marginBottom: 14, opacity: 0.7, textTransform: 'uppercase' }}>Contato</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="mailto:themisjur.ia@gmail.com" style={{ color: '#e8dfd0', fontSize: 13, textDecoration: 'none' }}>E-mail</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${OURO_CLARO}22`, paddingTop: 20, fontSize: 12, color: '#a89a88', lineHeight: 1.6 }}>
            O acervo e as sugestões de teses têm finalidade de apoio ao estudo e à pesquisa jurídica, e exigem conferência dos fatos, fundamentos e fontes pelo profissional antes do uso em peça. A responsabilidade pelo exercício profissional permanece do advogado, inclusive por atos praticados com dolo ou culpa, nos termos do art. 32 da Lei nº 8.906/94.
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: 24, fontSize: 11, color: '#a89a88' }}>
            <div>© 2026 Themis Jur. Feito no Brasil.</div>
            <div>
              <a href="/?pagina=termos" style={{ color: '#a89a88', textDecoration: 'underline' }}>Termos de uso</a>
              <span style={{ margin: '0 6px' }}>e</span>
              <a href="/?pagina=privacidade" style={{ color: '#a89a88', textDecoration: 'underline' }}>política de privacidade</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function NumeroCard({ valor, sufixo = '', ativo, label }) {
  const contado = useContagem(valor, ativo)
  return (
    <div style={{ background: MARFIM, padding: '28px 20px' }}>
      <div style={{ fontSize: 11, color: OURO, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: TINTA, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {contado.toLocaleString('pt-BR')}{sufixo}
      </div>
    </div>
  )
}

function Ledger({ titulo, dados, nomear, cor }) {
  if (!dados) return null
  const entradas = Object.entries(dados).sort((a, b) => b[1] - a[1])
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, color: TINTA, marginBottom: 16, borderBottom: `2px solid ${cor}`, paddingBottom: 8 }}>{titulo}</div>
      {entradas.map(([chave, valor]) => (
        <div key={chave} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${TINTA}14`, fontSize: 14 }}>
          <span style={{ color: MUSGO }}>{nomear(chave)}</span>
          <span style={{ color: cor, fontWeight: 700 }}>{valor.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  )
}
