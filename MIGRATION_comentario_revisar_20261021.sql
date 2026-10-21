-- Marca "comentário em revisão" quando o texto de um artigo muda (21/10/2026).
alter table public.legislacao add column if not exists comentario_revisar boolean not null default false;

create or replace function public.legislacao_marcar_revisao() returns trigger
language plpgsql security definer set search_path = public
as $f$
begin
  if tg_op = 'UPDATE' and old.texto is not distinct from new.texto and old.vigente is not distinct from new.vigente then
    return new;
  end if;
  update public.legislacao set comentario_revisar = true
   where codigo = new.codigo and numero = new.numero and titulo is not distinct from new.titulo
     and inciso is null and paragrafo is null and contexto is not null and comentario_revisar = false;
  return new;
end
$f$;

create trigger trg_legislacao_revisao after insert or update on public.legislacao
  for each row execute function public.legislacao_marcar_revisao();

-- Marcação retroativa das alterações de 21/10/2026 (EC 140 e 141): caputs de CF 7, 40, 198 e 201.
update public.legislacao set comentario_revisar = true
 where codigo = 'cf' and numero in (7, 40, 198, 201) and inciso is null and paragrafo is null and contexto is not null;

-- Reversão: drop trigger trg_legislacao_revisao on public.legislacao; drop function public.legislacao_marcar_revisao();
--           alter table public.legislacao drop column comentario_revisar;
