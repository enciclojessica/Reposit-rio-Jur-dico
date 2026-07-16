import { useState, useEffect, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react'
import { fmtTempo } from '../data/oabDashboardHelpers'

// ── Cronômetro ─────────────────────────────────────────────────────────────────
export default function Cronometro({ sessionId, onSalvar, theme }) {
  const [seg, setSeg]       = useState(0)
  const [rodando, setRodando] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (rodando) {
      ref.current = setInterval(() => setSeg(s => s + 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [rodando])

  function resetar() {
    setRodando(false)
    setSeg(0)
  }

  function salvar() {
    if (seg < 10) return
    onSalvar(seg)
    resetar()
  }

  const cor = rodando ? '#10b981' : theme.gold

  return (
    <div style={{ background: theme.raised, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Timer size={14} color={theme.gold} />
        <span style={{ fontSize: 11, color: theme.muted, fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: 1 }}>Cronômetro da sessão</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: 28, fontWeight: 700, color: cor,
          fontFamily: 'IBM Plex Mono, monospace', minWidth: 90,
          background: theme.bg || theme.raised, borderRadius: 8,
          padding: '6px 12px', border: '1px solid ' + theme.border,
          transition: 'color .3s',
        }}>
          {fmtTempo(seg)}
        </div>
        <button onClick={() => setRodando(r => !r)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: rodando ? (theme.isDark ? '#2a1800' : '#fef3c7') : theme.gold, color: rodando ? (theme.isDark ? '#f59e0b' : '#b45309') : '#0b0f1a', border: `1px solid ${rodando ? '#f59e0b' : 'transparent'}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          {rodando ? <Pause size={14} /> : <Play size={14} />}
          {rodando ? 'Pausar' : 'Iniciar'}
        </button>
        <button onClick={resetar} aria-label="Zerar cronômetro"
          style={{ background: 'none', border: `1px solid ${theme.border}`, color: theme.muted, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>
          <RotateCcw size={14} />
        </button>
        {seg >= 60 && (
          <button onClick={salvar}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.toastOk, border: `1px solid ${theme.success}`, color: theme.success, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            <CheckCircle size={13} /> Salvar tempo
          </button>
        )}
      </div>
      {seg > 0 && (
        <div style={{ fontSize: 11, color: theme.muted, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
          {rodando ? 'Cronômetro em execução...' : `Pausado em ${fmtTempo(seg)}`}
        </div>
      )}
    </div>
  )
}
