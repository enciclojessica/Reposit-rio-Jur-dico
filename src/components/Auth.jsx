import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setSuccess('Verifique seu e-mail para confirmar o cadastro.')
      }
    } catch { setError('Erro inesperado. Tente novamente.') }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060a12 0%, #0b0f1a 50%, #0f1525 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Decorative lines */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, #c9a45215 0%, transparent 70%)',
      }}/>

      <div style={{
        width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
      }}>
        {/* Logo card */}
        <div style={{
          background: '#111827',
          border: '1px solid #c9a45233',
          borderRadius: 16,
          padding: '32px 32px 28px',
          marginBottom: 0,
          boxShadow: '0 24px 64px #00000066, 0 0 0 1px #c9a45211',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-block',
              background: 'white',
              borderRadius: 12,
              padding: '12px 20px 8px',
              marginBottom: 0,
              boxShadow: '0 4px 20px #00000044',
            }}>
              <img
                src="/logo.png"
                alt="Farias Fusquiani"
                style={{ height: 120, width: 'auto', display: 'block' }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
          }}>
            <div style={{ flex: 1, height: 1, background: '#1e2d45' }}/>
            <div style={{ fontSize: 10, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 2 }}>
              {mode === 'login' ? 'Acesso' : 'Cadastro'}
            </div>
            <div style={{ flex: 1, height: 1, background: '#1e2d45' }}/>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>E-mail</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required autoComplete="email"/>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Senha</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6}/>
            </div>

            {error && (
              <div style={{ background:'#3b0f0f', border:'1px solid #f87171', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#f87171', marginBottom:14 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background:'#0f2b1a', border:'1px solid #10b981', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#10b981', marginBottom:14 }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? '#1e2d45' : 'linear-gradient(135deg, #c9a452, #a8832e)',
              color: loading ? '#6b7fa3' : '#0b0f1a',
              border: 'none', borderRadius: 8, padding: '12px',
              fontSize: 14, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 14,
              boxShadow: loading ? 'none' : '0 4px 16px #c9a45244',
              letterSpacing: 1,
            }}>
              {loading ? '...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              style={{ background:'none', border:'none', color:'#6b7fa3', fontSize:12, cursor:'pointer', fontFamily:'IBM Plex Mono, monospace', textDecoration:'underline' }}>
              {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
