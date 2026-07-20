import { VIEWS } from '../data/views'

// Sidebar desktop — estritamente navegação + bloco de assinatura,
// conforme especificação. Controles de sessão vivem no header (App.jsx).
export default function Sidebar({
  theme, view, setView, setAreaFilter, setTipoFilter,
  isAdmin, isEditor, setPrefillEntry,
}) {
  return (
    <div style={{
      width: 220, background: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', height: '100vh', flexShrink: 0,
    }}>
      {/* Logo Lexia — Têmis */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          border: '2px solid #C5A059',
          background: '#800020',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 12px #80002044',
          position: 'relative',
        }}>
          <img
            src="/logo-temis.png"
            alt="Lexia"
            onClick={() => { setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            style={{ width: '100%', height: '100%', cursor: 'pointer', objectFit: 'cover', display: 'block' }}
          />
          <span style={{
            display: 'none', position: 'absolute', inset: 0,
            alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontFamily: theme.fontTitle, fontWeight: 700, fontSize: 18,
          }}>FF</span>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, fontFamily: theme.fontTitle, lineHeight: 1.2 }}>
            Lex.IA
          </div>
          <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2.5, marginTop: 2 }}>
            Inteligência Jurídica
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {[
          { id: 'home',   label: 'Início',          action: () => { setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }, active: view === VIEWS.HOME },
          { id: 'editor', label: 'Editor de Peças', action: () => setView(VIEWS.EDITOR),    active: view === VIEWS.EDITOR },
          { id: 'leg',    label: 'Legislação',      action: () => setView(VIEWS.LEG_VIEW),  active: view === VIEWS.LEG_VIEW },
          { id: 'juri',   label: 'Jurisprudência',   action: () => setView(VIEWS.JURISPRUDENCIA), active: view === VIEWS.JURISPRUDENCIA },
          { id: 'alertas', label: 'Alertas',        action: () => setView(VIEWS.ALERTAS),   active: view === VIEWS.ALERTAS },
          { id: 'dash',   label: 'Dashboard',       action: () => setView(VIEWS.DASHBOARD), active: view === VIEWS.DASHBOARD },
          { id: 'import', label: 'Importar',        action: () => setView(VIEWS.IMPORTAR),  active: [VIEWS.IMPORTAR, VIEWS.LEGISLACAO, VIEWS.EXTRAIR].includes(view) },
          { id: 'oab',    label: 'Estudos OAB',      action: () => setView(VIEWS.OAB),       active: view === VIEWS.OAB },
          { id: 'config', label: 'Configurações',   action: () => setView(VIEWS.CONFIG),    active: view === VIEWS.CONFIG },
        ].map(n => (
          <button key={n.id} onClick={n.action} style={{
            width: '100%', background: n.active ? theme.gold + '12' : 'none',
            border: 'none', borderLeft: `3px solid ${n.active ? theme.gold : 'transparent'}`,
            padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', color: n.active ? theme.text : theme.muted,
            fontSize: 13, textAlign: 'left', transition: 'all .15s',
            fontFamily: 'Inter, sans-serif',
          }}>
            {n.label}
          </button>
        ))}

        {isAdmin && (
          <button onClick={() => setView(VIEWS.MEMBROS)} style={{
            width: '100%', background: view === VIEWS.MEMBROS ? theme.gold + '12' : 'none',
            border: 'none', borderLeft: `3px solid ${view === VIEWS.MEMBROS ? theme.gold : 'transparent'}`,
            padding: '11px 20px', textAlign: 'left', cursor: 'pointer',
            color: view === VIEWS.MEMBROS ? theme.text : theme.muted, fontSize: 13,
            fontFamily: 'Inter, sans-serif', transition: 'all .15s',
          }}>Membros</button>
        )}

        {isEditor && (
          <>
            <div style={{ margin: '8px 16px', borderTop: `1px solid ${theme.border}` }}/>
            <button onClick={() => { setPrefillEntry(null); setView(VIEWS.ADD) }} style={{
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
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>Plataforma e Curadoria</div>
          <div style={{ fontSize: 11, color: theme.goldDark, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3, fontFamily: theme.fontTitle }}>Farias Fusquiani</div>
        </div>
      </div>
    </div>
  )
}
