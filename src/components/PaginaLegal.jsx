import { useTheme } from '../theme'
import SeletorTema from './SeletorTema'

export default function PaginaLegal({ documento, onFechar }) {
  const { theme } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: "Georgia, 'EB Garamond', serif" }}>
      <div style={{ background: '#5e0018', borderBottom: '2px solid #a9812e', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-temis-transparente.png" alt="Themis Jur" style={{ width: 32, height: 32, objectFit: 'contain', display: 'block' }}/>
          <div style={{ fontSize: 12, color: '#c9a878', fontStyle: 'italic' }}>Themis Jur</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <SeletorTema compact />
          {onFechar && (
            <button onClick={onFechar} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '6px 12px', color: '#e8dfc8', fontSize: 12, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif", cursor: 'pointer' }}>
              Voltar
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 6 }}>
          {documento.titulo}
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', marginBottom: 28 }}>
          {documento.atualizadoEm ? `Última atualização: ${documento.atualizadoEm}` : 'Documento em preparação — alguns campos ainda serão preenchidos'}
        </div>

        {documento.secoes.map((s, i) => (
          <div key={i} style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.gold, fontFamily: theme.fontTitle, marginBottom: 8 }}>
              {s.titulo}
            </div>
            {s.corpo.split('\n\n').map((par, pi) => (
              <div key={pi} style={{ fontSize: 14, color: theme.text, lineHeight: 1.8, marginBottom: 10 }}>
                {par}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
