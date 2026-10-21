-- Registro da CLT no monitor de normas (sem drop). Reverter: delete from legislacao_versao where codigo='clt';
insert into legislacao_versao(codigo, nome, url_compilado, termos, n_linhas)
select 'clt', 'Consolidação das Leis do Trabalho', 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
       array['Consolidação das Leis do Trabalho','Decreto-Lei nº 5.452'], 3216
where not exists (select 1 from legislacao_versao where codigo='clt');
