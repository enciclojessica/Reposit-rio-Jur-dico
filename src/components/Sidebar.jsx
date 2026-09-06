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
        {[
          { id: 'hoje',   label: 'Início',          action: () => setView(VIEWS.HOJE), active: view === VIEWS.HOJE },
          { id: 'home',   label: 'Repositório',     action: () => { setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }, active: view === VIEWS.HOME },
          { id: 'editor', label: 'Editor de Peças', action: () => setView(VIEWS.EDITOR),    active: view === VIEWS.EDITOR },
          { id: 'leg',    label: 'Legislação',      action: () => setView(VIEWS.LEG_VIEW),  active: view === VIEWS.LEG_VIEW },
          { id: 'indice', label: 'Índice remissivo', action: () => setView(VIEWS.INDICE),    active: view === VIEWS.INDICE },
          { id: 'favoritos', label: 'Favoritos',     action: () => setView(VIEWS.FAVORITOS), active: view === VIEWS.FAVORITOS },
          { id: 'comparar', label: 'Comparador',     action: () => setView(VIEWS.COMPARAR),  active: view === VIEWS.COMPARAR },
          { id: 'juri',   label: 'Jurisprudência',   action: () => setView(VIEWS.JURISPRUDENCIA), active: view === VIEWS.JURISPRUDENCIA },
          { id: 'alertas', label: 'Alertas',        action: () => setView(VIEWS.ALERTAS),   active: view === VIEWS.ALERTAS },
          { id: 'dash',   label: 'Dashboard',       action: () => setView(VIEWS.DASHBOARD), active: view === VIEWS.DASHBOARD },
          { id: 'import', label: 'Importar',        action: () => setView(VIEWS.IMPORTAR),  active: [VIEWS.IMPORTAR, VIEWS.LEGISLACAO, VIEWS.EXTRAIR].includes(view) },
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
          <div style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 2 }}>Plataforma e curadoria</div>
          <div style={{ fontSize: 13, color: theme.goldDark, fontWeight: 600, fontFamily: theme.fontTitle }}>Farias Fusquiani</div>
        </div>
      </div>
    </div>
  )
}
