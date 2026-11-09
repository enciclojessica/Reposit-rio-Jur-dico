-- Artigos alterados depois de entrarem na base (09/11/2026), para o app de questões avisar a curadoria quando uma
-- questão cita um artigo que mudou depois da prova. Só lei, número, título e datas: o texto e os comentários não saem.
-- Conta como alteração a linha com `atualizado_em` pelo menos um dia depois de `criado_em` (`atualizado_em` muda só
-- quando o dispositivo muda; carga em lote, como CLT e CTN, fica de fora). Em 09/11/2026: 10 linhas (CF e CPC).
-- Roda com o dono da visão, como a `legislacao_publica`, para o leitor anônimo do outro app. Sem `drop` (o conector cancela).

create or replace view public.legislacao_alteracoes_publica as
select codigo,
       numero,
       titulo,
       min(criado_em) as criado_em,
       max(atualizado_em) as atualizado_em
from public.legislacao
where atualizado_em - criado_em >= interval '1 day'
group by codigo, numero, titulo;

-- Visão nova nasce com grants de escrita: só leitura.
revoke all on public.legislacao_alteracoes_publica from anon, authenticated;
grant select on public.legislacao_alteracoes_publica to anon, authenticated;

-- Conferência:
-- select * from public.legislacao_alteracoes_publica order by atualizado_em desc;
-- Reversão: revoke all on public.legislacao_alteracoes_publica from anon, authenticated; (e drop view no SQL Editor)
