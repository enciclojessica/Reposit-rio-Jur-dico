import { Lock } from 'lucide-react'
import { supabase } from '../supabase'
import SeletorTema from './SeletorTema'
import { ROLE_COR, ROLE_LABEL } from '../shared'
import { VIEWS } from '../data/views'

export default function MobileHeader({
  theme, role, session, setShowLogin,
  setAreaFilter, setTipoFilter, setView,
}) {
  return (
    <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.borderGold}`, padding: '10px 16px', paddingTop: 'calc(10px + env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#800020', border: '2px solid #C5A059',
          overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/logo-temis.png" alt="Themis Jur"
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => { setAreaFilter('all'); setTipoFilter('all'); setView(VIEWS.HOME) }}
            onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#C5A059;font-family:serif;font-weight:700;font-size:14px">FF</span>' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>Themis Jur</div>
          <div style={{ fontSize: 9, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'Inter, sans-serif' }}>Inteligência Jurídica</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {role && <span style={{ fontSize: 9, color: ROLE_COR[role], textTransform: 'uppercase', letterSpacing: 1 }}>{ROLE_LABEL[role]}</span>}
        <SeletorTema compact />
        {session
          ? <button onClick={() => supabase.auth.signOut()} style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>Sair</button>
          : <button onClick={() => setShowLogin(true)} style={{ background: theme.gold, border: 'none', borderRadius: 6, padding: '5px 14px', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 5 }}><Lock size={11} /> Acesso Interno</button>
        }
      </div>
    </div>
  )
}
