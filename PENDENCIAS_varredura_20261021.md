# Pendências da varredura de 21/10/2026

Aplicado nesta data (sem ação sua): revogada a escrita em `legislacao_publica`; filtro de entradas públicas/membro em `buscar_entradas_fts`
(`MIGRATION_seguranca_varredura_20261021.sql`). Conteúdo jurídico NÃO foi alterado.

## Ação manual sua
1. Cloudflare Turnstile: criar o site, colocar `VITE_TURNSTILE_SITE_KEY` na Vercel (os dois projetos que tiverem cadastro) e avisar; só depois ligar o CAPTCHA no Supabase (Authentication). Chaves nunca em arquivo ou chat.
2. Proteção contra senhas vazadas (Authentication > Passwords) nos dois projetos Supabase: exige plano Pro.
3. Buckets públicos (manuais-pdf, audio-aulas, slides-ppt, videos, avatares): decidir se viram privados (exige URLs assinadas e mudança de código).
4. Decidir a correção do comentário do CF art. 7º, IV (cita Súmula 490; atribuição errada, candidata a conferir: Súmula Vinculante 4 do STF). CF não está na lista protegida, mas conteúdo jurídico só muda com sua aprovação.
5. Entradas a revisar (aprovação sua): 638dbf24 (URL não corresponde ao precedente), be45a800 (Súmula 718 STF x prisão cautelar), 9cc13225 (data do Tema 1.221), c9cf09e0 (data/URL), 11 súmulas com URL genérica `www.stj.jus.br`, 30 jurisprudências/súmulas sem URL, 13 doutrinas sem ano, duplicata Gonçalves p. 452, identificação incompleta de jurisprudência, status fora do padrão (2), 5 entradas sem tags, 1 tese sem fundamentação, conferir FONAJE Enunciado 8.
6. CDC art. 42, parágrafo único: nuance da modulação (EAREsp 676.608) no comentário; CDC só com autorização expressa.
7. Remover contas de teste em `membros` / Authentication, se ainda existirem.

## Código (posso fazer quando você voltar, em branch própria)
1. `api_rate_limit` tem políticas abertas (`rate_limit_select`/`rate_limit_insert` para anon e authenticated, `true`). Trocar `api/legislacao.js` para a chave de serviço e depois fechar as políticas (`using (false)` / `with check (false)`). Fechar antes quebra o limite dessa rota.
2. `buscar_legislacao_fts` (anon): devolve só texto da lei, mas `busca_tsv` pode indexar comentários; verificar se a busca revela comentário restrito por inferência.
3. Visão `legislacao_publica` aparece como ERROR no linter (SECURITY DEFINER). É intencional (esconde comentários de não membros); manter e documentar.
4. Funções `is_admin`, `is_member`, `is_editor_or_admin` executáveis por anon: só devolvem booleano do próprio usuário, baixo risco; revogar de anon se não forem usadas sem login.
5. `npm audit` (prod): 20 vulnerabilidades (1 crítica, 10 altas); `xlsx` sem correção (avaliar troca por exceljs), `mammoth/argparse`, `pdfjs-dist`, `@modelcontextprotocol/sdk`. Revisar uma a uma antes de `audit fix`.
6. App de questões (Simulado OAB): `acesso_liberado` e `questoes_tags_log` com RLS sem política (ok, acesso só por função); `aceitar_convite`, `admin_atualizar_tags_questao`, `app_admin`, `app_liberado` executáveis por authenticated. Conferido: `admin_atualizar_tags_questao` checa `app_admin()` por dentro, sem risco.
7. `emailRedirectTo: window.location.origin` no app de questões; Radar com aviso de cadastros pendentes.
8. CTN é a próxima norma a importar (precisa do PDF do Planalto enviado por você).

## Atualização das 23h (feito a pedido dela, sem computador)
- Buckets do Themis Jur `manuais-pdf`, `audio-aulas`, `slides-ppt` e `videos` passaram a privados (nenhum código dos dois repositórios os usa; reversível com `update storage.buckets set public = true`). `avatares` segue público (o app usa `getPublicUrl`; só há 1 foto).
- App de questões: o bucket `manuais` já era privado e os 17 PDFs da biblioteca são lidos por toda conta liberada (URL assinada). Os 26 PDFs do bucket antigo `manuais-pdf` do Themis Jur incluem títulos que NÃO estão no app de questões (Criminologia, Direito Digital, Eleitoral, Empresarial, Penal, Direitos Humanos, Civil I, IV e V, Constitucional peças, Trabalho II, Processual Penal I, Ciência Política, História/Hermenêutica). Não consegui copiar (sem acesso a arquivos pelo conector): enviar pelo botão "Enviar manual" do Plano quando estiver no computador. Atenção: vários têm ~939 KB quase idênticos, conferir se são mesmo manuais distintos antes de enviar; há nomes duplicados (Empresarial e Penal com e sem dois-pontos).
- Corrigido: CF 7, IV (`aplicacao_pratica` citava a Súmula 490 do STJ, que trata de reexame necessário; reescrito só a partir do texto do inciso). Entrada 638dbf24: URL do TJDFT era de outro assunto (juros em responsabilidade extracontratual), removida e marcada "conferir inteiro teor"; o precedente em si (AgInt no AREsp 1.173.960/RJ) não foi confirmado. Entrada be45a800: removida a Súmula 718 do STF da referência (trata de regime de pena, não de prisão cautelar); o HC 120.530/MG segue sem confirmação.
- Entrada 9cc13225 (Tema 1.221 do STJ, REsp 2.090.538/PR): tema e notícia do STJ conferem na busca; data de 27/11/2024 não confirmada em fonte oficial.
- Continuam para sua decisão ou confirmação no computador: c9cf09e0 (data e inteiro teor do REsp 2.209.868), 11 súmulas com URL genérica, 30 sem URL, 13 doutrinas sem ano, duplicata Gonçalves p. 452, FONAJE 8, CDC 42 (autorização expressa).

## Decisão dela (21/10, 22h56): o Themis Jur não deve ter manuais
- Os buckets `manuais-pdf`, `audio-aulas`, `slides-ppt` e `videos` do Themis Jur são legado e devem sair de lá. Hoje estão privados e sem uso no código. NÃO apagados: a exclusão é irreversível e parte dos PDFs não existe no app de questões.
- Ordem: (1) no computador, baixar os arquivos do Dashboard do Supabase do Themis Jur (Storage); (2) enviar os manuais que faltam ao app de questões pelo "Enviar manual"; (3) só então apagar os 4 buckets pelo Dashboard (esvaziar e excluir). Áudios, slides e vídeo não têm tela em nenhum dos dois apps; decidir se guarda fora.

## Exclusão dos buckets (autorizada por ela em 21/10, 22h57; cópia no Drive dela)
- O conector cancelou o `delete` em `storage.objects` (ação destrutiva sem confirmação possível). Não contornei. Fazer no Dashboard do Supabase do Themis Jur: Storage, abrir cada bucket (`manuais-pdf`, `audio-aulas`, `slides-ppt`, `videos`), "Empty bucket" e depois "Delete bucket". Excluir pelo Dashboard é o caminho certo: apagar linhas de `storage.objects` por SQL deixaria os arquivos órfãos.

## Auditoria das entradas (21/10, 23h; somente leitura, exceto o item corrigido)
Acervo: 177 entradas (doutrina 30, jurisprudência 42, lei 66, súmula 39). Sem entrada sem referência.
- Súmulas (39): texto e número conferidos contra o que consta nos enunciados oficiais, sem divergência (STJ 5, 7, 35, 37, 43, 54, 98, 174 cancelada, 211, 285, 297, 302, 323, 356, 359, 362, 379, 382, 385, 404, 440, 444, 472, 477, 479, 530, 532, 538, 539, 541, 545, 548, 565, 597, 608; STF 282, 356, 718, 719). Pendente de conferência na fonte: a redação "revista em 2025" da Súmula 545 do STJ (a entrada afirma mudança de texto; não confirmei em fonte oficial).
- Corrigido: status de 58c52704 e 3f8c34a2 era texto livre ("vigente (dano moral coletivo...)"); passou a "vigente" (a ressalva sobre aplicação individual por analogia já consta na própria tese).
- Fontes frágeis, a trocar pelo inteiro teor ou pelo portal do tribunal: b0911d76 (link é página de busca do Jusbrasil), 36b92809 (blog aurum), e17fb792 (site modeloinicial), 7fd90be8 (trilhante), 55c5cf1e (link genérico stj.jus.br), 28379d4b (PDF do MPMG).
- Conferir identificação (não verifiquei em fonte oficial): Tema 970 e Tema 996 do STJ (números de tema e processos), HC 585.941/MG, APn 686/AP, TJPR 0001113-61.2018.8.16.0058.
- e17fb792 (privada): o Enunciado 8 do FONAJE trata de procedimentos especiais nos Juizados; aplicar isso ao superendividamento é interpretação, a tese deve deixar isso claro.
- Verificados na busca: Tema 466/STJ (origem da Súmula 479), Tema 312/STJ (consórcio), Tema 777/STF (RE 842.846), Tema 1.221/STJ (existência).
- Entradas sem tags: 5 (1 jurisprudência cível, 2 consumidor, 2 súmulas cíveis). Entradas do tipo lei sem URL: 66 (esperado; conferir texto contra `legislacao`).

## Links removidos (autorizado por ela em 21/10, 23h)
- 18 entradas ficaram com `url` vazia: 11 súmulas e a REsp 1.399.199/RS com link genérico `www.stj.jus.br` (297, 323, 359, 385, 404, 541, 548, 565, 597, 608 e 55c5cf1e; 2efd6914 inclui a 297), 2 doutrinas de Maria Berenice Dias com a home da Minha Biblioteca, e as fontes frágeis b0911d76 (busca Jusbrasil), 36b92809 (blog), e17fb792 (modeloinicial), 7fd90be8 (trilhante) e 28379d4b (PDF do MPMG). Jurisprudência e súmulas ganharam a tag `conferir inteiro teor`. Os precedentes em si não foram alterados.
- Próximo passo (no computador): colocar o link do portal oficial (STJ/STF) em cada uma e tirar a tag.

## Segunda passada nas entradas (21/10, 23h10; autorizada por ela)
Alterado: e17fb792 (FONAJE 8): `ratio_decidendi` agora separa o texto do Enunciado 8 da interpretação das turmas recursais e manda conferir o acórdão; `fonte` sem travessão. Súmulas 718 e 719 do STF tinham o mesmo `tema`; agora distintos (gravidade em abstrato não é motivação idônea; regime mais severo exige motivação idônea). Tag `conferir página` em fcce9c30 e d9620118 (Gonçalves, mesma p. 452 para dois assuntos).
Conferido sem problema: nenhuma entrada sem teses, sem `ratio_decidendi` ou sem `aplicacao_pratica`; sem caracteres corrompidos; sem datas futuras; sem tema duplicado depois do ajuste.
Em aberto:
- 1aa4d335 (Tema 312/STJ, consórcio) sem `fundamentacao_legal`: não preenchi para não inferir norma.
- 25b4acf9 (privada) sem número de processo ("não identificado"): completar ou retirar.
- Doutrinas de Cavalieri Filho (2 entradas) sem edição, ano e página; Lopes Jr. (3 entradas) sem página; Gonçalves 22. ed. 2025 não confirmada.
- Travessões em 41 entradas, todos dentro de `teses`. Não substituí: parte são citações literais de súmulas (ex.: Súmula 472), que não podem ser alteradas. Decidir caso a caso no computador.

## "Arrume tudo" (21/10, 23h15)
Feito: travessões ` — ` das `teses` trocados por vírgula nas 41 entradas (backup completo em `entradas_bkp_20261021`, apagar depois de validar; ficam só 2 travessões "–" em citações literais das Súmulas 472 e 530/STJ); tags nas 5 entradas que não tinham.
Rate limit: função `rate_limit_legislacao` aplicada no banco e `api/legislacao.js` ajustado (branch `claude/seguranca-varredura-20261021`, commit 07ad1ba, build e 169 testes ok). Falta: conferir a prévia, ela dizer "pode subir" (merge no `main`) e só então fechar as políticas `rate_limit_select` e `rate_limit_insert` (SQL no fim de `MIGRATION_seguranca_varredura_20261021.sql`). Fechar antes do deploy desliga o limite da rota pública até o código novo subir.
Não consegui arrumar sem inventar dado: 1aa4d335 sem fundamentação legal, 25b4acf9 sem número de processo, doutrinas sem edição/ano/página, links oficiais das 16 entradas sem URL, Temas 970/996, HC 585.941/MG, APn 686/AP, TJPR, Súmula 545 (redação de 2025), CDC 42.

## Verificação de teses e doutrinas (21/10, 23h30)
Confirmado em fonte pública: Súmula 545/STJ (revisão pelo Tema 1194, REsp 2.001.973/RS, Terceira Seção, 10/09/2025, Rel. Min. Og Fernandes; tese corrigida, ver `MIGRATION_verificacao_teses_20261021.sql`, parte a rodar no SQL Editor); REsp 2.209.868 (Rel. Min. Humberto Martins, Terceira Turma, unânime, notícia do STJ de 15/07/2026, acórdão publicado em 24/06/2026; "maio/2026" não se confirmou e a referência foi ajustada; link trocado para a notícia do caso); Gonçalves, Direito de Família vol. 6: a 22ª edição existe (a 23ª, de 2026, também), ano de 2025 plausível mas não confirmado; Temas 970 e 996 do STJ conferem com o que a entrada afirma (cláusula penal moratória x lucros cessantes; atraso na entrega, tese 1.2), sem texto oficial lido neste ambiente.
Não confirmei, por falta de acesso ao inteiro teor (SCON/portal do STJ fora do alcance): AgInt no AREsp 1.173.960/RJ, HC 585.941/MG, APn 686/AP, TJPR 0001113-61.2018.8.16.0058, Cavalieri 17ª ed. (2026), e páginas citadas de Bitencourt, Noronha, Masson, Dias e Gonçalves (p. 452). Doutrina por página só se confirma com o livro: não há como chegar a 100% sem consulta ao exemplar.

## Concluído às 23h25 (21/10)
Código do rate limit no `main` (eb0872f), produção READY. Políticas `rate_limit_select` e `rate_limit_insert` de `api_rate_limit` fechadas (`using (false)` / `with check (false)`). Conferido em produção: `/api/legislacao` responde 200 e a função `rate_limit_legislacao` continua registrando as chamadas. Correções da Súmula 545 e do REsp 2.209.868 aplicadas por ela no SQL Editor e conferidas.

## Peças enviadas pela Jessica (22/10/2026)

- 19 entradas inseridas em `entradas` como privadas (`publica = false`), todas conferidas em fonte oficial ou espelho confiável: Súmulas 84 e 375/STJ, 188 e 310/STF, Enunciado 26/FONAJE, EAREsp 676.608/RS, 600.663/RS e 1.501.756/SC, REsp 2.106.053/RJ, 1.025.769/MG e 1.689.175/MS, Tema 821/STF, Tema 243/STJ, Tema 1.161/STJ, RHC 58.442, HC 140.618, HC 169.605 e Jurisprudência em Teses ed. 63 (teses 15 e 16). SQL em `MIGRATION_entradas_peticoes_20261022.sql`. `entradas` passou a 196 linhas. Doutrina das peças não entrou como entrada (autor e obra apenas).
- Tema 929/STJ julgado pela Corte Especial em 15/09/2026 (tese por maioria, sem modulação, segundo Conjur e Migalhas): acórdão ainda não publicado e relator divergente entre as fontes. Fica como alerta de monitoramento, sem tese literal no banco. Tema 1.435/STJ afetado, sem tese.
- Peças corrigidas em cópias (originais intactos): remoção de TJPR 0001113-61.2018.8.16.0058, TJMG 5055156-61.2024.8.13.0145, TJBA 0014716-35.2012.8.05.0248, AgRg na RvCr 5.560/DF e REsp 957.760/MS (não localizados); Súmula 310/STF sem a remissão à Lei 1.408/1951; "20266"; resíduo de plano de saúde na peça da Uber; Tema 929 atualizado e modulação retirada; ressalva de ação civil pública nos REsp 1.634.851/RJ e 1.737.412/SE; nota 7 da peça de RESE; Araken 2020; Theodoro sem edição e ano.
- Para reavaliar depois: os cinco itens não localizados (portais oficiais ou Jusratio após 11/11/2026), Súmula 375/STJ (órgão e data da sessão), relator e acórdão do Tema 929, páginas das citações de doutrina.
- Resolvidos em 22/10/2026 com os arquivos enviados pela Jessica: Súmula 375/STJ (Corte Especial, 18/03/2009, DJe 30/03/2009, ed. 334; referência CPC/1973, art. 593, II c/c art. 659, § 4º; entrada atualizada) e Tema 929/STJ (relatório oficial do STJ: mérito julgado em 15/09/2026, Corte Especial, acórdão ainda não publicado, paradigma REsp 1.963.770/CE, afetado em 11/11/2021, relator atual Min. Humberto Martins, afetado pelo Min. Sanseverino; REsp 1.823.218/AC é o recurso de origem do RRC). Segue sem tese literal publicada.
- Cruzamento das peças com o banco (22/10/2026): 136 artigos citados nas 17 peças (CPC, CC, CDC, CP, CPP, CF, LEP, CTB, Lei 9.099), todos presentes em `legislacao`. Único não vigente: CC 786 (revogado pela Lei 15.040/2024, art. 94, vigência em 10/12/2025), citado na peça Thiago x Maria Izabel e corrigido na cópia. A Lei 15.040/2024 não está no banco (candidata a importação). Entradas e comentários corrigidos em `MIGRATION_comentarios_atualizados_20261022.sql`.

## Aviso de artigo revogado nas entradas (22/10/2026, achado pela Jessica)

- Falso alerta: a tese "Homicídio qualificado: conceito de meio cruel (art. 121, § 2º, III, CP)" mostrava o triângulo de "não está mais vigente", embora o CP art. 121 e o § 2º, III estejam vigentes. Causa: `EntradaDetail.jsx` marcava o artigo inteiro como revogado se qualquer linha do número (inciso VI, § 2º-A, § 7º, revogados pela Lei 14.994/2024) tivesse `vigente = false`. Corrigido em `src/utils/artigosRevogados.js` (artigo só conta como revogado quando o caput está revogado, ou, sem linha de caput, quando nenhum dispositivo está vigente), com teste em `src/__tests__/artigosRevogados.test.js` (commit 8e50bd02).
- Para a lista de revisão: conferir na tela, depois da publicação, as entradas que citam artigos com inciso ou parágrafo revogado (CP 121, CC e CPC com revogações parciais) e confirmar que o triângulo só aparece nos artigos realmente revogados (ex.: CC 786). O aviso ainda olha só o número do artigo, não o parágrafo ou inciso citado; se a citação apontar para um dispositivo específico revogado (ex.: art. 121, § 2º, VI), o aviso não aparece. Decidir com a Jessica se vale refinar.
