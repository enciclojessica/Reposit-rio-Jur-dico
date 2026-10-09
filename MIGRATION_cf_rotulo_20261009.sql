-- CF: o campo `titulo` passa a ser so para artigos com letra ("Art. 29-A"). Os rotulos tematicos
-- (ex.: "Principios da Administracao Publica (LIMPE)") vao para a nova coluna `rotulo`, exibida como
-- subtitulo do cartao. Corrige o art. 5 dividido em varios cartoes. Ja aplicado em 09/10/2026.
alter table public.legislacao add column if not exists rotulo text;

create or replace function public.legislacao_tsv_trigger() returns trigger language plpgsql set search_path to 'public' as $function$
begin
  new.busca_tsv :=
    to_tsvector('portuguese',
      coalesce(new.titulo, '') || ' ' ||
      coalesce(new.rotulo, '') || ' ' ||
      coalesce(new.texto, '') || ' ' ||
      coalesce(new.contexto, '') || ' ' ||
      coalesce(new.aplicacao_pratica, '')
    );
  return new;
end;
$function$;

-- O caput do art. 5 tinha o rotulo "Isonomia (caput)", que descrevia so o caput e nao o artigo todo: nao e migrado.
-- Os rotulos de incisos do art. 5 (LIV Devido processo legal, LV Contraditorio e ampla defesa,
-- XXXV Inafastabilidade da jurisdicao, XXXVI Direito adquirido, ato juridico perfeito e coisa julgada,
-- LVII Presuncao de inocencia) ficam guardados em `rotulo` das proprias linhas.
update legislacao set
  rotulo = case when numero=5 and inciso is null and paragrafo is null then null else titulo end,
  titulo = null
where codigo='cf' and coalesce(titulo,'')<>'' and titulo !~ '^Art\. [0-9]+-[A-Z]+';
