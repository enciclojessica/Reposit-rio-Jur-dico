-- ADCT: lacunas de texto preenchidas a partir do compilado do Planalto enviado pela Jessica (15/10/2026).
-- Art. 76 §§ 1º e 3º (revogados pela EC 93/2016), art. 77, I, alíneas a e b (EC 29/2000),
-- art. 84, § 3º, II (revogado pela EC 42/2003). Redações superadas (tachadas na fonte) não entraram.
insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem) values
('adct',76,null,'1','§ 1º (Revogado). (Redação dada pela Emenda constitucional nº 93, de 2016) Produção de efeitos',null,false,'planalto.gov.br'),
('adct',76,null,'3','§ 3º (Revogado). (Redação dada pela Emenda constitucional nº 93, de 2016) Produção de efeitos',null,false,'planalto.gov.br'),
('adct',77,'I-a',null,'a) no ano 2000, o montante empenhado em ações e serviços públicos de saúde no exercício financeiro de 1999 acrescido de, no mínimo, cinco por cento; (Incluído pela Emenda Constitucional nº 29, de 2000)',null,true,'planalto.gov.br'),
('adct',77,'I-b',null,'b) do ano 2001 ao ano 2004, o valor apurado no ano anterior, corrigido pela variação nominal do Produto Interno Bruto - PIB; (Incluído pela Emenda Constitucional nº 29, de 2000)',null,true,'planalto.gov.br'),
('adct',84,'II','3','II - oito centésimos por cento, no exercício financeiro de 2004, quando será integralmente destinada ao Fundo de Combate e Erradicação da Pobreza, de que tratam os arts. 80 e 81 deste Ato das Disposições Constitucionais Transitórias. (Incluído pela Emenda Constitucional nº 37, de 2002) (Revogado pela Emenda Constitucional nº 42, de 19.12.2003)',null,false,'planalto.gov.br');
-- Reversão:
-- delete from legislacao where codigo='adct' and ((numero=76 and inciso is null and paragrafo in ('1','3') and titulo is null and texto like '§ _º (Revogado). (Redação dada pela Emenda constitucional nº 93%')
--   or (numero=77 and inciso in ('I-a','I-b') and paragrafo is null) or (numero=84 and inciso='II' and paragrafo='3'));
