-- Anotações pessoais só para o dono (10/11/2026). A política `anotacoes_select` deixava a conta de admin ler as
-- anotações de todos os membros (`or is_admin()`), e nada no app precisa disso. Agora: só o dono lê.
-- O painel de métricas, que só mostra o total, passa a usar `admin_total_anotacoes()` (devolve o número, não o texto).
-- Efeito colateral esperado: o backup em JSON das Configurações passa a levar só as anotações de quem o gera.
-- Sem DROP (o conector cancela): `alter policy` troca a regra mantendo nome e comando.

alter policy anotacoes_select on public.anotacoes
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.admin_total_anotacoes()
returns bigint
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  return (select count(*) from public.anotacoes);
end;
$function$;

revoke execute on function public.admin_total_anotacoes() from public, anon;
grant execute on function public.admin_total_anotacoes() to authenticated;

-- Conferência: select policyname, roles, qual from pg_policies where tablename = 'anotacoes' and cmd = 'SELECT';
-- Reversão: alter policy anotacoes_select on public.anotacoes to public using ((user_id = (select auth.uid())) or is_admin());
