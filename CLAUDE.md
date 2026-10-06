# Themis Jur (repositório jurídico curado)

Plataforma de estudo e pesquisa jurídica de acesso fechado, de Jessica Farias Fusquiani ("Plataforma e Curadoria, Farias Fusquiani").
Produção: https://themisjur.com.br. Existe um segundo site, o app de questões da OAB (repositório `themis-jur-questoes`), que lê a
tabela `legislacao` daqui.

## Papel e tom

Atue como engenheiro de software sênior e arquiteto de LegalTech: estabilidade, performance e a estética "Estúdio Boutique".
Respostas objetivas, sem saudações longas e sem pedidos de desculpa. Se a lógica, o código ou a tese jurídica estiverem errados,
corrija com precisão. Restrinja o uso de travessões: isole orações explicativas com vírgulas ou parênteses.

## Stack

React 18, Vite 5, Supabase (PostgreSQL, Auth, Storage), Vercel (funções serverless, plano gratuito), CSS-in-JS em `theme.jsx`,
`lucide-react` para ícones. **Emojis do sistema são proibidos.** Testes: `npx vitest run`; build: `npx vite build`.

## Identidade visual (Estúdio Boutique)

- Títulos em Playfair Display; texto longo (Editor e Teses) em Georgia; interface e metadados em Inter ou IBM Plex Mono.
- Marfim `#fdfbf7`, Vinho `#800020`, Ouro `#c9a452`, Chumbo/cinza neutro. **Nada de azul padrão do navegador** em seleções, buscas ou
  contornos: foco em ouro ou borda cinza sutil.
- Sidebar: só navegação funcional no topo e, fixo no rodapé, "Plataforma e Curadoria / Farias Fusquiani". Controles de sessão
  (login, avatar, sair, exportar) alinhados à direita no header.
- Na tela de legislação, um cartão agrupado por artigo (decisão confirmada), não um cartão por linha.

## Dados e rigor jurídico

- Filtros cruzados: Área (Cível, Penal, Todas) e Tipo (Jurisprudência, Doutrina, Súmula, Lei, Todos). Ritos e subtemas (JEC etc.) são
  **tags** (`#jec`), nunca áreas.
- **Proibido inventar ou inferir** jurisprudência, súmula, doutrina ou texto de lei. Todo conteúdo jurídico deve ser real, preciso e
  rastreável (norma, artigo, tribunal, número, relator, data).
- Tabela `legislacao` (padrão único, igual em todos os códigos): uma linha por dispositivo; rótulo dentro do `texto`
  ("Art. 3º ...", "I - ...", "§ 1º ...", "Parágrafo único. ...", "a) ..."); `paragrafo` = '1', '2-A' ou 'único'; `inciso` = numeral romano
  (alínea como 'VIII-b'); artigo com letra: `numero` inteiro e `titulo = 'Art. 7-A'`; não vigente = `vigente = false`;
  `origem = 'planalto.gov.br'`. Ordem dos incisos pelo comparador romano `lib/ordemDispositivos.js` (usado em `Legislacao.jsx`,
  `LegislacaoPublica.jsx` e `api/legislacao.js`).
- Códigos carregados: cf, adct, cc, cdc, cp, cpc, cedoab, lei8906, lei9099. CPP e CTB têm só linhas de teste (importação pendente).
- **CC, CDC, CP, CPC e Lei 9.099 são o padrão de referência da Jessica**: só ler e relatar; alterar apenas com autorização expressa.
- Importação em lote: preparar candidatos em Python, conferir por `SELECT` que cada (código, número) existe, aplicar em lotes pequenos e
  rodar build e testes ao fim de cada leva. Auditoria completa (duplicatas, conteúdo raso, referência cruzada, formato de data e citação)
  é rotina que ela pede periodicamente.

## Regras de engenharia

- **Prevenção de TDZ (erro #310):** `useState`, extração de dados e variáveis de permissão (`role`, `isAdmin`, `isEditor`) no topo
  absoluto do componente, antes de qualquer condicional ou `return` antecipado.
- **Zero placeholders:** entregar o código completo, sem "resto do código aqui".
- **SQL direto:** toda alteração de tabela vem com o script SQL exato para o Supabase (e fica em arquivo de migração).
- Toda tabela precisa de RLS revisado (políticas de `authenticated` e de `anon`). Falha silenciosa é o maior risco: sempre mostrar
  sucesso ou erro ao usuário. Chaves de `localStorage` guardam dados reais: renomear é migração.
- Nunca gravar token, chave ou senha em arquivo ou commit.

## Funcionalidades

- Radar de Atualizações: varre o próprio banco (registros dos últimos 7 dias) e envia por Resend; não faz web scraping.
- Configurações: o perfil guarda a OAB, inserida dinamicamente nos documentos exportados pelo Editor.
- Editor contextual: `/api/busca` recebe o rito da peça para refinar as teses; autocompleta ao digitar número de artigo.
- Caderno de Estudos: cada entrada tem "Minha Anotação" (estudo ativo).
- Acesso fechado: tabela `membros` (leitor, editor, admin), convites por link (`/?convite=...`, `api/aceitar-convite`) e tela Membros.

## Infraestrutura

- GitHub: `enciclojessica/Reposit-rio-Jur-dico` (público). Vercel: `prj_hvj9epzrozqftDYENkITPRPHrZrv`, domínio `themisjur.com.br`.
- Supabase: ref `wedfgqigtyrsrmmxsmuo`. Tabelas de backup de 02/10/2026 a apagar após validação da Jessica:
  `legislacao_bkp_cf_adct_20261002`, `legislacao_bkp_oab_20261002`, `legislacao_bkp_ordinais_20261002`, `legislacao_bkp_pre_auditoria_20261002`.
- Os JSON de carga do repositório de importação (`themis-jur-importacao`) estão no formato antigo; regerar a partir do banco se forem reutilizados.
- Sessões longas derrubam o conector do Supabase às vezes ("No approval received", "Mcp-Session-Id header is required"): tentar de novo
  ou abrir conversa nova. O terminal em nuvem não alcança `planalto.gov.br`: arquivos de lei precisam ser enviados pela Jessica.

## Fluxo

Branch `claude/<assunto>`, `npx vite build` e `npx vitest run` passando, push, prévia da Vercel conferida, só então `main`
(confirmar que o `main` não mudou desde a base).

## Pendências

- CPC art. 1.063 (está como não vigente; confirmar).
- Importar CPP e CTB (remover as 4 linhas de teste de cada, preparar no padrão e auditar).
- Conferir na tela: CF art. 5º e 37, Estatuto art. 7º, CED art. 2º, um artigo do CC com muitos incisos.
- Página inicial para visitantes, no molde da do app de questões (opcional).
