import { useState } from 'react'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

export default function Auth() {
  const { theme, mode, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [screen, setScreen] = useState('login') // login | register | forgot
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        else setSuccess('Link de redefinição enviado para ' + email + '. Verifique sua caixa de entrada.')
      }
    } catch { setError('Erro inesperado. Tente novamente.') }
    setLoading(false)
  }

  const titles = { login: 'Acesso', register: 'Cadastro', forgot: 'Redefinir Senha' }
  const btnLabels = { login: 'ENTRAR', register: 'CRIAR CONTA', forgot: 'ENVIAR LINK' }

  return (
    <div style={{
      minHeight: '100vh',
      background: mode === 'dark'
        ? 'linear-gradient(135deg, #060a12 0%, #0b0f1a 50%, #0f1525 100%)'
        : 'linear-gradient(135deg, #ebe7dd 0%, #f4f1ea 50%, #f9f7f3 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative',
    }}>
      {/* Theme toggle */}
      <button onClick={toggle} style={{
        position: 'fixed', top: 16, right: 16,
        background: theme.raised, border: `1px solid ${theme.border}`,
        borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
        color: theme.muted, fontSize: 18, lineHeight: 1,
      }}>
        {mode === 'dark' ? '☀️' : '🌙'}
      </button>

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Card */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.borderGold}`,
          borderRadius: 16, padding: '32px 32px 28px',
          boxShadow: theme.shadow,
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-block',
              background: theme.logoBg,
              borderRadius: 12,
              padding: '12px 20px 8px',
              boxShadow: '0 4px 20px #00000022',
              border: mode === 'light' ? `1px solid ${theme.border}` : 'none',
            }}>
              <img src="/logo.png" alt="Farias Fusquiani"
                style={{ height: 110, width: 'auto', display: 'block' }}/>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: theme.border }}/>
            <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 2 }}>
              {titles[screen]}
            </div>
            <div style={{ flex: 1, height: 1, background: theme.border }}/>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>E-mail</div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required autoComplete="email"
                style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }}
              />
            </div>

            {screen !== 'forgot' && (
              <div style={{ marginBottom: screen === 'login' ? 8 : 20 }}>
                <div style={{ fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Senha</div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required minLength={6}
                  autoComplete={screen === 'login' ? 'current-password' : 'new-password'}
                  style={{ background: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }}
                />
              </div>
            )}

            {/* Esqueci a senha — só no login */}
            {screen === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <button type="button"
                  onClick={() => { setScreen('forgot'); setError(''); setSuccess('') }}
                  style={{
                    background: 'none', border: 'none', color: theme.gold,
                    fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace',
                  }}>
                  Esqueci a senha
                </button>
              </div>
            )}

            {error && (
              <div style={{ background: mode === 'dark' ? '#3b0f0f' : '#fef2f2', border: `1px solid ${theme.error}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: theme.error, marginBottom: 14 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: mode === 'dark' ? '#0f2b1a' : '#f0fdf4', border: `1px solid ${theme.success}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: theme.success, marginBottom: 14 }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? theme.raised : `linear-gradient(135deg, ${theme.gold}, ${theme.goldDark})`,
              color: loading ? theme.muted : '#0b0f1a',
              border: 'none', borderRadius: 8, padding: '12px',
              fontSize: 14, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 14, letterSpacing: 1,
              boxShadow: loading ? 'none' : `0 4px 16px ${theme.gold}44`,
            }}>
              {loading ? '...' : btnLabels[screen]}
            </button>
          </form>

          {/* Links de navegação */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {screen !== 'login' && (
              <button onClick={() => { setScreen('login'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                Já tenho conta
              </button>
            )}
            {screen !== 'register' && (
              <button onClick={() => { setScreen('register'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: theme.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'IBM Plex Mono, monospace' }}>
                Criar conta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
