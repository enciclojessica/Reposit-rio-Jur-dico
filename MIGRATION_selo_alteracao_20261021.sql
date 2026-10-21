-- Selo "Alterado pela EC X em data", redação anterior e vigência diferida (21/10/2026).
alter table public.legislacao_historico add column if not exists data_norma date;
alter table public.legislacao add column if not exists vigencia_obs text;

-- Membros (leitor, editor, admin) leem o histórico para ver a redação anterior.
create policy legislacao_historico_membros_read on public.legislacao_historico
  for select to authenticated using (exists (select 1 from public.membros m where m.user_id = auth.uid()));

-- Gatilho passa a gravar a norma alteradora e a data (lidas de set_config local, definido por aplicar_atualizacao).
create or replace function public.legislacao_registrar_mudanca()
 returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_lei text := nullif(current_setting('themis.lei_alteradora', true), '');
  v_data date := nullif(current_setting('themis.data_norma', true), '')::date;
begin
  if tg_op = 'DELETE' then
    insert into public.legislacao_historico (legislacao_id, codigo, numero, inciso, paragrafo, titulo, texto, vigente, operacao, lei_alteradora, data_norma, linha_anterior)
    values (old.id, old.codigo, old.numero, old.inciso, old.paragrafo, old.titulo, old.texto, old.vigente, 'DELETE', v_lei, v_data, to_jsonb(old) - 'busca_tsv');
    return old;
  end if;
  if (old.codigo, old.numero, old.inciso, old.paragrafo, old.titulo, old.rotulo, old.texto, old.vigente)
     is distinct from (new.codigo, new.numero, new.inciso, new.paragrafo, new.titulo, new.rotulo, new.texto, new.vigente) then
    insert into public.legislacao_historico (legislacao_id, codigo, numero, inciso, paragrafo, titulo, texto, vigente, operacao, lei_alteradora, data_norma, linha_anterior)
    values (old.id, old.codigo, old.numero, old.inciso, old.paragrafo, old.titulo, old.texto, old.vigente, 'UPDATE', v_lei, v_data, to_jsonb(old) - 'busca_tsv');
    new.atualizado_em := now();
  end if;
  return new;
end $function$;

-- Preenchimento das 5 linhas de histórico de 21/10/2026 (EC 140 e 141, promulgadas em 16/10/2026).
update public.legislacao_historico set lei_alteradora = case when numero = 7 then 'EC 141/2026' else 'EC 140/2026' end,
  data_norma = date '2026-10-16' where codigo = 'cf' and numero in (7, 40, 198) and lei_alteradora is null;

-- Vigência diferida do inciso XV do art. 7º da CF (não se infere data: registra a regra da norma).
update public.legislacao set vigencia_obs = 'Entra em vigor 2 meses após a publicação da EC 141/2026 (art. 10, I).'
  where id = '6b3b9e08-8ac0-41cf-862a-3f452c11e912';

-- aplicar_atualizacao ganhou p_lei_alteradora e p_data_norma (versão de 6 parâmetros, ver MIGRATION_aplicar_atualizacao_20261021.sql
-- para o corpo base; a versão nova acrescenta os dois set_config antes do laço).
-- Reversão: drop policy legislacao_historico_membros_read on public.legislacao_historico;
--           alter table public.legislacao drop column vigencia_obs; alter table public.legislacao_historico drop column data_norma;
