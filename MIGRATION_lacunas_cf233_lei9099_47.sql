-- CF art. 233 (revogado pela EC 28/2000) e Lei 9.099 art. 47 (vetado). Texto conforme o compilado do Planalto enviado pela Jessica em 09/10/2026.
-- Idempotente.
insert into legislacao (codigo, numero, inciso, paragrafo, texto, vigente, origem)
select v.codigo, v.numero, null, v.paragrafo, v.texto, false, 'planalto.gov.br'
from (values
 ('cf', 233, null::text, 'Art. 233. Para efeito do art. 7º, XXIX, o empregador rural comprovará, de cinco em cinco anos, perante a Justiça do Trabalho, o cumprimento das suas obrigações trabalhistas para com o empregado rural, na presença deste e de seu representante sindical. (Revogado pela Emenda Constitucional nº 28, de 25/05/2000)'),
 ('cf', 233, '1', '§ 1º Uma vez comprovado o cumprimento das obrigações mencionadas neste artigo, fica o empregador isento de qualquer ônus decorrente daquelas obrigações no período respectivo. Caso o empregado e seu representante não concordem com a comprovação do empregador, caberá à Justiça do Trabalho a solução da controvérsia. (Revogado pela Emenda Constitucional nº 28, de 25/05/2000)'),
 ('cf', 233, '2', '§ 2º Fica ressalvado ao empregado, em qualquer hipótese, o direito de postular, judicialmente, os créditos que entender existir, relativamente aos últimos cinco anos. (Revogado pela Emenda Constitucional nº 28, de 25/05/2000)'),
 ('cf', 233, '3', '§ 3º A comprovação mencionada neste artigo poderá ser feita em prazo inferior a cinco anos, a critério do empregador. (Revogado pela Emenda Constitucional nº 28, de 25/05/2000)'),
 ('lei9099', 47, null, 'Art. 47. (VETADO)')
) as v(codigo, numero, paragrafo, texto)
where not exists (
  select 1 from legislacao l where l.codigo=v.codigo and l.numero=v.numero
    and l.inciso is null and l.paragrafo is not distinct from v.paragrafo);
