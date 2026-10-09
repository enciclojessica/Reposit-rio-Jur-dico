-- Auditoria de 09/10/2026: correcoes aplicadas (ja gravadas no banco). Idempotente.
-- 1) Hifen com espaco (CF, ADCT)
update legislacao set texto = replace(texto,'data- limite','data-limite') where codigo='adct' and numero=47 and paragrafo='5';
update legislacao set texto = replace(texto,'bem- estar','bem-estar') where codigo='cf' and numero=182 and inciso is null and paragrafo is null;
update legislacao set texto = replace(texto,'não- profissional','não-profissional') where codigo='cf' and numero=217 and inciso='III' and paragrafo is null;
update legislacao set texto = replace(texto,'preservá- lo','preservá-lo') where codigo='cf' and numero=225 and inciso is null and paragrafo is null;
update legislacao set texto = replace(texto,'levar-se- á','levar-se-á') where codigo='cf' and numero=227 and paragrafo='7' and inciso is null;
-- 2) Citacao de lei padronizada
update legislacao set texto = replace(texto,'(Incluído Lei nº 14.690','(Incluído pela Lei nº 14.690') where codigo='cc' and numero=698 and paragrafo='único';
update legislacao set texto = replace(texto,'Lei nº 6.368, 1976','Lei nº 6.368, de 1976') where codigo='cp' and numero=281 and inciso is null and paragrafo is null;
update legislacao set texto = replace(texto,'(Redação dada Lei nº 13.688','(Redação dada pela Lei nº 13.688') where codigo='lei8906' and numero in (45,69);
-- 3) Datas de leis nos comentarios (conferidas: Lei 15.040 e de 9/12/2024; Lei 14.382 e de 27/6/2022, Planalto)
update legislacao set aplicacao_pratica = replace(aplicacao_pratica,'Lei nº 15.040, de 3 de dezembro de 2024','Lei nº 15.040, de 9 de dezembro de 2024') where codigo='cc' and aplicacao_pratica like '%Lei nº 15.040, de 3 de dezembro de 2024%';
update legislacao set aplicacao_pratica = replace(aplicacao_pratica,'Lei nº 14.382, de 27 de dezembro de 2022','Lei nº 14.382, de 27 de junho de 2022') where codigo='cc' and numero=980 and aplicacao_pratica like '%Lei nº 14.382, de 27 de dezembro de 2022%';
