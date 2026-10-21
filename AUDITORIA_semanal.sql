-- Auditoria semanal (somente leitura), executada na rotina de segunda-feira. Esperado: tudo 0, exceto
-- comentarios_em_revisao e alertas_pendentes (informativos) e total_linhas (conferir se bate com o CLAUDE.md).
-- Duplicata só conta se alguma das linhas for vigente (LEP art. 122, I e III, tem pares revogados da própria fonte).
select 'duplicatas' item, count(*)::text n from (
  select 1 from legislacao group by codigo, numero, coalesce(titulo,''), coalesce(inciso,''), coalesce(paragrafo,'')
  having count(*) > 1 and bool_or(vigente is true)) t
union all select 'caputs_vigentes_sem_comentario', count(*)::text from legislacao
  where codigo in ('cf','adct','cc','cdc','cp','cpc','cpp','ctb','lei9099','lep') and inciso is null and paragrafo is null
    and vigente is true and (coalesce(trim(contexto),'') = '' or coalesce(trim(aplicacao_pratica),'') = '')
union all select 'comentarios_em_revisao', count(*)::text from legislacao where comentario_revisar
union all select 'travessao_em_comentarios_ctb_cpp_lep_adct', count(*)::text from legislacao
  where codigo in ('ctb','cpp','lep','adct') and (contexto ~ '[—–]' or aplicacao_pratica ~ '[—–]')
union all select 'origem_fora_do_padrao_exceto_cedoab', count(*)::text from legislacao
  where codigo <> 'cedoab' and origem is distinct from 'planalto.gov.br'
union all select 'texto_vazio_ou_nulo', count(*)::text from legislacao where coalesce(trim(texto),'') = ''
union all select 'vigente_nulo', count(*)::text from legislacao where vigente is null
union all select 'alertas_pendentes', count(*)::text from legislacao_alertas where status = 'pendente'
union all select 'entradas_tag_slug_ou_maiuscula', count(*)::text from entradas e
  where exists (select 1 from unnest(e.tags) t where (t ~ '-' or t ~ '[A-Z]')
    and t not in ('extraído-de-peça','pesquisa-juri','auto-importado') and t !~ '^(art\.|súmula|multa art)'
    and t !~ 'necessidade-possibilidade|proporcionalidade-possibilidade')
union all select 'entradas_tema_com_travessao', count(*)::text from entradas where tema ~ '[—–]| - '
union all select 'total_linhas', count(*)::text from legislacao;
