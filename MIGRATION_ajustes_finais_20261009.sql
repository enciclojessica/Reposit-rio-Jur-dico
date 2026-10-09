-- Ajustes finais de 09/10/2026 (autorizados pela Jessica)
-- 1) CC art. 1.783-A: converte entidades de acentos combinantes em letras acentuadas.
update legislacao set texto = replace(replace(replace(replace(replace(replace(texto,
  'o&#770;','ô'),'o&#771;','õ'),'a&#768;','à'),'a&#771;','ã'),'e&#770;','ê'),'a&#770;','â')
where codigo='cc' and numero=1783 and texto ~ '&#[0-9]+;';

-- Conferencia (esperado: 0)
select count(*) as restantes from legislacao
where texto ~ '&#[0-9]+;' or contexto ~ '&#[0-9]+;' or aplicacao_pratica ~ '&#[0-9]+;';

-- 2) Apaga os backups de 09/10/2026 (validados e aprovados pela Jessica em 09/10/2026).
drop table if exists public.legislacao_bkp_20261009;
drop table if exists public.legislacao_bkp_20261009_ctb_cpp;
