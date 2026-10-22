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
