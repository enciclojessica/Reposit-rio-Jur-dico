-- CF conforme as Emendas Constitucionais 140 e 141, ambas de 16/10/2026 (texto dos PDFs do Planalto enviados pela Jessica em 21/10/2026).
-- Convenção da CF no banco: texto limpo, sem anotações de emenda; parágrafos com letra sem ponto após o rótulo ("§ 4º-A Poderão"); § 10 em diante com ponto.
-- O gatilho trg_legislacao_historico guarda a redação anterior. Os dispositivos transitórios das emendas (EC 140 arts. 2º a 13; EC 141 arts. 2º a 10) não fazem parte do texto da CF e não entram em `legislacao`.
-- Vigência: EC 140, art. 14: na data da publicação. EC 141, art. 10: o inciso XV do art. 7º após 2 meses da publicação; os demais dispositivos na publicação.
-- Reexecutável: cada UPDATE tem guarda pelo id e cada INSERT só ocorre se a linha não existir.
begin;

-- ===== EC 141: art. 7º =====
update legislacao set texto = 'XIII - duração do trabalho normal não superior a 8 (oito) horas diárias e 40 (quarenta) horas semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho;',
  aplicacao_pratica = 'Jornada normal máxima de 8 horas diárias e 40 horas semanais, com compensação de horários e redução da jornada por acordo ou convenção coletiva. A EC 141/2026 (art. 6º) implementa a redução de forma progressiva: até 42 horas semanais 2 meses após a publicação (16/10/2026) e 40 horas semanais 1 ano após o decurso desse prazo.'
 where id = '89ac202f-6f10-459b-b9cc-48f6e2c3f2a8' and codigo = 'cf' and numero = 7 and inciso = 'XIII';

update legislacao set texto = 'XV - repouso semanal remunerado de 2 (dois) dias, um dos quais preferencialmente aos domingos;',
  aplicacao_pratica = 'Repouso semanal remunerado de 2 dias, um deles preferencialmente aos domingos. Pelo art. 10, I, da EC 141/2026, a alteração deste inciso entra em vigor 2 meses após a publicação da emenda (16/10/2026).'
 where id = '6b3b9e08-8ac0-41cf-862a-3f452c11e912' and codigo = 'cf' and numero = 7 and inciso = 'XV';

update legislacao set paragrafo = '1', texto = replace(texto, 'Parágrafo único. ', '§ 1º ')
 where id = 'ad127243-d7f8-4cb1-a8f2-795b5012050a' and codigo = 'cf' and numero = 7 and paragrafo = 'único';

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cf', 7, null, '2', '§ 2º Excepcionalmente, convenção ou acordo coletivo de trabalho poderão, inclusive para os trabalhadores sujeitos a regimes diferenciados de trabalho estabelecidos em lei ou norma regulamentadora, estabelecer regime compensatório que assegure, na média, 2 (dois) dias de repouso semanal remunerado dentro do mês-calendário, garantido o gozo de pelo menos 1 (um) dos dias dentro do período máximo de 1 (uma) semana de trabalho.', null, true, 'planalto.gov.br'
where not exists (select 1 from legislacao where codigo = 'cf' and numero = 7 and paragrafo = '2' and inciso is null);

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cf', 7, null, '3', '§ 3º Lei poderá dispor sobre hipóteses e condições em que a duração do trabalho e os dias de repouso semanal remunerado poderão observar regimes diferenciados, respeitados os limites previstos nos incisos XIII, XIV e XV do caput deste artigo.', null, true, 'planalto.gov.br'
where not exists (select 1 from legislacao where codigo = 'cf' and numero = 7 and paragrafo = '3' and inciso is null);

-- ===== EC 140: arts. 40, 198 e 201 =====
update legislacao set texto = '§ 4º É vedada a adoção de requisitos ou critérios diferenciados para concessão de benefícios em regime próprio de previdência social, ressalvado o disposto nos §§ 4º-A, 4º-B, 4º-C, 5º e 5º-A deste artigo.'
 where id = 'f5dbac13-b66e-45cf-aeb2-73ecad85ffb1' and codigo = 'cf' and numero = 40 and paragrafo = '4' and inciso is null;

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cf', 40, null, '5-A', '§ 5º-A O requisito de idade a que se refere o inciso III do § 1º deste artigo será de 57 (cinquenta e sete) anos de idade, se mulher, e 60 (sessenta) anos de idade, se homem, para o agente comunitário de saúde e o agente de combate às endemias que comprovem o mínimo de 25 (vinte e cinco) anos de tempo de contribuição e de efetivo exercício na respectiva atividade profissional.', null, true, 'planalto.gov.br'
where not exists (select 1 from legislacao where codigo = 'cf' and numero = 40 and paragrafo = '5-A' and inciso is null);

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cf', 198, 'IV', null, 'IV - atuação obrigatória e permanente de agentes comunitários de saúde e de agentes de combate às endemias, cuja atividade é essencial ao sistema único de saúde e exclusiva de Estado.', null, true, 'planalto.gov.br'
where not exists (select 1 from legislacao where codigo = 'cf' and numero = 198 and inciso = 'IV' and paragrafo is null);

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cf', 198, null, '4-A', '§ 4º-A É vedada a contratação temporária ou terceirizada de agentes comunitários de saúde e de agentes de combate às endemias, salvo a hipótese de emergência em saúde pública, na forma da lei.', null, true, 'planalto.gov.br'
where not exists (select 1 from legislacao where codigo = 'cf' and numero = 198 and paragrafo = '4-A' and inciso is null);

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cf', 198, null, '4-B', '§ 4º-B Os agentes de que trata o § 4º deste artigo submetem-se ao regime jurídico dos servidores nomeados para cargo de provimento efetivo.', null, true, 'planalto.gov.br'
where not exists (select 1 from legislacao where codigo = 'cf' and numero = 198 and paragrafo = '4-B' and inciso is null);

update legislacao set texto = '§ 10. Os agentes comunitários de saúde e os agentes de combate às endemias terão, em razão dos riscos inerentes às funções desempenhadas, direito à aposentadoria mediante requisitos diferenciados, na forma do § 5º-A do art. 40 e do § 8º-A do art. 201 desta Constituição, e ao adicional de insalubridade.'
 where id = '2c828cc2-cbd9-4a1d-b08f-a5f1a3f79ae9' and codigo = 'cf' and numero = 198 and paragrafo = '10' and inciso is null;

insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cf', 201, null, '8-A', '§ 8º-A O requisito de idade a que se refere o inciso I do § 7º deste artigo será de 57 (cinquenta e sete) anos de idade, se mulher, e 60 (sessenta) anos de idade, se homem, para o agente comunitário de saúde e o agente de combate às endemias que comprovem o mínimo de 25 (vinte e cinco) anos de tempo de contribuição e de efetivo exercício na respectiva atividade profissional.', null, true, 'planalto.gov.br'
where not exists (select 1 from legislacao where codigo = 'cf' and numero = 201 and paragrafo = '8-A' and inciso is null);

-- ===== Alertas =====
update legislacao_alertas set status = 'aplicado', observacao = 'Aplicada com o texto do PDF da EC 140 enviado pela Jessica em 21/10/2026 (MIGRATION_cf_ec140_ec141_20261021.sql).' where tipo = 'ec' and numero = '140';
update legislacao_alertas set status = 'aplicado', observacao = 'Aplicada com o texto do PDF da EC 141 enviado pela Jessica em 21/10/2026 (MIGRATION_cf_ec140_ec141_20261021.sql).' where tipo = 'ec' and numero = '141';

commit;

-- Conferência (esperado: 12 linhas; a redação anterior fica em legislacao_historico, 6 linhas):
-- select numero, inciso, paragrafo, left(texto, 60) from legislacao where codigo = 'cf' and ((numero = 7 and (inciso in ('XIII','XV') or paragrafo in ('1','2','3'))) or (numero = 40 and paragrafo in ('4','5-A')) or (numero = 198 and (inciso = 'IV' or paragrafo in ('4-A','4-B','10'))) or (numero = 201 and paragrafo = '8-A')) order by numero, paragrafo nulls first, inciso;
-- select count(*) from legislacao_historico where codigo = 'cf' and registrado_em > now() - interval '1 hour';

-- Reversão (a redação anterior também está em legislacao_historico):
-- update legislacao set texto = 'XIII - duração do trabalho normal não superior a oito horas diárias e quarenta e quatro semanais, facultada a compensação de horários e a redução da jornada, mediante acordo ou convenção coletiva de trabalho;', aplicacao_pratica = 'Jornada máxima constitucional: 8h diárias e 44h semanais.' where id = '89ac202f-6f10-459b-b9cc-48f6e2c3f2a8';
-- update legislacao set texto = 'XV - repouso semanal remunerado, preferencialmente aos domingos;', aplicacao_pratica = '' where id = '6b3b9e08-8ac0-41cf-862a-3f452c11e912';
-- update legislacao set paragrafo = 'único', texto = replace(texto, '§ 1º ', 'Parágrafo único. ') where id = 'ad127243-d7f8-4cb1-a8f2-795b5012050a';
-- update legislacao set texto = '§ 4º É vedada a adoção de requisitos ou critérios diferenciados para concessão de benefícios em regime próprio de previdência social, ressalvado o disposto nos §§ 4º-A, 4º-B, 4º-C e 5º.' where id = 'f5dbac13-b66e-45cf-aeb2-73ecad85ffb1';
-- update legislacao set texto = '§ 10. Os agentes comunitários de saúde e os agentes de combate às endemias terão também, em razão dos riscos inerentes às funções desempenhadas, aposentadoria especial e, somado aos seus vencimentos, adicional de insalubridade.' where id = '2c828cc2-cbd9-4a1d-b08f-a5f1a3f79ae9';
-- delete from legislacao where codigo = 'cf' and ((numero = 7 and paragrafo in ('2','3') and inciso is null) or (numero = 40 and paragrafo = '5-A') or (numero = 198 and ((inciso = 'IV' and paragrafo is null) or paragrafo in ('4-A','4-B'))) or (numero = 201 and paragrafo = '8-A')) and criado_em > now() - interval '1 day';
-- update legislacao_alertas set status = 'pendente' where tipo = 'ec' and numero in ('140','141');
