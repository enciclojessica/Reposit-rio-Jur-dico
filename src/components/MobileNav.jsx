import { VIEWS } from '../data/views'
import { Home, Sparkles, PenLine, Plus, MoreHorizontal } from 'lucide-react'

export default function MobileNav({
  theme, view, setView, maisAberto, setMaisAberto,
  isEditor, isAdmin, session, entradas, isOwner, exportarTesesPlanilha,
}) {
  // Itens fixos no mobile nav
  const navFixos = [
    { v: VIEWS.HOJE,   label: 'Início',   Icone: Home },
    { v: VIEWS.BUSCA,  label: 'Busca IA', Icone: Sparkles },
    { v: VIEWS.EDITOR, label: 'Editor',   Icone: PenLine },
    ...(isEditor ? [{ v: VIEWS.ADD, label: 'Nova', Icone: Plus }] : []),
  ]
  // Itens no menu "mais"
  const navMais = [
    { v: VIEWS.HOME,        label: 'Repositório' },
    { v: VIEWS.DASHBOARD,   label: 'Dashboard' },
    { v: VIEWS.LEG_VIEW,       label: 'Legislação' },
    { v: VIEWS.INDICE,         label: 'Índice remissivo' },
    { v: VIEWS.FAVORITOS,      label: 'Favoritos' },
    { v: VIEWS.COMPARAR,       label: 'Comparador de teses' },
    { v: VIEWS.JURISPRUDENCIA, label: 'Jurisprudência' },
    { v: VIEWS.ALERTAS,     label: 'Alertas' },
    ...(isEditor ? [{ v: VIEWS.IMPORTAR, label: 'Importar' }] : []),
    ...(isAdmin  ? [{ v: VIEWS.MEMBROS,  label: 'Membros' }]  : []),
    ...(session  ? [{ v: VIEWS.CONFIG,   label: 'Configurações' }] : []),
    ...(isOwner && entradas.length > 0 ? [{ v: 'exportar_teses', label: 'Exportar planilha', action: exportarTesesPlanilha }] : []),
  ]
  const maisAtivo = navMais.some(n => n.v === view)

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }}>
      {/* Drawer do menu "mais" */}
      {maisAberto && (
        <div
          onClick={() => setMaisAberto(false)}
          style={{ position: 'fixed', inset: 0, background: '#00000055', zIndex: 49 }}
        />
      )}
      {maisAberto && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0,
          background: theme.surface, borderTop: `1px solid ${theme.borderGold}`,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '12px 8px', gap: 4, zIndex: 51,
          boxShadow: '0 -8px 32px #00000033',
        }}>
          {navMais.map(item => (
            <button key={item.v}
              onClick={() => { if (item.action) { item.action(); setMaisAberto(false) } else { setView(item.v); setMaisAberto(false) } }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 4px', background: view === item.v ? theme.gold + '22' : 'none',
                border: `1px solid ${view === item.v ? theme.gold + '44' : 'transparent'}`,
                borderRadius: 8,
                color: view === item.v ? theme.gold : theme.muted,
                cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif", fontSize: 10,
              }}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Barra principal */}
      <div style={{
        background: theme.surface, borderTop: `1px solid ${theme.borderGold}`,
        display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {navFixos.map(item => (
          <button key={item.v}
            onClick={() => { setView(item.v); setMaisAberto(false) }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 4px', background: 'none', border: 'none',
              color: view === item.v ? theme.gold : theme.muted,
              cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif", fontSize: 10,
              borderTop: view === item.v ? `2px solid ${theme.gold}` : '2px solid transparent',
            }}>
            <item.Icone size={18} style={{ marginBottom: 2 }} />
            {item.label}
          </button>
        ))}
        {/* Botão "mais" */}
        <button
          onClick={() => setMaisAberto(m => !m)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 4px', background: 'none', border: 'none',
            color: maisAtivo ? theme.gold : theme.muted,
            cursor: 'pointer', fontFamily: "Georgia, 'EB Garamond', serif", fontSize: 10,
            borderTop: maisAtivo ? `2px solid ${theme.gold}` : '2px solid transparent',
          }}>
          <MoreHorizontal size={18} style={{ marginBottom: 2 }} />
          Mais
        </button>
      </div>
    </div>
  )
}
