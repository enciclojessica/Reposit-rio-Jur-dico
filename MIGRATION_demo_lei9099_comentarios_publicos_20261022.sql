-- Demonstração pública (/?demo=1), 22/10/2026.
-- Libera ao público (visão legislacao_publica) o comentário didático e a aplicação
-- prática dos caputs vigentes da Lei 9.099/95. Pedido pela Jessica na demonstração
-- ("pode ser a demonstração mais completa"); a Lei 9.099 é padrão de referência dela.
-- Aplicar no SQL Editor do Supabase (o conector costuma cancelar UPDATE).
update legislacao
   set comentario_publico = true
 where codigo = 'lei9099'
   and vigente = true
   and titulo is null and paragrafo is null and inciso is null
   and (contexto is not null or aplicacao_pratica is not null);

-- Conferência (esperado: 96 linhas):
-- select count(*) from legislacao_publica where codigo = 'lei9099' and contexto is not null;

-- Reversão:
-- update legislacao set comentario_publico = false where codigo = 'lei9099';

-- Entradas #jec publicadas na demonstração (22/10/2026): as 14 mais usadas em ações
-- consumeristas e mais desenvolvidas (tese, ratio e aplicação prática), todas súmulas do STJ,
-- Tema 466, Informativo 788 e FONAJE 26. Ficaram de fora, por ora: golpe da falsa central
-- (data do julgamento a confirmar), golpe do acesso remoto e superendividamento no JEC
-- (fonte a conferir) e o mínimo existencial (STF).
update entradas set publica = true
 where 'jec' = any(tags)
   and id in ('2efd6914-a887-4aed-a2ee-01edfb7e9950','1638bcb6-2e8f-41ff-823e-5b81dc5367a2','da69c7f8-6012-4c1e-90c6-85c22f5f2f63','7fd90be8-1d41-4a1e-a2df-4db2514065f9','d9590b0c-f1bd-4352-85c6-1abf3d17b74a','03129996-c557-49dc-9737-574bf29f932b','3d6a6db7-27ce-44e1-af4f-52ee48a47c18','1f74f597-372d-402a-b95e-29bfc531804c','5cf67907-babb-4877-a244-93ba4def4350','8f024ade-4db0-42a7-ac5d-17399c0e405e','5802c317-e56b-4ce8-82a1-27d6718e5b2b','0bfb4a49-b3d1-4fc0-8983-369f6cc83313','f72b48f0-c1b6-4f04-9328-ff66321822a3','18289941-106c-471c-9048-e5b964d17dad');
-- Reversão: o mesmo update com publica = false.

-- Depois ("pode incluir todas", 22/10/2026): as 28 entradas #jec ficaram públicas.
update entradas set publica = true where 'jec' = any(tags) and publica = false;
-- Atenção: inclui a decisão do STJ sobre golpe da falsa central (data do julgamento
-- ainda a confirmar no inteiro teor) e as entradas de fonte a conferir.
