import { useTheme } from './theme'

export const AREAS = {
  'Cível':           { color: '#2c4a6e' },
  'Penal':           { color: '#7a1128' },
  'Constitucional':  { color: '#6e5a2c' },
  'Trabalhista':     { color: '#8a5a2e' },
  'Tributário':      { color: '#2c6e5a' },
  'Administrativo':  { color: '#5a5a52' },
  'Consumidor':      { color: '#5a4a7a' },
  'Família':         { color: '#a34a68' },
  'Previdenciário':  { color: '#2c5a6e' },
  'Ambiental':       { color: '#3f6e3f' },
  'Internacional':   { color: '#3f4a7a' },
  'Digital':         { color: '#6e5a3f' },
}

export const TIPOS = ['jurisprudência', 'doutrina', 'súmula', 'lei']

// Resolve a cor de uma área mesmo quando o valor salvo é composto
// (ex: "Cível / Consumidor / Bancário", comum em entradas importadas de
// pesquisa de jurisprudência) — usa o primeiro segmento antes da barra
// como fallback, em vez de cair num cinza neutro sem contraste.
export function corDaArea(area, theme) {
  if (!area) return theme?.muted || '#6b7280'
  if (AREAS[area]) return AREAS[area].color
  const base = area.split('/')[0].trim()
  return AREAS[base]?.color || theme?.gold || '#c9a452'
}

// Ponto pequeno colorido por área — usado na lista em formato de ementário
// no lugar de badge/pílula. Ajuda no reconhecimento rápido sem virar
// decoração (importa especialmente para quem está começando a estudar
// e ainda não reconhece o assunto só pelo texto).
export function AreaDot({ area, theme, size = 7 }) {
  const cor = corDaArea(area, theme)
  return (
    <span
      title={area}
      style={{
        display: 'inline-block',
        width: size, height: size,
        borderRadius: '50%',
        background: cor,
        flexShrink: 0,
      }}
    />
  )
}
export const ROLE_COR   = { admin: '#a9812e', editor: '#2c4a6e', leitor: '#065f46' }
export const ROLE_LABEL = { admin: 'Admin', editor: 'Editor', leitor: 'Leitor' }

// Rótulos dos campos de tese variam por tipo de entrada — os mesmos 5
// campos do banco (tese_assunto, fundamentacao_legal, precedente_sumula,
// ratio_decidendi, aplicacao_pratica) significam coisas diferentes se a
// entrada é jurisprudência, doutrina, súmula ou lei. Confirmado com dados
// reais do repositório antes de definir os rótulos (não é suposição).
export const CAMPOS_TESE_POR_TIPO = {
  'jurisprudência': {
    tese_assunto:        'Tese ou assunto',
    fundamentacao_legal: 'Fundamentação legal',
    precedente_sumula:   'Precedente ou súmula',
    ratio_decidendi:     'Fundamento da decisão',
    aplicacao_pratica:   'Aplicação prática',
  },
  'doutrina': {
    tese_assunto:        'Conceito ou tese defendida',
    fundamentacao_legal: 'Dispositivo comentado',
    precedente_sumula:   'Referência bibliográfica',
    ratio_decidendi:     'Argumento do autor',
    aplicacao_pratica:   'Aplicação prática',
  },
  'súmula': {
    tese_assunto:        'Enunciado',
    fundamentacao_legal: 'Fundamentação legal',
    precedente_sumula:   'Número e tribunal',
    ratio_decidendi:     'Fundamento do enunciado',
    aplicacao_pratica:   'Aplicação prática',
  },
  'lei': {
    tese_assunto:        'Tese ou assunto',
    fundamentacao_legal: 'Fundamentação legal',
    precedente_sumula:   'Precedente ou súmula',
    ratio_decidendi:     'Fundamento jurídico',
    aplicacao_pratica:   'Aplicação prática',
  },
}

export function labelCampoTese(tipo, campo) {
  const porTipo = CAMPOS_TESE_POR_TIPO[tipo] || CAMPOS_TESE_POR_TIPO['jurisprudência']
  return porTipo[campo] || CAMPOS_TESE_POR_TIPO['jurisprudência'][campo]
}

export const emptyEntry = () => ({
  area: 'Cível',
  tema: '',
  tipo: 'jurisprudência',
  fonte: '',
  referencia: '',
  url: '',
  teses: [{
    tese_assunto: '',
    fundamentacao_legal: '',
    precedente_sumula: '',
    ratio_decidendi: '',
    aplicacao_pratica: '',
  }],
})

export function Badge({ label, color, small }) {
  return (
    <span style={{
      color,
      fontSize: small ? 11 : 12,
      fontFamily: "Georgia, 'EB Garamond', serif",
      fontStyle: 'italic',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

export function FieldLabel({ children }) {
  const { theme } = useTheme()
  return (
    <div style={{
      fontSize: 12,
      color: theme.gold,
      fontFamily: "Georgia, 'EB Garamond', serif",
      fontStyle: 'italic',
      marginBottom: 6,
      marginTop: 14,
    }}>{children}</div>
  )
}

export function SectionLabel({ children }) {
  const { theme } = useTheme()
  return (
    <div style={{
      fontSize: 13,
      color: theme.text,
      fontFamily: theme.fontTitle,
      fontWeight: 600,
      borderBottom: `1px solid ${theme.text}`,
      paddingBottom: 6,
      marginBottom: 14,
    }}>{children}</div>
  )
}

export function BtnGold({ onClick, children, disabled, style = {} }) {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? theme.border : theme.gold,
        color: disabled ? theme.muted : '#fdfbf7',
        border: 'none',
        borderRadius: 6,
        padding: '10px 20px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >{children}</button>
  )
}

export function BtnMuted({ onClick, children, style = {} }) {
  const { theme } = useTheme()
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        color: theme.textSub,
        border: `1px solid ${theme.border}`,
        borderRadius: 6,
        padding: '10px 16px',
        fontSize: 13,
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: 'pointer',
        ...style,
      }}
    >{children}</button>
  )
}


// ── Status de teses ───────────────────────────────────────────────────────
export const STATUS_META = {
  vigente:     { label: 'Vigente',     cor: '#065f46' },
  vinculante:  { label: 'Vinculante',  cor: '#a9812e' },
  em_revisao:  { label: 'Em revisão',  cor: '#8a5a2e' },
  superada:    { label: 'Superada',    cor: '#7a1128' },
}

export function StatusBadge({ status, onClick, pequena }) {
  const s = STATUS_META[status] || STATUS_META['vigente']
  return (
    <span
      onClick={onClick}
      title={onClick ? 'Clique para alterar o status' : s.label}
      style={{
        display: 'inline-flex', alignItems: 'center',
        color: s.cor,
        border: `1px solid ${s.cor}55`,
        borderRadius: 20, padding: pequena ? '1px 9px' : '3px 11px',
        fontSize: pequena ? 11 : 12,
        fontFamily: "Georgia, 'EB Garamond', serif",
        fontStyle: 'italic',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none', whiteSpace: 'nowrap',
      }}>
      {s.label}
    </span>
  )
}
