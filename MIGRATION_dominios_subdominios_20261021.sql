-- Aprovação automática também para subdomínios (21/10/2026), a pedido da Jessica (e-mail institucional de aluno).
-- Cada domínio em dominios_aprovados ganha a opção inclui_subdominios: com ela, "unisantos.br" também vale para
-- "alunos.unisantos.br" (o e-mail termina em ".unisantos.br"). Sem a opção, a correspondência segue exata.
-- Continua exigindo e-mail confirmado; "naounisantos.br" nunca casa, porque o sufixo exigido começa com ponto.
-- Sem DROP (o conector cancela blocos com drop).

alter table public.dominios_aprovados add column if not exists inclui_subdominios boolean not null default false;

create or replace function public.aprovar_por_dominio()
returns boolean language plpgsql security definer set search_path to 'public', 'pg_temp' as $$
declare v_email text; v_conf timestamptz; v_dom text;
begin
  if auth.uid() is null then return false; end if;
  select lower(u.email), u.email_confirmed_at into v_email, v_conf from auth.users u where u.id = auth.uid();
  if v_email is not null and v_conf is not null then
    v_dom := split_part(v_email, '@', 2);
    if exists (
      select 1 from public.dominios_aprovados d
      where d.dominio = v_dom
         or (d.inclui_subdominios and right(v_dom, length(d.dominio) + 1) = '.' || d.dominio)
    ) then
      perform set_config('app.aprovacao_dominio', 'on', true);
      update public.membros set aprovado = true where user_id = auth.uid() and aprovado = false and role = 'leitor';
    end if;
  end if;
  return exists (select 1 from public.membros where user_id = auth.uid() and aprovado);
end;
$$;

update public.dominios_aprovados set inclui_subdominios = true where dominio = 'unisantos.br';

-- Reverter: update public.dominios_aprovados set inclui_subdominios = false where dominio = 'unisantos.br';
-- (e restaurar a aprovar_por_dominio de MIGRATION_cadastro_aprovacao_20261021.sql; a coluna pode ficar.)
