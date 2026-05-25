import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // login | register
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setSuccess('Verifique seu e-mail para confirmar o cadastro.')
      }
    } catch (e) {
      setError('Erro inesperado. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: 16,
        padding: 32,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#c9a452',
            fontFamily: 'Playfair Display, serif',
            marginBottom: 4,
          }}>Repositório Jurídico</div>
          <div style={{ fontSize: 12, color: '#6b7fa3' }}>
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>E-mail</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Senha</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          {error && (
            <div style={{
              background: '#3b0f0f',
              border: '1px solid #f87171',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: '#f87171',
              marginBottom: 16,
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              background: '#0f2b1a',
              border: '1px solid #10b981',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: '#10b981',
              marginBottom: 16,
            }}>{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#1e2d45' : '#c9a452',
              color: loading ? '#6b7fa3' : '#0b0f1a',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'IBM Plex Mono, monospace',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
            }}
          >
            {loading ? '...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7fa3',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'IBM Plex Mono, monospace',
            }}
          >
            {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
