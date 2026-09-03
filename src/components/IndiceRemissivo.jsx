import { useMemo } from 'react'
import { useTheme } from '../theme'

// Índice remissivo: lista alfabética de todas as tags do repositório, tipo
// índice de fim de livro. Ajuda quem não sabe o termo exato de busca a
// navegar por assunto — pensado especialmente pra quem está começando a
// estudar e ainda não tem vocabulário jurídico consolidado.
export default function IndiceRemissivo({ entradas, onSelecionarTag }) {
  const { theme } = useTheme()

  const grupos = useMemo(() => {
    const contagem = {}
    for (const e of entradas) {
      for (const t of (e.tags || [])) {
        contagem[t] = (contagem[t] || 0) + 1
      }
    }
    const tags = Object.keys(contagem).sort((a, b) => a.localeCompare(b, 'pt-BR'))
    const mapa = new Map()
    for (const t of tags) {
      const letra = (t[0] || '#').toUpperCase()
      if (!mapa.has(letra)) mapa.set(letra, [])
      mapa.get(letra).push({ tag: t, count: contagem[t] })
    }
    return [...mapa.entries()]
  }, [entradas])

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>
          Índice remissivo
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
          Todas as tags do repositório, em ordem alfabética
        </div>
      </div>

      {grupos.length === 0 ? (
        <div style={{ color: theme.muted, fontSize: 13, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
          Nenhuma tag cadastrada ainda.
        </div>
      ) : (
        grupos.map(([letra, tags]) => (
          <div key={letra} style={{ marginBottom: 22 }}>
            <div style={{
              fontSize: 15, color: theme.gold, fontFamily: theme.fontTitle, fontWeight: 600,
              borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 10,
            }}>
              {letra}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 28, rowGap: 8 }}>
              {tags.map(({ tag, count }) => (
                <div key={tag}
                  onClick={() => onSelecionarTag(tag)}
                  style={{
                    fontSize: 14, color: theme.text, fontFamily: "Georgia, 'EB Garamond', serif",
                    cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 6,
                  }}>
                  <span>#{tag}</span>
                  <span style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic' }}>({count})</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
