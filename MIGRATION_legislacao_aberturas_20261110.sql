-- Contador de aberturas de artigo da legislação (10/11/2026), para o painel de métricas ("Artigos mais abertos").
-- Só conta: código, número, título (artigo com letra), dia e total. NÃO guarda quem abriu, então não cria dado pessoal
-- novo (a Política de Privacidade não muda). Soma pela função `registrar_abertura_artigo`, chamada quando o modal do
-- artigo abre (`Legislacao.jsx`), e só conta para membro aprovado (`is_member()`). Leitura só para admin.

create table if not exists public.legislacao_aberturas (
  codigo text not null,
  numero integer not null,
  titulo text not null default '',
  dia date not null default current_date,
  aberturas integer not null default 0,
  primary key (codigo, numero, titulo, dia)
);

alter table public.legislacao_aberturas enable row level security;

create policy legislacao_aberturas_admin_read on public.legislacao_aberturas
  for select to authenticated using ((select public.is_admin()));

-- Tabela nova nasce com grants de escrita: anon sem nada; authenticated só lê (e a política limita ao admin).
revoke all on public.legislacao_aberturas from anon;
revoke insert, update, delete, truncate, references, trigger on public.legislacao_aberturas from authenticated;

create or replace function public.registrar_abertura_artigo(p_codigo text, p_numero integer, p_titulo text default null)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.is_member() then
    return;
  end if;
  if not exists (select 1 from public.legislacao l where l.codigo = p_codigo and l.numero = p_numero) then
    return;
  end if;
  insert into public.legislacao_aberturas (codigo, numero, titulo, dia, aberturas)
  values (p_codigo, p_numero, coalesce(p_titulo, ''), (now() at time zone 'America/Sao_Paulo')::date, 1)
  on conflict (codigo, numero, titulo, dia) do update set aberturas = public.legislacao_aberturas.aberturas + 1;
end;
$function$;

revoke execute on function public.registrar_abertura_artigo(text, integer, text) from public, anon;
grant execute on function public.registrar_abertura_artigo(text, integer, text) to authenticated;

-- Conferência: select * from public.legislacao_aberturas order by dia desc, aberturas desc limit 20;
-- Reversão (no SQL Editor): drop function public.registrar_abertura_artigo(text, integer, text); drop table public.legislacao_aberturas;
