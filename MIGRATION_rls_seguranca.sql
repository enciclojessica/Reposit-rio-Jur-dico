-- MIGRATION: Corrige RLS permissivo demais em membros, convites e legislacao
-- Aplicada em produção (Supabase) em 16/07/2026.
--
-- Problema encontrado: as políticas antigas (membros_all_auth,
-- convites_all_auth) permitiam que QUALQUER usuário autenticado — inclusive
-- papel "leitor" — inserisse/atualizasse/apagasse linhas em `membros` e
-- `convites`, direto via API do Supabase (sem passar pelas rotas /api/*).
-- Na prática, um usuário logado podia chamar supabase.from('membros')
-- .update({role:'admin'}) sobre a própria linha e se autopromover a admin,
-- ou ler o token de um convite pendente de outra pessoa em `convites` e
-- se aceitar no lugar dela.

-- ── Funções auxiliares ──────────────────────────────────────────────────
create or replace function public.is_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from public.membros m where m.user_id = auth.uid() and m.role = 'admin')
$$;

create or replace function public.is_editor_or_admin() returns boolean
language sql security definer stable as $$
  select exists (select 1 from public.membros m where m.user_id = auth.uid() and m.role in ('admin','editor'))
$$;

-- ── Trigger: impede autoescalação de papel mesmo com auto-edição liberada ──
create or replace function public.prevent_role_self_escalation() returns trigger
language plpgsql security definer as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Apenas administradores podem alterar o papel de um membro.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_self_escalation on public.membros;
create trigger trg_prevent_role_self_escalation
before update on public.membros
for each row execute function public.prevent_role_self_escalation();

-- ── membros: self-update (perfil próprio) ou admin; insert/delete só admin ──
drop policy if exists membros_all_auth on public.membros;
create policy membros_update on public.membros for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy membros_insert on public.membros for insert
  with check (public.is_admin());
create policy membros_delete on public.membros for delete
  using (public.is_admin());
-- membros_select (leitura pública) permanece inalterada.

-- ── convites: só admin, em tudo (evita exposição do token) ──────────────
drop policy if exists convites_all_auth on public.convites;
create policy convites_admin_only on public.convites for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── legislacao: escrita só admin/editor; leitura pública mantida ────────
drop policy if exists legislacao_auth_write on public.legislacao;
drop policy if exists legislacao_auth_update on public.legislacao;
create policy legislacao_editor_write on public.legislacao for insert
  with check (public.is_editor_or_admin());
create policy legislacao_editor_update on public.legislacao for update
  using (public.is_editor_or_admin());
