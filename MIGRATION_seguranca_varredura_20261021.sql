-- Varredura de 21/10/2026. Ambos os itens já aplicados no Supabase.
-- 1) A visão legislacao_publica herdou grants de escrita para anon/authenticated (padrão do Supabase). Só leitura.
revoke insert, update, delete, truncate, references, trigger on public.legislacao_publica from anon, authenticated;

-- 2) buscar_entradas_fts devolvia entradas não públicas a qualquer autenticado (inclusive cadastro pendente).
CREATE OR REPLACE FUNCTION public.buscar_entradas_fts(p_query text, p_area text DEFAULT NULL::text, p_tipo text DEFAULT NULL::text, p_limit integer DEFAULT 10)
 RETURNS TABLE(id uuid, area text, tema text, tipo text, fonte text, referencia text, url text, teses jsonb, tags text[], status text, rank real)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  select e.id, e.area, e.tema, e.tipo, e.fonte, e.referencia, e.url, e.teses, e.tags, e.status,
         ts_rank(e.busca_tsv, websearch_to_tsquery('portuguese', p_query)) as rank
  from public.entradas e
  where e.busca_tsv @@ websearch_to_tsquery('portuguese', p_query)
    and (p_area is null or e.area = p_area)
    and (p_tipo is null or e.tipo = p_tipo)
    and (e.publica or public.is_member() or auth.role() = 'service_role')
  order by rank desc
  limit greatest(least(coalesce(p_limit, 10), 30), 1);
$function$;

-- 3) Rate limit da rota pública /api/legislacao por função própria (aplicada em 21/10/2026, migração rate_limit_legislacao_rpc).
-- DEPOIS que o código novo de api/legislacao.js estiver em produção, fechar a tabela (rodar no SQL Editor):
--   alter policy rate_limit_select on public.api_rate_limit using (false);
--   alter policy rate_limit_insert on public.api_rate_limit with check (false);
-- As rotas autenticadas usam a chave de serviço e não são afetadas.
create or replace function public.rate_limit_legislacao(p_ip text)
returns boolean language plpgsql security definer set search_path = public
as $$
declare n integer;
begin
  if p_ip is null or length(p_ip) = 0 or length(p_ip) > 64 then return true; end if;
  select count(*) into n from public.api_rate_limit
   where endpoint = 'legislacao' and ip = p_ip and criado_em >= now() - interval '60 seconds';
  if n >= 120 then return false; end if;
  insert into public.api_rate_limit (ip, endpoint) values (p_ip, 'legislacao');
  return true;
end;
$$;
revoke all on function public.rate_limit_legislacao(text) from public;
grant execute on function public.rate_limit_legislacao(text) to anon, authenticated;
