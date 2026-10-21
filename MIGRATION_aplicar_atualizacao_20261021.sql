-- Aplicação de atualização legislativa por clique (tela Atualizações, só admin).
-- Atômica: se qualquer operação falhar, nada é gravado. O trigger trg_legislacao_historico
-- guarda a redação anterior de cada UPDATE.
-- Cada 'update' confere o texto esperado (o que o relatório de diferenças mostrou); se a linha
-- mudou no intervalo, a função aborta. CC, CDC, CP, CPC e Lei 9.099 só com p_autorizar_padrao = true
-- (autorização expressa da Jessica, ver CLAUDE.md).

create or replace function public.aplicar_atualizacao(
  p_ops jsonb,
  p_alerta_tipo text default null,
  p_alerta_numero text default null,
  p_autorizar_padrao boolean default false
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $fn$
declare
  op jsonb;
  atual text;
  cod text;
  n_upd int := 0;
  n_ins int := 0;
begin
  if not public.is_admin() then
    raise exception 'Somente administrador aplica atualizações legislativas';
  end if;
  if p_ops is null or jsonb_typeof(p_ops) <> 'array' or jsonb_array_length(p_ops) = 0 then
    raise exception 'Nenhuma operação para aplicar';
  end if;

  for op in select * from jsonb_array_elements(p_ops) loop
    if op->>'op' = 'update' then
      select codigo, texto into cod, atual from legislacao where id = (op->>'id')::uuid for update;
      if not found then
        raise exception 'Linha % não encontrada', op->>'id';
      end if;
      if cod in ('cc','cdc','cp','cpc','lei9099') and not p_autorizar_padrao then
        raise exception 'O código % é padrão de referência: exige autorização expressa', cod;
      end if;
      if atual is distinct from (op->>'esperado') then
        raise exception 'O texto da linha % mudou desde a conferência; refazer o relatório', op->>'id';
      end if;
      update legislacao set texto = op->>'texto' where id = (op->>'id')::uuid;
      n_upd := n_upd + 1;
    elsif op->>'op' = 'insert' then
      if (op->>'codigo') in ('cc','cdc','cp','cpc','lei9099') and not p_autorizar_padrao then
        raise exception 'O código % é padrão de referência: exige autorização expressa', op->>'codigo';
      end if;
      insert into legislacao (codigo, numero, titulo, inciso, paragrafo, texto, vigente, origem)
      values (
        op->>'codigo', (op->>'numero')::int, nullif(op->>'titulo',''), nullif(op->>'inciso',''),
        nullif(op->>'paragrafo',''), op->>'texto', coalesce((op->>'vigente')::boolean, true),
        coalesce(op->>'origem', 'planalto.gov.br')
      );
      n_ins := n_ins + 1;
    else
      raise exception 'Operação desconhecida: %', op->>'op';
    end if;
  end loop;

  if p_alerta_tipo is not null and p_alerta_numero is not null then
    update legislacao_alertas set status = 'aplicado'
     where tipo = p_alerta_tipo and numero = p_alerta_numero;
  end if;

  return jsonb_build_object('atualizados', n_upd, 'inseridos', n_ins);
end
$fn$;

grant execute on function public.aplicar_atualizacao(jsonb, text, text, boolean) to authenticated;

-- Reversão: use legislacao_historico (redação anterior) para restaurar os UPDATEs e delete as linhas inseridas.
-- Remover a função: drop function public.aplicar_atualizacao(jsonb, text, text, boolean);
