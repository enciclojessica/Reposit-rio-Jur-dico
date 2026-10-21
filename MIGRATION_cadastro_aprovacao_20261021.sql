-- Cadastro com aprovação (21/10/2026), autorizado pela Jessica.
-- Objetivo: o QR code aponta para o site; quem se cadastra fica pendente (aprovado = false) e só lê o acervo
-- depois de aprovado pela Jessica ou, se o e-mail estiver confirmado e o domínio constar em dominios_aprovados,
-- automaticamente. Convite individual continua valendo e já nasce aprovado. Sem gate por pagamento (pago segue false).
-- Sem DROP (o conector cancela blocos com drop): políticas por ALTER POLICY, funções por CREATE OR REPLACE.

-- ── Bloco A: coluna, backfill e tabela de domínios ───────────────────────────────────────────────
alter table public.membros add column if not exists aprovado boolean not null default false;
-- Todos os membros existentes continuam com acesso (conferir na tela Membros os leitores sem convite).
update public.membros set aprovado = true where aprovado = false;

create table if not exists public.dominios_aprovados (
  dominio   text primary key check (dominio = lower(dominio) and dominio !~ '[@[:space:]]'),
  criado_em timestamptz not null default now()
);
alter table public.dominios_aprovados enable row level security;
create policy dominios_aprovados_admin on public.dominios_aprovados for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ── Bloco B: funções de acesso e proteção da coluna ──────────────────────────────────────────────
create or replace function public.is_member()
returns boolean language sql stable security definer set search_path to 'public', 'pg_temp' as $$
  select exists (select 1 from public.membros m where m.user_id = auth.uid() and m.aprovado)
$$;

create or replace function public.prevent_role_self_escalation()
returns trigger language plpgsql security definer set search_path to 'public', 'pg_temp' as $$
begin
  if not public.is_admin() and coalesce(auth.role(), '') <> 'service_role' then
    if new.role is distinct from old.role then
      raise exception 'Apenas administradores podem alterar o papel de um membro.';
    end if;
    if new.pago is distinct from old.pago then
      raise exception 'Apenas administradores podem alterar o status de assinatura.';
    end if;
    if new.user_id is distinct from old.user_id
       or new.invited_by is distinct from old.invited_by then
      raise exception 'Campo protegido.';
    end if;
    -- Aprovação: só admin, service_role ou a função aprovar_por_dominio (que liga o marcador local abaixo).
    if new.aprovado is distinct from old.aprovado
       and coalesce(current_setting('app.aprovacao_dominio', true), '') <> 'on' then
      raise exception 'Apenas administradores podem aprovar membros.';
    end if;
  end if;
  return new;
end;
$$;

-- Aprovação automática: só com e-mail confirmado e domínio exato em dominios_aprovados (sem sufixo nem subdomínio).
create or replace function public.aprovar_por_dominio()
returns boolean language plpgsql security definer set search_path to 'public', 'pg_temp' as $$
declare v_email text; v_conf timestamptz;
begin
  if auth.uid() is null then return false; end if;
  select lower(u.email), u.email_confirmed_at into v_email, v_conf from auth.users u where u.id = auth.uid();
  if v_email is not null and v_conf is not null
     and exists (select 1 from public.dominios_aprovados d where d.dominio = split_part(v_email, '@', 2)) then
    perform set_config('app.aprovacao_dominio', 'on', true);
    update public.membros set aprovado = true where user_id = auth.uid() and aprovado = false and role = 'leitor';
  end if;
  return exists (select 1 from public.membros where user_id = auth.uid() and aprovado);
end;
$$;
revoke execute on function public.aprovar_por_dominio() from public, anon;
grant execute on function public.aprovar_por_dominio() to authenticated;

-- ── Bloco C: políticas e funções de gatilho ──────────────────────────────────────────────────────
alter policy membros_insert on public.membros with check (
  ((user_id = (select auth.uid())) and role = 'leitor' and pago = false and invited_by is null and aprovado = false)
  or (select public.is_admin()));
alter policy legislacao_historico_membros_read on public.legislacao_historico using ((select public.is_member()));

-- Funções de gatilho não precisam ser chamáveis por RPC (o disparo do gatilho não checa EXECUTE).
revoke execute on function public.legislacao_marcar_revisao() from public, anon, authenticated;
revoke execute on function public.legislacao_registrar_mudanca() from public, anon, authenticated;

-- Jurisprudência sem número identificado (rastreabilidade): sai da vitrine pública até a Jessica identificar o julgado.
update public.entradas set publica = false where id = '25b4acf9-2f70-4626-ba28-d7ea981551cc';

-- ── Domínio institucional (aplicado depois, após a confirmação da grafia) ───────────────────────
insert into public.dominios_aprovados (dominio) values ('unisantos.br') on conflict do nothing; -- confirmado pela Jessica em 21/10/2026

-- ── Reverter ─────────────────────────────────────────────────────────────────────────────────────
-- alter policy membros_insert on public.membros with check (((user_id = (select auth.uid())) and role = 'leitor' and pago = false and invited_by is null) or (select public.is_admin()));
-- alter policy legislacao_historico_membros_read on public.legislacao_historico using (exists (select 1 from membros m where m.user_id = auth.uid()));
-- create or replace function public.is_member() returns boolean language sql stable security definer set search_path to 'public' as $$ select exists (select 1 from public.membros m where m.user_id = auth.uid()); $$;
-- (restaurar prevent_role_self_escalation sem o bloco de aprovado: ver MIGRATION_rls_seguranca.sql / definição anterior)
-- grant execute on function public.legislacao_marcar_revisao(), public.legislacao_registrar_mudanca() to anon, authenticated;
-- update public.entradas set publica = true where id = '25b4acf9-2f70-4626-ba28-d7ea981551cc';
-- drop function public.aprovar_por_dominio(); drop table public.dominios_aprovados; alter table public.membros drop column aprovado;
