import { List, Star, Sparkles } from 'lucide-react'
import { useTheme } from '../theme'

const PASSOS = [
  {
    icon: List,
    titulo: 'Índice remissivo',
    texto: 'Lista alfabética de todas as tags do repositório. Útil quando você ainda não sabe o termo exato pra buscar.',
  },
  {
    icon: Star,
    titulo: 'Favoritos',
    texto: 'Marque qualquer entrada com a estrela pra achar rápido depois, sem precisar buscar de novo.',
  },
  {
    icon: Sparkles,
    titulo: 'Busca com IA',
    texto: 'Descreva a peça que está escrevendo e o sistema sugere teses do acervo que podem ajudar.',
  },
]

export default function TourBoasVindas({ onFechar }) {
  const { theme } = useTheme()

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000aa', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.borderGold}`, borderRadius: 12, padding: 26, maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: theme.gold, fontFamily: theme.fontTitle, marginBottom: 4 }}>
          Bem-vindo ao Themis Jur
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif, marginBottom: 20 }}>
          Três recursos que passam despercebidos, mas ajudam bastante
        </div>

        {PASSOS.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < PASSOS.length - 1 ? 18 : 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.gold + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <p.icon size={15} color={theme.gold} />
            </div>
            <div>
              <div style={{ fontSize: 14, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, marginBottom: 3 }}>{p.titulo}</div>
              <div style={{ fontSize: 13, color: theme.muted, fontFamily: theme.fontSerif, lineHeight: 1.5 }}>{p.texto}</div>
            </div>
          </div>
        ))}

        <button onClick={onFechar} style={{ width: '100%', marginTop: 24, background: theme.gold, border: 'none', borderRadius: 8, padding: '10px', color: '#2c241b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Entendi
        </button>
      </div>
    </div>
  )
}
