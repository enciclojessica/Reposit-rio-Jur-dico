-- Comentários da legislação restritos a membros (21/10/2026), com amostra pública.
-- Antes, a política legislacao_public_read (SELECT para todos, true) deixava contexto, aplicacao_pratica e resultado
-- legíveis sem login. Agora: a tabela `legislacao` só é legível por membro aprovado; o público lê pela visão
-- `legislacao_publica`, que traz o texto da lei e só devolve os comentários nos artigos marcados em `comentario_publico`.
-- Sem DROP (o conector cancela blocos com drop).
--
-- ORDEM: aplicar os passos 1 a 3 (aditivos) antes do deploy do código novo; o passo 4 (política) só DEPOIS de o
-- código novo (LegislacaoPublica, api/legislacao.js e contagem do App lendo `legislacao_publica`) estar em produção.

-- 1) Marca de amostra pública (por linha do caput).
alter table public.legislacao add column if not exists comentario_publico boolean not null default false;

-- 2) Visão pública: texto da lei para todos; comentários só nas linhas de amostra. Roda com os direitos do dono
--    (de propósito: é ela que contorna a política da tabela, expondo apenas estas colunas).
create or replace view public.legislacao_publica as
select
  id, codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem, criado_em, busca_tsv, rotulo,
  atualizado_em, vigencia_obs, comentario_publico,
  case when comentario_publico then contexto end as contexto,
  case when comentario_publico then aplicacao_pratica end as aplicacao_pratica,
  case when comentario_publico then resultado end as resultado
from public.legislacao;
grant select on public.legislacao_publica to anon, authenticated;

-- 3) Amostra inicial (caputs vigentes com comentário, fora de CC, CDC, CP, CPC e Lei 9.099, que só mudam com
--    autorização expressa): CF 5 e 37, CLT 58, CPP 5 e 312, CTB 165, LEP 1 e 112.
update public.legislacao set comentario_publico = true
where vigente and inciso is null and paragrafo is null and titulo is null and contexto is not null
  and ((codigo = 'cf' and numero in (5, 37)) or (codigo = 'clt' and numero = 58)
    or (codigo = 'cpp' and numero in (5, 312)) or (codigo = 'ctb' and numero = 165)
    or (codigo = 'lep' and numero in (1, 112)));

-- 4) (SÓ DEPOIS DO DEPLOY) A tabela passa a ser legível apenas por membro aprovado.
-- alter policy legislacao_public_read on public.legislacao to authenticated using (is_member());

-- Reversão do passo 4 (volta ao acesso público à tabela):
-- alter policy legislacao_public_read on public.legislacao to public using (true);
-- Reversão total (remover a visão e a coluna exige DROP; rodar no SQL Editor):
-- drop view public.legislacao_publica; alter table public.legislacao drop column comentario_publico;
