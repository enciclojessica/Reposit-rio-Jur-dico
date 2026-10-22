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
6. App de questões (Simulado OAB): `acesso_liberado` e `questoes_tags_log` com RLS sem política (ok, acesso só por função); `aceitar_convite`, `admin_atualizar_tags_questao`, `app_admin`, `app_liberado` executáveis por authenticated (conferir que `admin_atualizar_tags_questao` checa `app_admin()` por dentro).
7. `emailRedirectTo: window.location.origin` no app de questões; Radar com aviso de cadastros pendentes.
8. CTN é a próxima norma a importar (precisa do PDF do Planalto enviado por você).
