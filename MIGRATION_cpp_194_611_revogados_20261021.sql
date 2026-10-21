-- CPP: arts. 194 e 611 não constam do texto compilado do Planalto (conferido em 21/10/2026).
-- Revogação verificada nas normas originais: Lei 10.792/2003, art. 10 ("Revoga-se o art. 194 do Decreto-Lei no 3.689, de 3 de outubro de 1941");
-- Decreto-Lei 552/1969, art. 2º (declara revogado "o artigo 611 do Código de Processo Penal"), D.O.U. de 28.4.1969.
insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem) values
('cpp',194,null,null,'Art. 194. (Revogado pela Lei nº 10.792, de 2003)',null,false,'planalto.gov.br'),
('cpp',611,null,null,'Art. 611. (Revogado pelo Decreto-Lei nº 552, de 1969)',null,false,'planalto.gov.br');
-- Reversão:
-- delete from legislacao where codigo='cpp' and numero in (194,611) and inciso is null and paragrafo is null and vigente = false;
