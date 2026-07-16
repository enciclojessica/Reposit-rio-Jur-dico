-- MIGRATION: constraint única em flashcards(user_id, entrada_id)
-- Aplicada em produção (Supabase) em 16/07/2026.
--
-- Necessária para o upsert de repetição espaçada funcionar
-- (onConflict: 'user_id,entrada_id') — sem isso, cada avaliação de
-- flashcard criaria uma linha nova em vez de atualizar o nível/data
-- de próxima revisão já existente para aquela entrada.

alter table public.flashcards
  add constraint flashcards_user_entrada_unique unique (user_id, entrada_id);
