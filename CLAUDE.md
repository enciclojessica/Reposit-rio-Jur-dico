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
  (alínea como 'VIII-b'); artigo com letra: `numero` inteiro e `titulo = 'Art. 7-A'` (rótulo temático de artigo, como na CF art. 37, vai em `rotulo`, nunca em `titulo`); não vigente = `vigente = false`;
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
  após validação da Jessica; `legislacao` ficou com 13.781 linhas e, após a importação do CPP, tinha 15.911 e, com o CTB, tinha 17.519; com a inclusão do art. 155 §§ 10 a 12 e do art. 157 § 2º, XI e § 2º-A, III (a a e), tem 17.539 e, com CF art. 233 (caput e §§ 1º a 3º, revogados pela EC 28/2000) e Lei 9.099 art. 47 (vetado), tem 17.544 (`MIGRATION_lacunas_cf233_lei9099_47.sql`) e, com os arts. 91, 106 a 112 (inclusive 111-A) e 114 do ADCT (70 linhas, PDF do compilado enviado pela Jessica), tem 17.614 (`MIGRATION_adct_lacunas_20261009.sql`) e, com o CF art. 171 revogado (9 linhas, `MIGRATION_cf_171_revogado.sql`), tem 17.623. Os backups de 09/10/2026 (`legislacao_bkp_20261009` e `legislacao_bkp_20261009_ctb_cpp`) foram aprovados para exclusão pela Jessica em 09/10/2026 (SQL em `MIGRATION_ajustes_finais_20261009.sql`).
- Os JSON de carga do repositório de importação (`themis-jur-importacao`) estão no formato antigo; regerar a partir do banco se forem reutilizados.
- Sessões longas derrubam o conector do Supabase às vezes ("No approval received", "Mcp-Session-Id header is required"): tentar de novo
  ou abrir conversa nova. O terminal em nuvem não alcança `planalto.gov.br`: arquivos de lei precisam ser enviados pela Jessica.

## Fluxo

Branch `claude/<assunto>`, `npx vite build` e `npx vitest run` passando, push, prévia da Vercel conferida, só então `main`
(confirmar que o `main` não mudou desde a base).

## Pendências

- Auditoria de 09/10/2026 (correções em `MIGRATION_auditoria_20261009.sql`). Sem duplicatas, entidades, mojibake, órfãos, referências cruzadas quebradas (CTB e CPP) nem divergência de vigência. Em aberto, para decidir com a Jessica:
  - CF `titulo` como rótulo temático: resolvido em 09/10/2026 (`MIGRATION_cf_rotulo_20261009.sql`). `titulo` é só para artigos com letra; os rótulos foram para a coluna `rotulo` (exibida como subtítulo do cartão em `Legislacao.jsx` e `LegislacaoPublica.jsx`, e incluída na busca `busca_tsv`). O art. 5º agora é um grupo só.
  - Lacunas de numeração: CPP 557 a 560 e 562 já estão cobertos pelas linhas revogadas 556 e 561 (texto conferido com o Planalto em 09/10/2026); restam o art. 194 (a fonte compilada não o traz; a anotação de revogação só entra com o texto compilado) e o 611; CF 171 inserido como revogado (EC 6/1995). ADCT resolvido em 09/10/2026: os arts. 106 a 112 e 114 existem no compilado (Novo Regime Fiscal, EC 95/2016) e foram inseridos; só o 91 (EC 109/2021) e o 108 (EC 113/2021) são revogados (`vigente = false`) Conferir no texto compilado se são artigos revogados ou vetados antes de inserir. Resolvidas em 09/10/2026 com o texto enviado pela Jessica: CC 1.620 a 1.629 (já é uma linha revogada só, como o CPP 556), CF 117 (é o ADCT 117, já presente e idêntico à EC 136/2025), CF 233 e Lei 9.099 art. 47.
  - CPC art. 1.030, parágrafo único: conferido em 09/10/2026 com o compilado enviado pela Jessica. É o texto original de 2015, substituído pela redação da Lei 13.256/2016 (o caput e os §§ 1º e 2º do banco já estão na redação vigente, com os ajustes da Lei 15.484/2026); `vigente = false` está correto e a linha não foi alterada.
  - Sem comentário (nunca preenchidos): CF, restam 56 caputs vigentes (a partir do art. 198) (conferir por SELECT: caputs vigentes de `cf` com `aplicacao_pratica` vazia). Feitos em 09/10/2026, só a partir do texto do artigo e dos incisos/parágrafos no banco: lote 1 (arts. 4 a 51), lote 2 (arts. 52 a 92) e lote 3 (arts. 93 a 130-A) lote 4 (arts. 131 a 144) lote 5 (arts. 145 a 156-A) lote 6 (arts. 156 a 162) lote 7 (arts. 163 a 167) lote 8 (arts. 167-A a 169) lote 9 (arts. 170 a 180) lote 10 (arts. 181 a 189) e lote 11 (arts. 190 a 197), SQL em `MIGRATION_comentarios_cf_lote1.sql`, `_lote2.sql`, `_lote3.sql`, `_lote4.sql`, `_lote5.sql`, `_lote6.sql`, `_lote7.sql`, `_lote8.sql`, `_lote9.sql`, `_lote10.sql` e `_lote11.sql`, todos já aplicados. O conector às vezes cancela escritas grandes: subir em blocos de poucas instruções. Lei 8.906 e CED-OAB ficam sem comentário por decisão da Jessica (09/10/2026): estão no banco só porque aparecem nas questões do app irmão. ADCT (146 caputs vigentes) fica por último, depois da CF. CED-OAB com `origem` diferente de 'planalto.gov.br' (226 linhas).
  - Travessão nos comentários de CC, CDC, CP, CPC, CF e Lei 9.099 (padrão da Jessica, não alterado).
- Conferir na tela (prévia): CF art. 5º e 37 com o novo subtítulo, Estatuto art. 7º, CED art. 2º, um artigo do CC com muitos incisos.
- Página inicial para visitantes, no molde da do app de questões (opcional).
