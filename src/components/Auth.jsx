import { useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import { Lock, Mail, Eye, EyeOff, Moon, Sun, AlertCircle, CheckCircle } from 'lucide-react'

export default function Auth() {
  const { theme, mode, toggle } = useTheme()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [screen, setScreen]     = useState('login') // login | register | forgot
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (screen === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
      } else if (screen === 'register') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setSuccess('Verifique seu e-mail para confirmar o cadastro.')
      } else if (screen === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        })
        if (error) setError(error.message)
        else setSuccess('Link enviado para ' + email + '. Verifique sua caixa de entrada.')
      }
    } catch { setError('Erro inesperado. Tente novamente.') }
    setLoading(false)
  }

  const bgPage = theme.bg

  const inp = {
    width: '100%', background: theme.raised,
    border: `1px solid ${theme.border}`,
    borderRadius: 8, padding: '10px 14px',
    color: theme.text, fontSize: 13,
    fontFamily: 'Inter, sans-serif',
    outline: 'none', transition: 'border-color .15s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      minHeight: '100vh', background: bgPage,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }}>
      {/* Toggle tema */}
      <button onClick={toggle} style={{
        position: 'fixed', top: 16, right: 16,
        background: theme.raised, border: `1px solid ${theme.border}`,
        borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
        color: theme.muted, display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontFamily: 'Inter, sans-serif',
      }}>
        {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        {mode === 'dark' ? 'Claro' : 'Escuro'}
      </button>

      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo Têmis + identidade */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur"
            style={{ width: 84, height: 84, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
          />
          <div style={{ fontSize: 22, fontWeight: 600, color: theme.text, fontFamily: 'Playfair Display, serif', lineHeight: 1.2, marginBottom: 4 }}>
            Themis Jur
          </div>
          <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
            Inteligência jurídica, por Farias Fusquiani
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: 16, padding: '28px 28px 24px',
          boxShadow: theme.shadow,
        }}>
          {/* Título da tela */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2.5, fontFamily: 'Inter, sans-serif' }}>
              {{ login: 'Acesso', register: 'Cadastro', forgot: 'Redefinir Senha' }[screen]}
            </div>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* E-mail */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>E-mail</div>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.muted }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com" required autoComplete="email"
                  style={{ ...inp, paddingLeft: 36 }} />
              </div>
            </div>

            {/* Senha */}
            {screen !== 'forgot' && (
              <div style={{ marginBottom: screen === 'login' ? 8 : 18 }}>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>Senha</div>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.muted }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    autoComplete={screen === 'login' ? 'current-password' : 'new-password'}
                    style={{ ...inp, paddingLeft: 36, paddingRight: 38 }} />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', padding: 2 }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Esqueci a senha */}
            {screen === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 18 }}>
                <button type="button" onClick={() => { setScreen('forgot'); setError(''); setSuccess('') }}
                  style={{ background: 'none', border: 'none', color: theme.gold, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Esqueci a senha
                </button>
              </div>
            )}

            {/* Mensagens */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: mode === 'dark' ? '#2a0f0f' : '#fff0f0', border: `1px solid ${theme.error}44`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: theme.error, marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: mode === 'dark' ? '#0a1a10' : '#f0fdf4', border: `1px solid ${theme.success}44`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: theme.success, marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>
                <CheckCircle size={14} /> {success}
              </div>
            )}

            {/* Botão principal */}
            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? theme.border : theme.gold,
              color: loading ? theme.muted : '#fff',
              border: 'none', borderRadius: 8, padding: '11px',
              fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16, letterSpacing: 0.5,
              boxShadow: loading ? 'none' : `0 4px 16px ${theme.gold}44`,
              transition: 'all .15s',
            }}>
              {loading ? '...' : { login: 'Entrar', register: 'Criar conta', forgot: 'Enviar link' }[screen]}
            </button>
          </form>

          {/* Links auxiliares */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {screen !== 'login' && (
              <button onClick={() => { setScreen('login'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Já tenho conta
              </button>
            )}
            {screen !== 'register' && (
              <button onClick={() => { setScreen('register'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Criar conta
              </button>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: theme.muted, fontFamily: 'Inter, sans-serif', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6 }}>
          Plataforma e Curadoria · Farias Fusquiani
        </div>
      </div>
    </div>
  )
}
