-- Registro da Lei 15.040/2024 no monitor de normas (sem drop). Reverter: delete from legislacao_versao where codigo='lei15040';
insert into legislacao_versao(codigo, nome, url_compilado, termos, n_linhas)
select 'lei15040', 'Marco Legal dos Seguros Privados', 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L15040.htm',
       array['Marco Legal dos Seguros','Lei nº 15.040'], 325
where not exists (select 1 from legislacao_versao where codigo='lei15040');
