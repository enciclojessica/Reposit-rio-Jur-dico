-- Revisão espaçada das anotações pessoais ("Minha anotação", 10/11/2026).
-- Cada anotação guarda em que etapa da revisão está e quando é a próxima. Intervalos: 1, 3, 7, 15 e 30 dias
-- (`src/utils/revisaoAnotacoes.js`). Sem `revisao_proxima`, a anotação vence no dia seguinte ao da criação.
-- Etapa 5 = dominada (sem próxima revisão). "Revisar de novo" volta para a etapa 0, com revisão no dia seguinte.
-- O dono já pode alterar a própria anotação pela política `anotacoes_own_update`; nada muda no RLS.
-- O componente `AnotacaoPessoal.jsx` grava só `texto` e `atualizado_em` no upsert: editar a anotação não mexe na agenda.

alter table public.anotacoes add column if not exists revisao_etapa smallint not null default 0;
alter table public.anotacoes add column if not exists revisao_proxima date;
alter table public.anotacoes add column if not exists revisao_feita_em timestamptz;
alter table public.anotacoes add constraint anotacoes_revisao_etapa_check check (revisao_etapa between 0 and 5);

-- Conferência:
-- select count(*) total, count(*) filter (where revisao_etapa = 0) etapa_zero from public.anotacoes;
-- Reversão (no SQL Editor):
-- alter table public.anotacoes drop constraint anotacoes_revisao_etapa_check;
-- alter table public.anotacoes drop column revisao_feita_em, drop column revisao_proxima, drop column revisao_etapa;
