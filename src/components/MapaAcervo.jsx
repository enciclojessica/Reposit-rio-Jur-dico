import { useMemo, useState } from 'react'
import { useTheme } from '../theme'

const MAX_NOS = 24
const LARGURA = 720
const ALTURA = 520

// Simulação de força simples, sem dependência externa: repulsão entre
// todos os nós, atração ao longo das arestas (proporcional a quantas
// vezes duas tags aparecem juntas na mesma entrada), força de
// centralização. Roda um número fixo de iterações e renderiza estático —
// não precisa de animação contínua pra um mapa de leitura.
function simular(nos, arestas, iteracoes = 220) {
  const cx = LARGURA / 2, cy = ALTURA / 2
  for (let it = 0; it < iteracoes; it++) {
    const forcas = nos.map(() => ({ x: 0, y: 0 }))

    for (let i = 0; i < nos.length; i++) {
      for (let j = i + 1; j < nos.length; j++) {
        let dx = nos[i].x - nos[j].x, dy = nos[i].y - nos[j].y
        let d2 = dx * dx + dy * dy || 0.01
        const d = Math.sqrt(d2)
        const forca = 1800 / d2
        const fx = (dx / d) * forca, fy = (dy / d) * forca
        forcas[i].x += fx; forcas[i].y += fy
        forcas[j].x -= fx; forcas[j].y -= fy
      }
    }

    arestas.forEach(({ a, b, peso }) => {
      const i = nos.findIndex(n => n.id === a)
      const j = nos.findIndex(n => n.id === b)
      if (i < 0 || j < 0) return
      const dx = nos[j].x - nos[i].x, dy = nos[j].y - nos[i].y
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01
      const alvo = 110
      const forca = (d - alvo) * 0.02 * Math.min(peso, 4)
      const fx = (dx / d) * forca, fy = (dy / d) * forca
      forcas[i].x += fx; forcas[i].y += fy
      forcas[j].x -= fx; forcas[j].y -= fy
    })

    nos.forEach((n, i) => {
      forcas[i].x += (cx - n.x) * 0.01
      forcas[i].y += (cy - n.y) * 0.01
    })

    nos.forEach((n, i) => {
      n.x += Math.max(-8, Math.min(8, forcas[i].x))
      n.y += Math.max(-8, Math.min(8, forcas[i].y))
      n.x = Math.max(40, Math.min(LARGURA - 40, n.x))
      n.y = Math.max(40, Math.min(ALTURA - 40, n.y))
    })
  }
  return nos
}

export default function MapaAcervo({ entradas, onSelecionarTag }) {
  const { theme } = useTheme()
  const [hover, setHover] = useState(null)

  const { nos, arestas } = useMemo(() => {
    const contagem = {}
    const coocorrencia = {}
    entradas.forEach(e => {
      const tags = [...new Set(e.tags || [])]
      tags.forEach(t => { contagem[t] = (contagem[t] || 0) + 1 })
      for (let i = 0; i < tags.length; i++) {
        for (let j = i + 1; j < tags.length; j++) {
          const chave = [tags[i], tags[j]].sort().join('|')
          coocorrencia[chave] = (coocorrencia[chave] || 0) + 1
        }
      }
    })

    const topTags = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_NOS)
      .map(([tag]) => tag)
    const topSet = new Set(topTags)

    const anguloPasso = (2 * Math.PI) / Math.max(topTags.length, 1)
    const nosIniciais = topTags.map((tag, i) => ({
      id: tag, count: contagem[tag],
      x: LARGURA / 2 + Math.cos(i * anguloPasso) * 180,
      y: ALTURA / 2 + Math.sin(i * anguloPasso) * 180,
    }))

    const arestasFiltradas = Object.entries(coocorrencia)
      .map(([chave, peso]) => { const [a, b] = chave.split('|'); return { a, b, peso } })
      .filter(({ a, b }) => topSet.has(a) && topSet.has(b))

    const nosSimulados = simular(nosIniciais, arestasFiltradas)
    return { nos: nosSimulados, arestas: arestasFiltradas }
  }, [entradas])

  const maxCount = Math.max(1, ...nos.map(n => n.count))
  const raio = (n) => 6 + (n.count / maxCount) * 16

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>Mapa do acervo</div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: theme.fontSerif }}>
          Tags que aparecem juntas na mesma entrada ficam mais próximas. Tamanho do ponto é quantas entradas usam a tag. Toque numa tag pra ver as entradas.
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.raised }}>
        <svg width={LARGURA} height={ALTURA} viewBox={`0 0 ${LARGURA} ${ALTURA}`} style={{ display: 'block' }}>
          {arestas.map(({ a, b, peso }, i) => {
            const na = nos.find(n => n.id === a), nb = nos.find(n => n.id === b)
            if (!na || !nb) return null
            return (
              <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={theme.border} strokeWidth={Math.min(peso, 4)} opacity={0.5} />
            )
          })}
          {nos.map(n => (
            <g key={n.id} onClick={() => onSelecionarTag?.(n.id)}
              onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}>
              <circle cx={n.x} cy={n.y} r={raio(n)}
                fill={hover === n.id ? theme.gold : theme.gold + '33'}
                stroke={theme.gold} strokeWidth={1} />
              <text x={n.x} y={n.y - raio(n) - 6} textAnchor="middle"
                fontSize={hover === n.id ? 13 : 11}
                fontFamily="Georgia, 'EB Garamond', serif" fontStyle="italic"
                fill={hover === n.id ? theme.text : theme.muted}>
                #{n.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {nos.length === 0 && (
        <div style={{ color: theme.muted, fontSize: 13, fontStyle: 'italic', fontFamily: theme.fontSerif, marginTop: 20 }}>
          Nenhuma tag cadastrada ainda no acervo.
        </div>
      )}
    </div>
  )
}
