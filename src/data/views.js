// Enum de views/rotas internas do App — extraído de App.jsx para poder
// ser importado por sub-componentes (ex: Sidebar) sem criar dependência
// circular com App.jsx.
export const VIEWS = {
  ALERTAS: 'alertas',
  HOJE: 'hoje',
  EDITOR:     'editor',
  DASHBOARD: 'dashboard',
  IMPORTAR:   'importar',
  LEGISLACAO:    'legislacao',
  LEG_VIEW:      'leg_view',
  EXTRAIR:       'extrair',
  HOME: 'home', ADD: 'add', EDIT: 'edit', DETAIL: 'detail',
  BUSCA: 'busca', MEMBROS: 'membros', JURISPRUDENCIA: 'jurisprudencia',
  CONFIG: 'config',
  INDICE: 'indice',
  FAVORITOS: 'favoritos',
  COMPARAR: 'comparar',
  METRICAS: 'metricas',
}
