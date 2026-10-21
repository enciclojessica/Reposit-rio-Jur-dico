-- Aviso de cadastro pendente (21/10/2026): marca quando a curadoria ja foi avisada de um cadastro aguardando aprovacao,
-- para que o aviso (notificacao no sino e e-mail) saia uma vez so por cadastro. Sem DROP.
alter table public.membros add column if not exists notificado_em timestamptz;

-- Reversao (rodar so se necessario):
-- alter table public.membros drop column notificado_em;
