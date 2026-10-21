-- Versionamento da legislacao (21/10/2026): atualizado_em, histórico por gatilho e registro de versão por código.

-- 1. atualizado_em: muda só quando o dispositivo muda (texto, vigência, posição, título, rótulo), não nos comentários.
alter table public.legislacao add column if not exists atualizado_em timestamptz;
update public.legislacao set atualizado_em = coalesce(criado_em, now()) where atualizado_em is null;
alter table public.legislacao alter column atualizado_em set default now();
alter table public.legislacao alter column atualizado_em set not null;

-- 2. Histórico: guarda a linha anterior a cada alteração do dispositivo ou exclusão.
create table if not exists public.legislacao_historico (
  id uuid primary key default gen_random_uuid(),
  legislacao_id uuid,
  codigo text not null,
  numero integer,
  inciso text,
  paragrafo text,
  titulo text,
  texto text,
  vigente boolean,
  operacao text not null check (operacao in ('UPDATE','DELETE')),
  lei_alteradora text,
  linha_anterior jsonb not null,
  registrado_em timestamptz not null default now()
);
create index if not exists legislacao_historico_chave_idx on public.legislacao_historico (codigo, numero);
create index if not exists legislacao_historico_data_idx on public.legislacao_historico (registrado_em desc);
alter table public.legislacao_historico enable row level security;
create policy legislacao_historico_select on public.legislacao_historico
  for select to authenticated using ((select public.is_editor_or_admin()));
-- Sem políticas de escrita: só o gatilho (security definer) e a chave de serviço gravam.

create or replace function public.legislacao_registrar_mudanca() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    insert into public.legislacao_historico (legislacao_id, codigo, numero, inciso, paragrafo, titulo, texto, vigente, operacao, linha_anterior)
    values (old.id, old.codigo, old.numero, old.inciso, old.paragrafo, old.titulo, old.texto, old.vigente, 'DELETE', to_jsonb(old) - 'busca_tsv');
    return old;
  end if;
  if (old.codigo, old.numero, old.inciso, old.paragrafo, old.titulo, old.rotulo, old.texto, old.vigente)
     is distinct from (new.codigo, new.numero, new.inciso, new.paragrafo, new.titulo, new.rotulo, new.texto, new.vigente) then
    insert into public.legislacao_historico (legislacao_id, codigo, numero, inciso, paragrafo, titulo, texto, vigente, operacao, linha_anterior)
    values (old.id, old.codigo, old.numero, old.inciso, old.paragrafo, old.titulo, old.texto, old.vigente, 'UPDATE', to_jsonb(old) - 'busca_tsv');
    new.atualizado_em := now();
  end if;
  return new;
end $$;

create trigger trg_legislacao_historico before update or delete on public.legislacao
  for each row execute function public.legislacao_registrar_mudanca();

-- 3. Versão por código (nome, fonte e termos que identificam a norma nas ementas).
create table public.legislacao_versao (
  codigo text primary key,
  nome text not null,
  url_compilado text,
  termos text[] not null default '{}',
  n_linhas integer,
  observacao text
);
alter table public.legislacao_versao enable row level security;
create policy legislacao_versao_select on public.legislacao_versao for select to authenticated using (true);
create policy legislacao_versao_admin_write on public.legislacao_versao for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- 4. Marcadores da checagem semanal: último número de norma já verificado (lei, lc, ec).
create table public.legislacao_monitor (
  chave text primary key,
  valor text not null,
  verificado_em timestamptz not null default now()
);
alter table public.legislacao_monitor enable row level security;
create policy legislacao_monitor_select on public.legislacao_monitor for select to authenticated using (true);
create policy legislacao_monitor_admin_write on public.legislacao_monitor for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
insert into public.legislacao_monitor (chave, valor) values ('lei','15517'),('lc','225'),('ec','136');

-- 5. Alertas: normas novas que alteram códigos do banco, aguardando revisão da Jessica.
create table public.legislacao_alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('lei','lc','ec','mp')),
  numero text not null,
  data_norma text,
  ementa text,
  codigos text[] not null default '{}',
  url text,
  status text not null default 'pendente' check (status in ('pendente','aplicado','descartado')),
  detectado_em timestamptz not null default now(),
  observacao text,
  unique (tipo, numero)
);
alter table public.legislacao_alertas enable row level security;
create policy legislacao_alertas_select on public.legislacao_alertas for select to authenticated using ((select public.is_editor_or_admin()));
create policy legislacao_alertas_admin_write on public.legislacao_alertas for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Povoamento de legislacao_versao (um registro por código; cedoab fora do monitoramento) e alerta inicial da EC 141/2026:
-- aplicado via Supabase em 21/10/2026 (ver CLAUDE.md, seção Atualização legislativa).

-- Reversão:
-- drop table public.legislacao_alertas; drop table public.legislacao_monitor; drop table public.legislacao_versao;
-- drop trigger trg_legislacao_historico on public.legislacao; drop function public.legislacao_registrar_mudanca();
-- drop table public.legislacao_historico; alter table public.legislacao drop column atualizado_em;
