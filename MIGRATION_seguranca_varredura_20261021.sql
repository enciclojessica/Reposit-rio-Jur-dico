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
