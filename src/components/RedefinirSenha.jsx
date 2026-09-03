import { useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

// Exibida quando o link de "esqueci minha senha" traz o usuário de volta
// com uma sessão de recuperação (evento PASSWORD_RECOVERY do Supabase Auth).
// Sem essa tela, o app simplesmente logava a pessoa normalmente sem nunca
// pedir a nova senha — o link virava, na prática, um jeito de logar sem
// trocar nada.
export default function RedefinirSenha({ onConcluido }) {
  const { theme, mode } = useTheme()
  const [senha, setSenha]       = useState('')
  const [confirma, setConfirma] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (senha.length < 6) { setError('Mínimo de 6 caracteres.'); return }
    if (senha !== confirma) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setLoading(false)
    if (error) { setError(error.message); return }
    onConcluido()
  }

  const bgPage = theme.bg

  const inp = {
    width: '100%', background: theme.raised,
    border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '10px 14px',
    color: theme.text, fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: bgPage, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#800020',
            border: '3px solid #C5A059', boxShadow: '0 8px 32px rgba(128,0,32,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Lock size={24} color="#C5A059" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: theme.text, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
            Definir nova senha
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontFamily: 'Inter, sans-serif' }}>
            Escolha uma nova senha pra sua conta Themis Jur.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: 28, boxShadow: theme.shadow,
        }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Nova senha</div>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres" autoComplete="new-password" style={inp} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.muted, cursor: 'pointer' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Confirmar nova senha</div>
            <input type={showPass ? 'text' : 'password'} value={confirma} onChange={e => setConfirma(e.target.value)}
              placeholder="Repita a nova senha" autoComplete="new-password" style={inp} />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: theme.toastErr, color: theme.error, fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading || !senha || !confirma} style={{
            width: '100%', background: loading || !senha || !confirma ? theme.border : theme.gold,
            color: loading || !senha || !confirma ? theme.muted : (theme.isDark ? '#0f0a0b' : '#fff'),
            border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 13, fontWeight: 700,
            cursor: loading || !senha || !confirma ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <CheckCircle size={15} /> {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
