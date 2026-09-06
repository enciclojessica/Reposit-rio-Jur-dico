import { Lock } from 'lucide-react'
import { supabase } from '../supabase'
import SeletorTema from './SeletorTema'
import SinoNotificacoes from './SinoNotificacoes'
import { ROLE_LABEL } from '../shared'
import { VIEWS } from '../data/views'

export default function MobileHeader({
  theme, role, session, membro, setShowLogin,
  setAreaFilter, setTipoFilter, setView, entradas, setSelected,
}) {
  return (
    <div style={{ background: '#5e0018', borderBottom: '2px solid #a9812e', padding: '10px 16px', paddingTop: 'calc(10px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo-temis-transparente.png" alt="Themis Jur"
          style={{ width: 34, height: 34, objectFit: 'contain', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => { setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }}
        />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f2e9d8', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>Themis Jur</div>
          <div style={{ fontSize: 10, color: '#c9a878', fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>Inteligência jurídica</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {role && <span style={{ fontSize: 10, color: '#e8c98a', fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>{ROLE_LABEL[role]}</span>}
        <SeletorTema compact />
        {session && (
          <SinoNotificacoes session={session} corIcone="#e8dfc8"
            onNavegar={v => setView(VIEWS[v.toUpperCase()] || VIEWS.HOME)}
            onAbrirEntrada={id => { const e = entradas?.find(x => x.id === id); if (e) { setSelected?.(e); setView(VIEWS.DETAIL) } }}
          />
        )}
        {session && (
          membro?.avatar_url ? (
            <img src={membro.avatar_url} alt="avatar"
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #a9812e', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#a9812e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#5e0018', fontSize: 11, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>
                {(membro?.nome || session.user.email || 'JF').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )
        )}
        {session
          ? <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: '#e8dfc8', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Sair</button>
          : <button onClick={() => setShowLogin(true)} style={{ background: '#a9812e', border: 'none', borderRadius: 6, padding: '5px 14px', color: '#2c241b', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={11} /> Acesso interno</button>
        }
      </div>
    </div>
  )
}
