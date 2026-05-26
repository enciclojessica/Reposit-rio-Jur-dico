-- ═══════════════════════════════════════════════════════════
-- MIGRAÇÃO: Sistema de membros e convites
-- Rodar no SQL Editor do Supabase (uma vez)
-- ═══════════════════════════════════════════════════════════

-- 1. Tabela de membros
CREATE TABLE IF NOT EXISTS membros (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role        TEXT CHECK (role IN ('admin', 'editor', 'leitor')) DEFAULT 'leitor' NOT NULL,
  nome        TEXT,
  email       TEXT,
  invited_by  UUID REFERENCES auth.users(id),
  criado_em   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Tabela de convites
CREATE TABLE IF NOT EXISTS convites (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token       TEXT UNIQUE DEFAULT gen_random_uuid()::text NOT NULL,
  email       TEXT,
  role        TEXT CHECK (role IN ('editor', 'leitor')) DEFAULT 'leitor' NOT NULL,
  invited_by  UUID REFERENCES auth.users(id) NOT NULL,
  status      TEXT CHECK (status IN ('pendente', 'aceito')) DEFAULT 'pendente' NOT NULL,
  expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days' NOT NULL,
  criado_em   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. RLS — membros
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;

-- Qualquer membro autenticado pode ver a lista de membros
CREATE POLICY "membros_select" ON membros FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM membros));

-- Só admin pode alterar roles ou remover
CREATE POLICY "membros_update" ON membros FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM membros WHERE role = 'admin'));

CREATE POLICY "membros_delete" ON membros FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM membros WHERE role = 'admin')
    AND user_id != auth.uid()
  );

-- Service role (serverless function) pode inserir (aceitar convite)
-- Não colocamos policy de INSERT aqui — a função usa service_role key

-- 4. RLS — convites
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "convites_admin_all" ON convites FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM membros WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM membros WHERE role = 'admin'));

-- 5. Atualizar RLS das entradas para respeitar roles
-- Leitores podem ler; editores e admins podem inserir; só admin/criador pode deletar

DROP POLICY IF EXISTS "entradas_select" ON entradas;
DROP POLICY IF EXISTS "entradas_insert" ON entradas;
DROP POLICY IF EXISTS "entradas_update" ON entradas;
DROP POLICY IF EXISTS "entradas_delete" ON entradas;

-- Qualquer membro (ou acesso público se você quiser manter) pode ler
CREATE POLICY "entradas_select" ON entradas FOR SELECT USING (true);

-- Editor e admin podem inserir
CREATE POLICY "entradas_insert" ON entradas FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM membros WHERE role IN ('admin', 'editor')
  ));

-- Editor só edita o que criou; admin edita tudo
CREATE POLICY "entradas_update" ON entradas FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM membros WHERE role = 'admin')
    OR (
      auth.uid() IN (SELECT user_id FROM membros WHERE role = 'editor')
      AND criado_por = auth.uid()
    )
  );

-- Só admin deleta
CREATE POLICY "entradas_delete" ON entradas FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM membros WHERE role = 'admin'));

-- 6. INSERIR JESSICA COMO ADMIN
-- Substitua o email abaixo pelo email real da conta e rode após o login
-- (o user_id aparece em Authentication > Users no painel do Supabase)
--
-- INSERT INTO membros (user_id, role, nome, email)
-- VALUES ('COLE_AQUI_O_UUID_DO_SEU_USER', 'admin', 'Jessica Farias Fusquiani', 'foxjessica01@gmail.com');
