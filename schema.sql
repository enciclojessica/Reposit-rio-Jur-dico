-- ============================================================
-- REPOSITÓRIO JURÍDICO — Schema Supabase
-- Cole este conteúdo no SQL Editor do Supabase e execute
-- ============================================================

-- Tabela principal de entradas
create table public.entradas (
  id          uuid primary key default gen_random_uuid(),
  area        text not null check (area in ('Cível','Penal','Informativo','Doutrina')),
  tema        text not null,
  tipo        text not null check (tipo in ('jurisprudência','doutrina','súmula','lei')),
  fonte       text not null default '',
  referencia  text not null default '',
  url         text not null default '',
  teses       jsonb not null default '[]'::jsonb,
  criado_por  uuid references auth.users(id) on delete set null,
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Índices para busca rápida
create index idx_entradas_area on public.entradas(area);
create index idx_entradas_tipo on public.entradas(tipo);
create index idx_entradas_tema on public.entradas using gin(to_tsvector('portuguese', tema));

-- Trigger para atualizar atualizado_em automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger on_entradas_updated
  before update on public.entradas
  for each row execute procedure public.handle_updated_at();

-- Row Level Security
alter table public.entradas enable row level security;

-- Qualquer usuário autenticado pode ler
create policy "Leitura para usuários autenticados"
  on public.entradas for select
  to authenticated using (true);

-- Qualquer usuário autenticado pode inserir
create policy "Inserção para usuários autenticados"
  on public.entradas for insert
  to authenticated with check (true);

-- Qualquer usuário autenticado pode editar (equipe interna)
create policy "Edição para usuários autenticados"
  on public.entradas for update
  to authenticated using (true);

-- Qualquer usuário autenticado pode excluir
create policy "Exclusão para usuários autenticados"
  on public.entradas for delete
  to authenticated using (true);
