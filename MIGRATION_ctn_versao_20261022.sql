-- Registro do CTN no monitor de normas (sem drop). Reverter: delete from legislacao_versao where codigo='ctn';
insert into legislacao_versao(codigo, nome, url_compilado, termos, n_linhas)
select 'ctn', 'Código Tributário Nacional', 'https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm',
       array['Código Tributário Nacional','Lei nº 5.172'], 806
where not exists (select 1 from legislacao_versao where codigo='ctn');
