import { VIEWS } from '../data/views'

// Rótulo discreto de seção — só pra agrupar visualmente os itens do menu,
// sem virar um item clicável nem ocupar destaque.
function SecaoLabel({ theme, children }) {
  return (
    <div style={{
      padding: '16px 20px 6px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: 1.2,
      color: theme.muted, opacity: 0.65, fontFamily: 'Inter, sans-serif',
    }}>
      {children}
    </div>
  )
}

function NavBtn({ theme, id, label, onClick, active, dot }) {
  return (
    <button data-tour={id} onClick={onClick} style={{
      width: '100%', background: active ? theme.gold + '12' : 'none',
      border: 'none', borderLeft: `3px solid ${active ? theme.gold : 'transparent'}`,
      padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', color: active ? theme.text : theme.muted,
      fontSize: 13, textAlign: 'left', transition: 'all .15s',
      fontFamily: 'Inter, sans-serif',
    }}>
      {label}
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.gold, flexShrink: 0 }} />}
    </button>
  )
}

// Sidebar desktop — estritamente navegação + bloco de assinatura,
// conforme especificação. Controles de sessão vivem no header (App.jsx).
export default function Sidebar({
  theme, view, setView, setAreaFilter, setTipoFilter,
  isAdmin, isEditor, setPrefillEntry, temNovidadeNaoVista,
}) {
  // Mesma lógica de compartilhar da Landing e do MobileNav — membro já
  // logado convidando outra pessoa.
  async function compartilhar() {
    const texto = 'Themis Jur: acervo curado de jurisprudência, doutrina e legislação.'
    const url = 'https://themisjur.com.br'
    if (navigator.share) {
      try { await navigator.share({ title: 'Themis Jur', text: texto, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(`${texto} ${url}`)
    }
  }

  return (
    <div className="no-print" style={{
      width: 220, background: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0,
    }}>
      {/* Logo Themis Jur — zona de identidade, vinho fixo independente do tema claro/escuro */}
      <div style={{ padding: '22px 20px 18px', background: '#5e0018', borderBottom: '2px solid #a9812e', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src="/logo-temis-transparente.png"
          alt="Themis Jur"
          onClick={() => setView(VIEWS.HOJE)}
          style={{ width: 46, height: 46, cursor: 'pointer', objectFit: 'contain', display: 'block', flexShrink: 0 }}
        />
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#f2e9d8', fontFamily: theme.fontTitle, lineHeight: 1.2 }}>
            Themis Jur
          </div>
          <div style={{ fontSize: 11, color: '#c9a878', fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 2 }}>
            Inteligência jurídica
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <NavBtn theme={theme} id="hoje" label="Início" onClick={() => setView(VIEWS.HOJE)} active={view === VIEWS.HOJE} />

        <SecaoLabel theme={theme}>Consultar</SecaoLabel>
        <NavBtn theme={theme} id="home" label="Acervo" onClick={() => { setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }} active={view === VIEWS.HOME || view === VIEWS.LEG_VIEW} />
        <NavBtn theme={theme} id="busca" label="Busca com IA" onClick={() => setView(VIEWS.BUSCA)} active={view === VIEWS.BUSCA} />
        <NavBtn theme={theme} id="juri" label="Pesquisa Externa" onClick={() => setView(VIEWS.JURISPRUDENCIA)} active={view === VIEWS.JURISPRUDENCIA} />
        <NavBtn theme={theme} id="indice" label="Índice remissivo" onClick={() => setView(VIEWS.INDICE)} active={view === VIEWS.INDICE} />

        <SecaoLabel theme={theme}>Trabalhar</SecaoLabel>
        <NavBtn theme={theme} id="editor" label="Editor de Peças" onClick={() => setView(VIEWS.EDITOR)} active={view === VIEWS.EDITOR} />
        <NavBtn theme={theme} id="comparar" label="Comparador" onClick={() => setView(VIEWS.COMPARAR)} active={view === VIEWS.COMPARAR} />
        <NavBtn theme={theme} id="favoritos" label="Favoritos" onClick={() => setView(VIEWS.FAVORITOS)} active={view === VIEWS.FAVORITOS} />

        <SecaoLabel theme={theme}>Acompanhar</SecaoLabel>
        <NavBtn theme={theme} id="alertas" label="Alertas" onClick={() => setView(VIEWS.ALERTAS)} active={view === VIEWS.ALERTAS} />
        <NavBtn theme={theme} id="dash" label="Dashboard" onClick={() => setView(VIEWS.DASHBOARD)} active={view === VIEWS.DASHBOARD} />

        {isAdmin && (
          <>
            <SecaoLabel theme={theme}>Administração</SecaoLabel>
            <NavBtn theme={theme} id="membros" label="Membros" onClick={() => setView(VIEWS.MEMBROS)} active={view === VIEWS.MEMBROS} />
            <NavBtn theme={theme} id="metricas" label="Métricas" onClick={() => setView(VIEWS.METRICAS)} active={view === VIEWS.METRICAS} />
          </>
        )}

        <SecaoLabel theme={theme}>Sistema</SecaoLabel>
        <NavBtn theme={theme} id="import" label="Importar" onClick={() => setView(VIEWS.IMPORTAR)} active={[VIEWS.IMPORTAR, VIEWS.LEGISLACAO, VIEWS.EXTRAIR].includes(view)} />
        <NavBtn theme={theme} id="config" label="Configurações" onClick={() => setView(VIEWS.CONFIG)} active={view === VIEWS.CONFIG} />
        <NavBtn theme={theme} id="novidades_app" label="O que há de novo" onClick={() => setView(VIEWS.NOVIDADES_APP)} active={view === VIEWS.NOVIDADES_APP} dot={temNovidadeNaoVista} />
        <NavBtn theme={theme} id="compartilhar" label="Compartilhar" onClick={compartilhar} active={false} />

        {isEditor && (
          <>
            <div style={{ margin: '8px 16px', borderTop: `1px solid ${theme.border}` }}/>
            <button onClick={() => { setPrefillEntry(null); setView(VIEWS.ADD) }} data-tour="add" style={{
              width: '100%', background: view === VIEWS.ADD ? theme.gold + '12' : 'none',
              border: 'none', borderLeft: `3px solid ${view === VIEWS.ADD ? theme.gold : 'transparent'}`,
              padding: '11px 20px', textAlign: 'left', cursor: 'pointer',
              color: view === VIEWS.ADD ? theme.gold : theme.gold, fontSize: 13,
              fontFamily: 'Inter, sans-serif', fontWeight: 600, transition: 'all .15s',
            }}>+ Nova Entrada</button>
          </>
        )}
      </div>


      {/* Footer — apenas o bloco de assinatura, conforme especificação */}
      <div style={{ padding: '14px 20px', borderTop: `1px solid ${theme.border}` }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 2 }}>Plataforma e curadoria</div>
          <div style={{ fontSize: 13, color: theme.goldDark, fontWeight: 600, fontFamily: theme.fontTitle }}>Farias Fusquiani</div>
        </div>
      </div>
    </div>
  )
}
