-- Indicador de acurácia por comentário (23/10/2026, decisão da Jessica).
-- Cada caput com comentário (contexto e aplicacao_pratica) passa a guardar o nível de conferência, o resultado e a data:
--   comentario_conferencia: 'revisao_independente' (outro agente revisou contra o texto do artigo) ou 'conferido_titular' (conferido pela curadoria);
--   comentario_resultado: 'aprovado' (texto mantido como revisado) ou 'corrigido' (o revisor apontou imprecisão, genericidade ou trecho arriscado, o texto foi ajustado e os itens ajustados foram reconferidos por nova revisão);
--   comentario_conferido_em: data da conferência.
-- Os três são nulos ou os três preenchidos. Nulo = sem conferência registrada. Se contexto ou aplicacao_pratica mudar sem que o indicador
-- seja regravado no mesmo UPDATE, o gatilho zera o indicador (o selo nunca fica mais velho que o texto).
-- Quem já pode ler `legislacao` lê o selo (membros); a visão legislacao_publica não foi alterada e não expõe o selo.
-- Carga retroativa: Lei 15.040 (133 caputs, exceto o art. 133) e CTN (222 caputs), revisão de 23/10/2026.
-- Reversão: drop trigger trg_legislacao_zerar_conferencia on public.legislacao; drop function public.legislacao_zerar_conferencia();
--           alter table public.legislacao drop column comentario_conferencia, drop column comentario_resultado, drop column comentario_conferido_em;

alter table public.legislacao
  add column if not exists comentario_conferencia text,
  add column if not exists comentario_resultado text,
  add column if not exists comentario_conferido_em date;

alter table public.legislacao add constraint legislacao_conferencia_ck check (
  (comentario_conferencia is null and comentario_resultado is null and comentario_conferido_em is null)
  or (comentario_conferencia in ('revisao_independente','conferido_titular')
      and comentario_resultado in ('aprovado','corrigido') and comentario_conferido_em is not null));

create or replace function public.legislacao_zerar_conferencia() returns trigger
language plpgsql set search_path = public
as $f$
begin
  if (old.contexto is distinct from new.contexto or old.aplicacao_pratica is distinct from new.aplicacao_pratica)
     and new.comentario_conferencia is not distinct from old.comentario_conferencia
     and new.comentario_resultado is not distinct from old.comentario_resultado
     and new.comentario_conferido_em is not distinct from old.comentario_conferido_em then
    new.comentario_conferencia := null;
    new.comentario_resultado := null;
    new.comentario_conferido_em := null;
  end if;
  return new;
end
$f$;
revoke execute on function public.legislacao_zerar_conferencia() from public, anon, authenticated;

create trigger trg_legislacao_zerar_conferencia before update of contexto, aplicacao_pratica on public.legislacao
  for each row execute function public.legislacao_zerar_conferencia();

-- Lei 15.040: 133 caputs (todos exceto o art. 133): 42 ajustados após a revisão, 91 mantidos.
update public.legislacao l set comentario_conferencia='revisao_independente',
  comentario_resultado = case when (l.numero, coalesce(l.titulo,'')) in ((7,''), (8,''), (11,''), (12,''), (14,''), (16,''), (17,''), (18,''), (21,''), (23,''), (24,''), (27,''), (29,''), (30,''), (33,''), (42,''), (44,''), (45,''), (50,''), (51,''), (52,''), (54,''), (55,''), (56,''), (58,''), (59,''), (61,''), (63,''), (64,''), (72,''), (75,''), (77,''), (82,''), (86,''), (87,''), (88,''), (93,''), (96,''), (99,''), (118,''), (121,''), (126,'')) then 'corrigido' else 'aprovado' end,
  comentario_conferido_em = date '2026-10-23'
where l.codigo='lei15040' and l.paragrafo is null and l.inciso is null and l.vigente and l.numero <> 133;

-- CTN: 222 caputs: 36 ajustados após a revisão, 186 mantidos.
update public.legislacao l set comentario_conferencia='revisao_independente',
  comentario_resultado = case when (l.numero, coalesce(l.titulo,'')) in ((2,''), (5,''), (9,''), (10,''), (29,''), (48,''), (76,''), (85,''), (113,'Art. 113-A'), (114,''), (117,''), (119,''), (120,''), (122,''), (124,''), (129,''), (133,''), (136,''), (139,''), (140,''), (142,''), (146,''), (147,''), (148,''), (149,''), (157,''), (159,''), (162,''), (165,''), (171,''), (174,''), (175,''), (185,'Art. 185-A'), (187,''), (191,'Art. 191-A'), (195,'')) then 'corrigido' else 'aprovado' end,
  comentario_conferido_em = date '2026-10-23'
where l.codigo='ctn' and l.paragrafo is null and l.inciso is null and l.vigente;

