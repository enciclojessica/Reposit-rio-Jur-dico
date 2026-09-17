// Barra de abas compartilhada entre Repositório (teses/súmulas/jurisprudência/
// doutrina curadas) e Legislação (texto integral dos códigos). As duas telas
// continuam sendo o que já eram — essa barra só fica por cima das duas,
// deixando explícito que é "um lugar só" com duas visões, em vez de dois
// itens soltos e sem relação aparente no menu lateral.
export default function AcervoTabs({ theme, ativo, onMudar }) {
  const abas = [
    { id: 'repositorio', label: 'Teses e Súmulas', sub: 'Jurisprudência, doutrina, súmulas e leis comentadas' },
    { id: 'legislacao',  label: 'Legislação',       sub: 'Texto integral dos códigos, artigo por artigo' },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: `1px solid ${theme.border}` }}>
      {abas.map(a => (
        <button key={a.id} onClick={() => onMudar(a.id)} title={a.sub} style={{
          background: 'none', border: 'none',
          borderBottom: `2px solid ${ativo === a.id ? theme.gold : 'transparent'}`,
          padding: '8px 4px 10px', marginRight: 22,
          color: ativo === a.id ? theme.text : theme.muted,
          fontSize: 14, fontWeight: ativo === a.id ? 600 : 400,
          fontFamily: theme.fontTitle, cursor: 'pointer', transition: 'all .15s',
        }}>
          {a.label}
        </button>
      ))}
    </div>
  )
}
