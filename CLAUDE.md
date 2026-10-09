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
- Códigos carregados: cf, adct, cc, cdc, cp, cpc, cpp, ctb, cedoab, lei8906, lei9099. O CPP (Decreto-Lei 3.689/1941, texto compilado do Planalto) entrou em 08/10/2026 com 2.134 linhas (74 não vigentes) e 804 artigos; ficaram de fora 7 números que a versão compilada não traz (194, 557 a 560, 562 e 611), e os intervalos 556 e 561 estão como uma linha revogada cada. Erros de grafia da fonte foram mantidos ("Ihe", "Xl"), mas hífen com espaço ("boa- fé") foi corrigido. Alínea sob inciso: `inciso` 'III-a'; alínea direto sob o caput ou parágrafo: `inciso` = a letra. O CTB (Lei 9.503/1997, texto compilado do Planalto) entrou em 08/10/2026 com 1.612 linhas (154 não vigentes), 341 artigos e 50 títulos com letra (ex.: 253-A, 268-A, 326-C); ficaram de fora o Anexo I (definições) e os demais anexos, o art. 147 § 1º-A e o art. 268-A § 8º com seus incisos (a fonte traz só o rótulo e a anotação da Medida Provisória, sem texto). Linhas sem rótulo ("Infração", "Penalidade", "Medida administrativa", "Penas") ficam dentro do `texto` da linha anterior. Em 08/10/2026 o CTB e o CPP foram padronizados como as demais leis: hífen com espaço ("contar- se"), "13. 281", "Incluído Lei" (sem "pela"), "13.495, 2017" (sem "de") e "XXIV-" foram corrigidos. Truncamentos da própria fonte foram mantidos (art. 162, VII "(Incluído dad"; art. 280, § 6º sem o ")" final). Art. 139-A, I e IV (revogados pela MP 1.360/2026, vigência encerrada) seguem com `vigente = true`, como na fonte. Em 08/10/2026 os 364 artigos vigentes do CTB (inclusive os com letra) ganharam `contexto` (Comentário didático) e `aplicacao_pratica` (Aplicação prática) na linha do caput, no padrão de CP, CDC, CPC e Lei 9.099, redigidos só a partir do texto do artigo (sem jurisprudência ou doutrina). Em 09/10/2026 os 809 artigos vigentes do CPP (inclusive os com letra) ganharam `contexto` e `aplicacao_pratica` na linha do caput, no mesmo padrão do CTB, redigidos só a partir do texto do artigo (sem jurisprudência ou doutrina); onde o texto traz a anotação "Vide", o comentário apenas a registra, sem afirmar o resultado.
- **CC, CDC, CP, CPC e Lei 9.099 são o padrão de referência da Jessica**: só ler e relatar; alterar apenas com autorização expressa.
  Em 09/10/2026, com autorização expressa dela, `origem` de CC e Lei 9.099 foi normalizada para 'planalto.gov.br' e os caputs que estavam sem `contexto`/`aplicacao_pratica` foram preenchidos só a partir do texto do artigo (sem jurisprudência ou doutrina): CC 9, CDC 14, CPC 8, Lei 9.099 art. 95 (só `aplicacao_pratica`) e CP 118 (arts. 35 a 361). Conferência por SELECT: 0 caputs vigentes sem comentário em cc, cdc, cp, cpc e lei9099. SQL em `MIGRATION_comentarios_faltantes_cc_cdc_cpc.sql` e `MIGRATION_comentarios_faltantes_cp_lote1.sql` a `_lote4.sql`.
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
- Supabase: ref `wedfgqigtyrsrmmxsmuo`. As 4 tabelas de backup de 02/10/2026 (`legislacao_bkp_*`) foram apagadas em 08/10/2026,
  após validação da Jessica; `legislacao` ficou com 13.781 linhas e, após a importação do CPP, tinha 15.911 e, com o CTB, tinha 17.519; com a inclusão do art. 155 §§ 10 a 12 e do art. 157 § 2º, XI e § 2º-A, III (a a e), tem 17.539. Os backups de 09/10/2026 (`legislacao_bkp_20261009` e `legislacao_bkp_20261009_ctb_cpp`) foram aprovados para exclusão pela Jessica em 09/10/2026 (SQL em `MIGRATION_ajustes_finais_20261009.sql`).
- Os JSON de carga do repositório de importação (`themis-jur-importacao`) estão no formato antigo; regerar a partir do banco se forem reutilizados.
- Sessões longas derrubam o conector do Supabase às vezes ("No approval received", "Mcp-Session-Id header is required"): tentar de novo
  ou abrir conversa nova. O terminal em nuvem não alcança `planalto.gov.br`: arquivos de lei precisam ser enviados pela Jessica.

## Fluxo

Branch `claude/<assunto>`, `npx vite build` e `npx vitest run` passando, push, prévia da Vercel conferida, só então `main`
(confirmar que o `main` não mudou desde a base).

## Pendências

- Reescrita dos comentários curtos (menos de 200 caracteres na `aplicacao_pratica`), regra aprovada em 09/10/2026: reescrever só onde há ganho verificável no texto do banco (função ou distinção frente a dispositivos vizinhos), sem jurisprudência, doutrina, penas ou prazos que não estejam no artigo. CPP: 55 reescritos e aplicados (`MIGRATION_reescrita_cpp_curtos_lote1.sql` a `lote4.sql`), o restante dos curtos foi mantido por já dizer tudo. CTB: 12 em `MIGRATION_reescrita_ctb_curtos_lote1.sql` (aguardando execução e conferência), o restante mantido. Observação: comentários do CTB com afirmações sobre prática forense ("muito invocado em colisões") foram removidos onde apareciam nos curtos (arts. 28 e 42).
- CC art. 1.783-A: corrigir os caracteres soltos com `MIGRATION_ajustes_finais_20261009.sql` (7 linhas; aplicar e conferir 0 restantes).
- CP arts. 155, 157 e 171: penas conferidas em 09/10/2026 contra prints do texto compilado (155: 1 a 6; § 4º 2 a 8; 157: 6 a 10; § 3º, I 7 a 18 e II 24 a 30; § 5º 20 a 40; 171: 1 a 5; 171-A: 4 a 8), sem divergência. Inseridos, da Lei 15.517/2026: art. 155 §§ 10 a 12, art. 157 § 2º, XI e § 2º-A, III com alíneas a a e (a alínea e é vetada, `vigente = false`), em `MIGRATION_cp_155_157_lei_15517.sql`. Art. 157 inteiro conferido; art. 171 (caput e §§) ainda não conferido contra o texto do Planalto.
- CP art. 337-A § 2º, I: existe no banco como "(VETADO)", `vigente = false`, o que confere com a fonte; sem pendência. CDC art. 49: comentário corrigido em 09/10/2026 (sem "internet", que não está no caput).
- CPC art. 1.063: corrigido em 09/10/2026 para `vigente = true` (redação dada pela Lei 14.976/2024, conferida em print do texto compilado do Planalto enviado pela Jessica) e comentado; sem pendência.
- Conferir na tela: CF art. 5º e 37, Estatuto art. 7º, CED art. 2º, um artigo do CC com muitos incisos.
- Página inicial para visitantes, no molde da do app de questões (opcional).
