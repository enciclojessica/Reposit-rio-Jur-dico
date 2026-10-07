import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { Share2, Check, ArrowRight } from 'lucide-react'
import SeletorTema from './SeletorTema'
import AmostraAcervo from './AmostraAcervo'

const FAIXA = '#5e0018'
const FAIXA_BORDA = '#a9812e'
const FAIXA_TITULO = '#f2e9d8'
const FAIXA_SUB = '#c9a878'
const FONTE = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
const FONTE_TITULO = "'Playfair Display', Georgia, serif"
const FONTE_TEXTO = "Georgia, 'Times New Roman', serif"

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
  const [medio, setMedio] = useState(typeof window !== 'undefined' ? window.innerWidth <= 920 : false)
  useEffect(() => {
    function onResize() { setEstreito(window.innerWidth <= 560); setMedio(window.innerWidth <= 920) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const contorno = { width: 'min(1120px, 100% - 40px)', margin: '0 auto' }
  const secao = (alt) => ({
    padding: 'clamp(52px, 8vw, 88px) 0',
    background: alt ? theme.bgDeep : 'transparent',
    borderTop: alt ? `1px solid ${theme.border}` : 'none',
    borderBottom: alt ? `1px solid ${theme.border}` : 'none',
  })
  const botaoPrimario = {
    background: theme.gold, border: '1px solid transparent', color: '#fdfbf7', fontSize: 15, fontWeight: 600,
    padding: '13px 22px', borderRadius: 6, cursor: 'pointer', fontFamily: FONTE,
    display: 'inline-flex', alignItems: 'center', gap: 8, lineHeight: 1.2,
  }
  const botaoNeutro = {
    ...botaoPrimario, background: theme.bgDeep, color: theme.text, border: `1px solid ${theme.border}`,
  }
  const linkFaixa = { color: FAIXA_SUB, fontSize: 13, fontWeight: 500, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONTE, display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }

  return (
    <div style={{ background: theme.bg, color: theme.text, fontFamily: FONTE_TEXTO, fontSize: 17, lineHeight: 1.7, minHeight: '100vh' }}>

      {/* Faixa de navegação vinho */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: FAIXA, borderBottom: `2px solid ${FAIXA_BORDA}`, paddingTop: 'env(safe-area-inset-top)' }}>
        <div style={{ ...contorno, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 64 }}>
          <a href="#topo" aria-label="Themis Jur, início" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src="/logo-temis-transparente.png" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span>
              <span style={{ display: 'block', fontFamily: FONTE_TITULO, fontSize: 18, fontWeight: 600, lineHeight: 1.2, color: FAIXA_TITULO }}>Themis Jur</span>
              <span style={{ display: 'block', fontFamily: FONTE, fontSize: 11, fontStyle: 'italic', color: FAIXA_SUB }}>Inteligência jurídica</span>
            </span>
          </a>
          <nav aria-label="Seções da página" style={{ display: 'flex', alignItems: 'center', gap: estreito ? 10 : 22 }}>
            {!estreito && (
              <>
                <a href="#numeros" style={linkFaixa}>O acervo</a>
                <a href="#amostra" style={linkFaixa}>Amostra</a>
                <a href="#diferenciais" style={linkFaixa}>Diferenciais</a>
                <a href="/?vitrine=1" style={linkFaixa}>Ver amostra</a>
                <button type="button" onClick={compartilhar} style={linkFaixa}>
                  {copiado ? <Check size={14} strokeWidth={1.75} /> : <Share2 size={14} strokeWidth={1.75} />}
                  {copiado ? 'Copiado' : 'Compartilhar'}
                </button>
                <button type="button" onClick={() => onEntrar('login')} style={{ ...linkFaixa, color: FAIXA_TITULO }}>Entrar</button>
              </>
            )}
            <SeletorTema onDark />
            <button type="button" onClick={() => onEntrar('register')} style={{ ...botaoPrimario, padding: '9px 16px', fontSize: 13 }}>
              {estreito ? 'Criar conta' : 'Criar conta gratuita'}
            </button>
          </nav>
        </div>
      </header>

      <main id="topo">
        {/* Herói em duas colunas */}
        <div style={{ padding: 'clamp(48px, 8vw, 96px) 0 clamp(48px, 7vw, 88px)' }}>
          <div style={{ ...contorno, display: 'grid', gridTemplateColumns: medio ? '1fr' : '1.05fr 0.95fr', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center' }}>
            <div>
              <Rotulo theme={theme}>Repositório jurídico curado</Rotulo>
              <h1 style={{ margin: '18px 0 20px', fontFamily: FONTE_TITULO, fontSize: 'clamp(35px, 5.6vw, 59px)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.005em', color: theme.text }}>
                A tese certa, <em style={{ fontStyle: 'italic', fontWeight: 500, color: theme.vinho }}>na hora da peça.</em>
              </h1>
              <p style={{ margin: 0, maxWidth: 540, fontSize: 'clamp(17px, 2vw, 19px)', color: theme.textSub }}>
                Acervo curado de jurisprudência, doutrina e legislação, reunido por uma pessoa só, artigo por artigo, com fonte real e rastreável em cada entrada.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
                <button type="button" onClick={() => onEntrar('register')} style={botaoPrimario}>
                  Criar conta gratuita <ArrowRight size={16} strokeWidth={1.75} />
                </button>
                <button type="button" onClick={() => document.getElementById('numeros')?.scrollIntoView({ behavior: 'smooth' })} style={botaoNeutro}>
                  Conhecer o acervo
                </button>
              </div>
            </div>

            <div id="numeros" ref={refStats} style={{ scrollMarginTop: 80, background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: 2, width: 35, background: theme.gold, position: 'absolute', left: 24, top: 0 }} />
              <div style={{ padding: '22px 24px 8px', fontFamily: FONTE, fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.gold }}>O acervo, em números</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: theme.border, borderTop: `1px solid ${theme.border}`, minHeight: 120 }}>
                {numeros && (
                  <>
                    <NumeroCard theme={theme} valor={numeros.total_entradas} ativo={statsVisivel} label="entradas curadas" />
                    <NumeroCard theme={theme} valor={numeros.total_artigos_vigentes} ativo={statsVisivel} label="artigos de lei vigentes" />
                    <NumeroCard theme={theme} valor={numeros.total_codigos} ativo={statsVisivel} label="códigos e diplomas" />
                    <NumeroCard theme={theme} valor={100} sufixo="%" ativo={statsVisivel} label="fonte rastreável" />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Amostra real do acervo */}
        <div id="amostra" style={{ ...secao(true), scrollMarginTop: 72 }}>
          <div style={contorno}>
            <Cabecalho theme={theme} rotulo="Amostra" titulo="Veja o acervo por dentro" />
            <p style={{ margin: '-20px 0 28px', maxWidth: 640, color: theme.textSub }}>
              Três entradas reais do repositório, uma de cada tipo de fonte. Escolha a aba e veja como cada tese chega pronta para consulta, com o fundamento legal e a referência.
            </p>
            <div style={{ maxWidth: 820 }}>
              <AmostraAcervo theme={theme} onCadastrar={() => onEntrar('register')} />
            </div>
          </div>
        </div>

        {/* Diferenciais */}
        <div id="diferenciais" style={{ ...secao(false), scrollMarginTop: 72 }}>
          <div style={contorno}>
            <Cabecalho theme={theme} rotulo="Diferenciais" titulo="O que tem de diferente" />
            <GradeCartoes estreito={estreito} medio={medio} itens={[
              { titulo: 'Fundamento real', texto: 'Cada entrada reúne tese, fundamento legal e uma indicação de uso prático: não é ementa solta, é material pronto para consulta em peça.' },
              { titulo: 'Curadoria de verdade', texto: 'Por enquanto, a curadoria é de uma pessoa só. Cada fonte passa por conferência antes de entrar no acervo.' },
              { titulo: 'Fontes cruzadas', texto: 'Legislação, jurisprudência e doutrina convivem no mesmo espaço, e uma remete à outra.' },
            ]} theme={theme} />
          </div>
        </div>

        {/* Para quem é */}
        <div style={secao(true)}>
          <div style={contorno}>
            <Cabecalho theme={theme} rotulo="Público" titulo="Para quem é" />
            <GradeCartoes estreito={estreito} medio={medio} itens={[
              { titulo: 'Quem estuda', texto: 'O acervo oferece fonte primária no lugar do resumo de resumo, desde o início dos estudos.' },
              { titulo: 'Quem advoga', texto: 'Citação pronta e tese comentada em meio à rotina, sem precisar reconstruir o raciocínio do zero.' },
              { titulo: 'Quem leciona', texto: 'O material já chega organizado por área e por tipo, pronto para uso em sala.' },
            ]} theme={theme} />
          </div>
        </div>

        {/* Curadoria */}
        <div style={secao(false)}>
          <div style={{ ...contorno, maxWidth: 760 }}>
            <Rotulo theme={theme}>Curadoria</Rotulo>
            <blockquote style={{ margin: '18px 0 24px', fontFamily: FONTE_TITULO, fontSize: estreito ? 20 : 24, fontWeight: 500, lineHeight: 1.5, color: theme.text }}>
              &ldquo;O Themis Jur nasceu de uma necessidade concreta: organizar, num só lugar, o material que a rotina de estudo e prática forense exige consultar todos os dias. A curadoria de cada entrada segue o mesmo rigor que se espera de uma pesquisa jurídica bem feita.&rdquo;
            </blockquote>
            <div style={{ fontFamily: FONTE, fontSize: 14, fontWeight: 600, color: theme.text }}>Jessica Farias Fusquiani</div>
            <div style={{ fontFamily: FONTE, fontSize: 13, color: theme.muted }}>Idealizadora do Themis Jur</div>
          </div>
        </div>

        {/* Do que é feito o acervo */}
        <div style={secao(true)}>
          <div style={contorno}>
            <Cabecalho theme={theme} rotulo="Acervo" titulo="Do que é feito o acervo" />
            <div style={{ display: 'grid', gridTemplateColumns: medio ? '1fr' : 'repeat(3, 1fr)', gap: 40 }}>
              <Ledger theme={theme} titulo="Por tipo de fonte" dados={numeros?.por_tipo} nomear={k => NOME_TIPO[k] || k} cor={theme.vinho} />
              <Ledger theme={theme} titulo="Legislação vigente" dados={numeros?.por_codigo} nomear={k => NOME_CODIGO_LANDING[k] || k.toUpperCase()} cor={theme.civel} />
              <Ledger theme={theme} titulo="Por tribunal" dados={numeros?.por_tribunal} nomear={k => k} cor={theme.gold} />
            </div>
          </div>
        </div>

        {/* Chamada final */}
        <div style={secao(false)}>
          <div style={{ ...contorno, textAlign: 'center' }}>
            <Rotulo theme={theme}>Comece hoje</Rotulo>
            <h2 style={{ maxWidth: 560, margin: '16px auto', fontFamily: FONTE_TITULO, fontSize: 'clamp(29px, 4vw, 43px)', fontWeight: 600, lineHeight: 1.2, color: theme.text }}>
              Acesso ao acervo completo, sem custo
            </h2>
            <p style={{ maxWidth: 520, margin: '0 auto', color: theme.textSub }}>Busca com IA é recurso da versão paga.</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <button type="button" onClick={() => onEntrar('register')} style={botaoPrimario}>
                Criar conta gratuita <ArrowRight size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé vinho */}
      <footer style={{ padding: '38px 0 44px', background: FAIXA, borderTop: `2px solid ${FAIXA_BORDA}`, fontFamily: FONTE, fontSize: 13, color: FAIXA_SUB }}>
        <div style={{ ...contorno, display: 'grid', gridTemplateColumns: medio ? '1fr' : '1.2fr 1fr', gap: 22, alignItems: 'start' }}>
          <div>
            <span style={{ display: 'block', marginBottom: 3, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: FAIXA_BORDA }}>Plataforma e curadoria</span>
            <b style={{ display: 'block', fontFamily: FONTE_TITULO, fontSize: 18, fontWeight: 600, color: FAIXA_TITULO }}>Farias Fusquiani</b>
            <p style={{ margin: '14px 0 0', maxWidth: 560, lineHeight: 1.6 }}>
              O acervo e as sugestões de teses têm finalidade de apoio ao estudo e à pesquisa jurídica, e exigem conferência dos fatos, fundamentos e fontes pelo profissional antes do uso em peça. A responsabilidade pelo exercício profissional permanece do advogado, nos termos do art. 32 da Lei nº 8.906/94.
            </p>
          </div>
          <nav aria-label="Rodapé" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 22px', justifyContent: medio ? 'flex-start' : 'flex-end' }}>
            <a href="#numeros" style={linkRodape}>O acervo</a>
            <a href="/?vitrine=1" style={linkRodape}>Ver amostra</a>
            <button type="button" onClick={() => onEntrar('login')} style={{ ...linkRodape, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONTE, fontSize: 13 }}>Entrar</button>
            <a href="mailto:themisjur.ia@gmail.com" style={linkRodape}>Contato</a>
            <a href="/?pagina=termos" style={linkRodape}>Termos de uso</a>
            <a href="/?pagina=privacidade" style={linkRodape}>Privacidade</a>
          </nav>
        </div>
        <div style={{ ...contorno, marginTop: 22 }}>&copy; {new Date().getFullYear()} Farias Fusquiani. Todos os direitos reservados.</div>
      </footer>
    </div>
  )
}

const linkRodape = { color: FAIXA_SUB, textDecoration: 'none' }

function Rotulo({ theme, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: FONTE, fontSize: 12, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.gold }}>
      <span style={{ width: 32, height: 1, background: theme.gold }} />
      {children}
    </span>
  )
}

function Cabecalho({ theme, rotulo, titulo }) {
  return (
    <div style={{ maxWidth: 640, marginBottom: 'clamp(28px, 4vw, 44px)' }}>
      <Rotulo theme={theme}>{rotulo}</Rotulo>
      <h2 style={{ margin: '14px 0 0', fontFamily: FONTE_TITULO, fontSize: 'clamp(27px, 3.6vw, 40px)', fontWeight: 600, lineHeight: 1.2, color: theme.text }}>{titulo}</h2>
    </div>
  )
}

function GradeCartoes({ itens, theme, estreito, medio }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: estreito ? '1fr' : medio ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16 }}>
      {itens.map(item => (
        <article key={item.titulo} style={{ position: 'relative', padding: '26px 24px', background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: 10 }}>
          <div style={{ position: 'absolute', left: 24, top: 0, width: 35, height: 2, background: theme.gold }} />
          <h3 style={{ margin: '0 0 8px', fontFamily: FONTE_TITULO, fontSize: 20, fontWeight: 600, lineHeight: 1.25, color: theme.text }}>{item.titulo}</h3>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: theme.textSub }}>{item.texto}</p>
        </article>
      ))}
    </div>
  )
}

function NumeroCard({ theme, valor, sufixo = '', ativo, label }) {
  const contado = useContagem(valor, ativo)
  return (
    <div style={{ background: theme.cardBg, padding: '22px 24px' }}>
      <div style={{ fontFamily: FONTE, fontSize: 11, color: theme.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: FONTE_TITULO, fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 600, color: theme.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {contado.toLocaleString('pt-BR')}{sufixo}
      </div>
    </div>
  )
}

function Ledger({ theme, titulo, dados, nomear, cor }) {
  if (!dados) return null
  const entradas = Object.entries(dados).sort((a, b) => b[1] - a[1])
  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontFamily: FONTE_TITULO, fontWeight: 600, fontSize: 19, color: theme.text, borderBottom: `2px solid ${cor}`, paddingBottom: 8 }}>{titulo}</h3>
      {entradas.map(([chave, valor]) => (
        <div key={chave} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: `1px solid ${theme.border}`, fontFamily: FONTE, fontSize: 14 }}>
          <span style={{ color: theme.textSub }}>{nomear(chave)}</span>
          <span style={{ color: cor, fontWeight: 700 }}>{valor.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  )
}
