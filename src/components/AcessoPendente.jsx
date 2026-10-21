import { useState } from 'react'
import { Clock, Lock } from 'lucide-react'
import { useTheme } from '../theme'

// Tela para quem está logado mas ainda não foi aprovado (ou não tem registro de membro).
// A aprovação é da administradora, ou automática se o e-mail confirmado estiver em um domínio aprovado.
export default function AcessoPendente({ email, temRegistro, onVerificar, onSair }) {
  const { theme } = useTheme()
  const [verificando, setVerificando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function verificar() {
    setVerificando(true)
    setMensagem('')
    const liberado = await onVerificar()
    setVerificando(false)
    if (!liberado) setMensagem('Ainda não aprovado. Se você usa e-mail institucional, confirme o e-mail pelo link que recebeu e tente de novo.')
  }

  const Icone = temRegistro ? Clock : Lock
  const botao = {
    borderRadius: 6, padding: '10px 18px', fontSize: 13, lineHeight: 1.2, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: theme.bg, padding: '24px 16px', boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: 440, width: '100%', background: theme.cardBg, border: `1px solid ${theme.border}`,
        borderRadius: 12, padding: 28, textAlign: 'center', boxSizing: 'border-box',
      }}>
        <Icone size={26} color={theme.gold} style={{ marginBottom: 14 }} />
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: theme.text, marginBottom: 10 }}>
          {temRegistro ? 'Cadastro recebido' : 'Acesso somente por convite'}
        </div>
        <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
          {temRegistro
            ? 'Seu cadastro aguarda aprovação da curadoria. Com e-mail institucional confirmado, a liberação é automática.'
            : 'Esta plataforma é de acesso fechado. Peça um link de convite à curadoria para entrar.'}
        </div>
        {email && (
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 12, fontFamily: "'IBM Plex Mono', monospace" }}>{email}</div>
        )}
        {mensagem && (
          <div style={{ fontSize: 12, color: theme.error, marginTop: 14, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{mensagem}</div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
          {temRegistro && (
            <button onClick={verificar} disabled={verificando} style={{
              ...botao, background: verificando ? theme.border : theme.gold,
              color: verificando ? theme.muted : '#fdfbf7', border: 'none',
              cursor: verificando ? 'not-allowed' : 'pointer',
            }}>{verificando ? 'Verificando…' : 'Verificar novamente'}</button>
          )}
          <button onClick={onSair} style={{
            ...botao, background: theme.btnMutedBg, color: theme.text, border: `1px solid ${theme.border}`,
          }}>Sair</button>
        </div>
      </div>
      <div style={{ marginTop: 22, textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: 11, color: theme.muted }}>Plataforma e Curadoria, Farias Fusquiani</div>
        <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>Desenvolvido por Jessica Farias Fusquiani</div>
      </div>
    </div>
  )
}
