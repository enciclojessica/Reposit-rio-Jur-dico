import { useMemo, useState } from 'react'
import { useTheme } from '../theme'
import { classificarTagIndice } from '../utils/tagsVisiveis'

function agruparPorLetra(tags) {
  const mapa = new Map()
  for (const item of tags) {
    const letra = (item.tag[0] || '#').toUpperCase()
    if (!mapa.has(letra)) mapa.set(letra, [])
    mapa.get(letra).push(item)
  }
  return [...mapa.entries()]
}

function Secao({ titulo, grupos, onSelecionarTag, theme }) {
  if (grupos.length === 0) return null
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 13, color: theme.text, fontFamily: theme.fontTitle, fontWeight: 600, borderBottom: `1px solid ${theme.text}`, paddingBottom: 6, marginBottom: 14 }}>
        {titulo}
      </div>
      {grupos.map(([letra, tags]) => (
        <div key={letra} style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
          <div style={{ width: 18, flexShrink: 0, fontSize: 13, color: theme.gold, fontFamily: theme.fontTitle, fontWeight: 600, paddingTop: 1 }}>
            {letra}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {tags.map(({ tag, count }, i) => (
              <div key={tag} onClick={() => onSelecionarTag(tag)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10,
                  padding: '7px 0', cursor: 'pointer',
                  borderTop: i > 0 ? `0.5px solid ${theme.border}` : 'none',
                }}>
                <span style={{ fontSize: 14, color: theme.text, fontFamily: "Georgia, 'EB Garamond', serif" }}>#{tag}</span>
                <span style={{ fontSize: 11, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif", flexShrink: 0 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Índice remissivo: lista alfabética de todas as tags do repositório, tipo
// índice de fim de livro. Ajuda quem não sabe o termo exato de busca a
// navegar por assunto — pensado especialmente pra quem está começando a
// estudar e ainda não tem vocabulário jurídico consolidado.
export default function IndiceRemissivo({ entradas, onSelecionarTag }) {
  const { theme } = useTheme()
  const [busca, setBusca] = useState('')

  const { assuntos, legislacao, total } = useMemo(() => {
    const contagem = {}
    for (const e of entradas) {
      for (const t of (e.tags || [])) contagem[t] = (contagem[t] || 0) + 1
    }
    let tags = Object.keys(contagem)
      .filter(t => classificarTagIndice(t) !== 'oculta')
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    if (busca.trim()) {
      const q = busca.trim().toLowerCase()
      tags = tags.filter(t => t.toLowerCase().includes(q))
    }
    const itens = tags.map(tag => ({ tag, count: contagem[tag] }))
    return {
      assuntos: agruparPorLetra(itens.filter(i => classificarTagIndice(i.tag) === 'assunto')),
      legislacao: agruparPorLetra(itens.filter(i => classificarTagIndice(i.tag) === 'legislacao')),
      total: itens.length,
    }
  }, [entradas, busca])

  return (
    <div style={{ paddingBottom: 40, maxWidth: 560 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 19, fontWeight: 600, color: theme.text, fontFamily: theme.fontTitle, marginBottom: 4 }}>
          Índice remissivo
        </div>
        <div style={{ fontSize: 12, color: theme.muted, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
          Assuntos e legislação citada, separados, em ordem alfabética
        </div>
      </div>

      <input value={busca} onChange={e => setBusca(e.target.value)}
        placeholder="Filtrar por letra ou palavra…"
        style={{
          width: '100%', background: theme.raised, border: `1px solid ${theme.border}`,
          borderRadius: 8, padding: '9px 12px', color: theme.text, fontSize: 13,
          fontFamily: "Georgia, 'EB Garamond', serif", outline: 'none', marginBottom: 24, boxSizing: 'border-box',
        }} />

      {total === 0 ? (
        <div style={{ color: theme.muted, fontSize: 13, fontStyle: 'italic', fontFamily: "Georgia, 'EB Garamond', serif" }}>
          {busca.trim() ? 'Nenhuma tag encontrada.' : 'Nenhuma tag cadastrada ainda.'}
        </div>
      ) : (
        <>
          <Secao titulo="Assuntos" grupos={assuntos} onSelecionarTag={onSelecionarTag} theme={theme} />
          <Secao titulo="Legislação citada" grupos={legislacao} onSelecionarTag={onSelecionarTag} theme={theme} />
        </>
      )}
    </div>
  )
}
