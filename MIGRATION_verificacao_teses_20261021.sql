-- Verificação de teses e doutrinas, 21/10/2026. O conector cancelou estes UPDATEs (texto existente). Rodar no SQL Editor do Supabase.
-- Já aplicados pelo conector: b46c03ed (fonte), c9cf09e0 (referencia e url).

-- Súmula 545/STJ: confirmada a revisão (REsp 2.001.973/RS, Tema 1194, Terceira Seção, 10/09/2025, Rel. Min. Og Fernandes).
-- A tese antiga dizia "retratada ou não"; a tese do Tema 1194 exclui a confissão retratada, salvo se serviu para apurar os fatos.
update entradas set teses = jsonb_set(jsonb_set(jsonb_set(teses,'{0,ratio_decidendi}', to_jsonb('Redação atual, decorrente do julgamento do REsp 2.001.973/RS (Tema Repetitivo 1194, Terceira Seção, 10/09/2025, Rel. Min. Og Fernandes): a confissão do autor possibilita a atenuação da pena prevista no art. 65, III, d, do CP, independentemente de ter sido utilizada na formação do convencimento do julgador, mesmo havendo outras provas. Em caso de retratação, a atenuante só se aplica se a confissão inicial serviu para apurar os fatos. Na confissão parcial ou qualificada a atenuação é menor e não pode preponderar sobre agravantes quando o fato confessado tiver pena menor ou configurar excludente de tipicidade, ilicitude ou culpabilidade. A redação original (2015) exigia que a confissão tivesse sido utilizada pelo julgador para formar o convencimento; essa exigência foi eliminada.'::text)),
  '{0,aplicacao_pratica}', to_jsonb('Arguir a atenuante sempre que houver confissão nos autos, ainda que a sentença não a tenha usado como fundamento da condenação. Se o réu se retratou, demonstrar que a confissão inicial contribuiu para apurar os fatos. Na confissão parcial ou qualificada, pedir a atenuante sabendo que a redução tende a ser menor. Os efeitos prejudiciais da nova tese alcançam apenas fatos posteriores à publicação do acórdão do Tema 1194.'::text)),
  '{0,precedente_sumula}', to_jsonb('STJ, Súmula 545 (redação revisada em 2025); REsp 2.001.973/RS, Tema Repetitivo 1194'::text))
where id::text like 'b46c03ed%';

-- REsp 2.209.868 (c9cf09e0): a notícia do caso é de 15/07/2026 e o acórdão foi publicado em 24/06/2026 (link do acórdão na notícia);
-- "maio/2026" não se confirmou.
update entradas set fonte = 'STJ, Terceira Turma, unânime; acórdão publicado em 24/06/2026 (data do julgamento a confirmar no inteiro teor); notícia do STJ de 15/07/2026'
where id::text like 'c9cf09e0%';
