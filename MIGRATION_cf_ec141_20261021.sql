-- CF art. 7º conforme a Emenda Constitucional nº 141, de 16/10/2026 (texto do PDF do Planalto enviado pela Jessica em 21/10/2026).
-- Convenção da CF no banco: texto limpo, sem anotações de emenda. O gatilho trg_legislacao_historico guarda a redação anterior.
-- Vigência (EC 141, art. 10): o inciso XV entra em vigor 2 meses após a publicação; os demais dispositivos, na publicação.
-- Os arts. 2º a 10 da EC (transitórios) não fazem parte do texto da CF e não entram em `legislacao`.

update legislacao set texto = 'XIII - duração do trabalho normal não superior a 8 (oito) horas diárias e 40 (quarenta) horas semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho;'
 where id = '89ac202f-6f10-459b-b9cc-48f6e2c3f2a8' and codigo = 'cf' and numero = 7 and inciso = 'XIII';

update legislacao set texto = 'XV - repouso semanal remunerado de 2 (dois) dias, um dos quais preferencialmente aos domingos;'
 where id = '6b3b9e08-8ac0-41cf-862a-3f452c11e912' and codigo = 'cf' and numero = 7 and inciso = 'XV';

-- Parágrafo único passa a § 1º (EC 141, art. 1º: "numerado o parágrafo único como § 1º").
update legislacao set paragrafo = '1', texto = replace(texto, 'Parágrafo único. ', '§ 1º ')
 where id = 'ad127243-d7f8-4cb1-a8f2-795b5012050a' and codigo = 'cf' and numero = 7 and paragrafo = 'único';

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem) values
('cf', 7, null, '2', '§ 2º Excepcionalmente, convenção ou acordo coletivo de trabalho poderão, inclusive para os trabalhadores sujeitos a regimes diferenciados de trabalho estabelecidos em lei ou norma regulamentadora, estabelecer regime compensatório que assegure, na média, 2 (dois) dias de repouso semanal remunerado dentro do mês-calendário, garantido o gozo de pelo menos 1 (um) dos dias dentro do período máximo de 1 (uma) semana de trabalho.', null, true, 'planalto.gov.br'),
('cf', 7, null, '3', '§ 3º Lei poderá dispor sobre hipóteses e condições em que a duração do trabalho e os dias de repouso semanal remunerado poderão observar regimes diferenciados, respeitados os limites previstos nos incisos XIII, XIV e XV do caput deste artigo.', null, true, 'planalto.gov.br');

-- Comentários dos incisos alterados (só a partir do texto da EC; o art. 6º da EC implementa a redução de forma progressiva).
update legislacao set aplicacao_pratica = 'Jornada normal máxima de 8 horas diárias e 40 horas semanais, com compensação de horários e redução da jornada por acordo ou convenção coletiva. A EC 141/2026 (art. 6º) implementa a redução de forma progressiva: até 42 horas semanais 2 meses após a publicação (16/10/2026) e 40 horas semanais 1 ano após o decurso desse prazo.'
 where id = '89ac202f-6f10-459b-b9cc-48f6e2c3f2a8' and codigo = 'cf' and numero = 7 and inciso = 'XIII';
update legislacao set aplicacao_pratica = 'Repouso semanal remunerado de 2 dias, um deles preferencialmente aos domingos. Pelo art. 10, I, da EC 141/2026, a alteração deste inciso entra em vigor 2 meses após a publicação da emenda (16/10/2026).'
 where id = '6b3b9e08-8ac0-41cf-862a-3f452c11e912' and codigo = 'cf' and numero = 7 and inciso = 'XV';

update legislacao_alertas set status = 'aplicado', observacao = 'Aplicada com o texto do PDF da EC 141 enviado pela Jessica em 21/10/2026 (MIGRATION_cf_ec141_20261021.sql).' where tipo = 'ec' and numero = '141';

-- Reversão (a redação anterior também está em legislacao_historico):
-- update legislacao set texto = 'XIII - duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho;', aplicacao_pratica = 'Jornada máxima constitucional: 8h diárias e 44h semanais.' where id = '89ac202f-6f10-459b-b9cc-48f6e2c3f2a8';
-- update legislacao set texto = 'XV - repouso semanal remunerado, preferencialmente aos domingos;', aplicacao_pratica = '' where id = '6b3b9e08-8ac0-41cf-862a-3f452c11e912';
-- update legislacao set paragrafo = 'único', texto = replace(texto, '§ 1º ', 'Parágrafo único. ') where id = 'ad127243-d7f8-4cb1-a8f2-795b5012050a';
-- delete from legislacao where codigo = 'cf' and numero = 7 and paragrafo in ('2','3') and inciso is null and texto like '§ _º %';
