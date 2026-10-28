// Passos do tour de boas-vindas (TourGuiado). `alvo` é o valor de data-tour no Sidebar (desktop) ou no MobileNav (celular, com
// prefixo "m_"). Os textos descrevem só o que o app faz hoje: ao mudar uma tela, conferir o passo dela aqui. Sem travessão e sem
// falar em plano pago (os recursos de IA não estão disponíveis aos usuários).

export const PASSOS_DESKTOP = [
  { alvo: 'hoje', titulo: 'Início', texto: 'Sua tela de todo dia: continue de onde parou e veja as entradas mais recentes do acervo.' },
  {
    alvo: 'home',
    titulo: 'Acervo',
    texto:
      'Teses, súmulas, jurisprudência e doutrina curadas, e o texto integral da legislação na aba Legislação, com um cartão por artigo. Filtre por Área e Tipo. Em cada entrada, use "Minha Anotação" para registrar o que aprendeu. Nos artigos, o membro aprovado também lê o comentário didático e a aplicação prática.',
  },
  {
    alvo: 'busca',
    titulo: 'Busca com IA',
    texto: 'Sugere teses do acervo a partir da descrição da peça. Os recursos de IA não estão disponíveis aos usuários nesta plataforma.',
  },
  {
    alvo: 'juri',
    titulo: 'Pesquisa Externa',
    texto: 'Pesquisa de jurisprudência direto das fontes, fora do acervo. A pesquisa por IA não está disponível aos usuários.',
  },
  { alvo: 'indice', titulo: 'Índice remissivo', texto: 'Lista alfabética de todas as tags do repositório. Útil quando você ainda não sabe o termo exato para buscar.' },
  {
    alvo: 'editor',
    titulo: 'Editor de Peças',
    texto: 'Escreva a peça e insira citações do acervo direto no texto. Ao digitar o número de um artigo, o editor sugere o texto da lei. A sua OAB, cadastrada em Configurações, entra no documento exportado.',
  },
  { alvo: 'comparar', titulo: 'Comparador', texto: 'Escolha duas entradas do repositório para ver lado a lado.' },
  { alvo: 'favoritos', titulo: 'Favoritos', texto: 'Marque qualquer entrada com a estrela para achar rápido depois, sem precisar buscar de novo.' },
  {
    alvo: 'alertas',
    titulo: 'Alertas',
    texto: 'O Radar de Atualizações mostra, e envia por e-mail, as novidades do acervo e o que mudou na lei nos últimos 7 dias.',
  },
  { alvo: 'config', titulo: 'Configurações', texto: 'Seu perfil e o número da OAB, que entra nos documentos exportados pelo Editor.' },
  { alvo: 'add', titulo: 'Nova entrada', texto: 'Cadastre uma nova entrada no acervo, com teses e fundamentação legal.', apenasEditor: true },
]

export const PASSOS_MOBILE = [
  { alvo: 'm_hoje', titulo: 'Início', texto: 'Sua tela de todo dia: continue de onde parou e veja as entradas mais recentes do acervo.' },
  {
    alvo: 'm_busca',
    titulo: 'Busca IA',
    texto: 'Sugere teses do acervo a partir da descrição da peça. Os recursos de IA não estão disponíveis aos usuários nesta plataforma.',
  },
  { alvo: 'm_editor', titulo: 'Editor de Peças', texto: 'Escreva a peça e insira citações do acervo direto no texto.' },
  { alvo: 'm_add', titulo: 'Nova entrada', texto: 'Cadastre uma nova entrada no acervo, com teses e fundamentação legal.', apenasEditor: true },
  {
    alvo: 'm_mais',
    titulo: 'Mais',
    texto: 'Aqui ficam o Acervo (com a legislação e os comentários), o Dashboard, o índice remissivo, os favoritos, o comparador, os alertas e as configurações. O item "Conhecer o app" repete este roteiro.',
  },
]
