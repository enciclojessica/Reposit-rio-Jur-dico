-- CP arts. 155 (§§ 10 a 12) e 157 (§ 2º, XI), incluidos pela Lei 15.517/2026.
-- Texto conferido em prints do texto compilado do Planalto enviados pela Jessica em 09/10/2026.
-- Idempotente: so insere o que ainda nao existe.
insert into legislacao (codigo, numero, inciso, paragrafo, texto, titulo, vigente, origem)
select 'cp', v.numero, v.inciso, v.paragrafo, v.texto, null, true, 'planalto.gov.br'
from (values
 (155, null, '10', $t$§ 10. A pena é de reclusão, de 4 (quatro) a 10 (dez) anos, e multa, se a subtração for de petróleo e derivados, gás natural e suas frações recuperáveis, álcool etílico hidratado carburante e demais combustíveis fluidos carburantes, inclusive biocombustíveis, e óleos lubrificantes, removidos dos estabelecimentos de produção ou de quaisquer instalações de armazenamento e de transporte de combustíveis, incluídos dutos e unidades de transporte em qualquer modal. (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, null, '11', $t$§ 11. Na hipótese do § 10 deste artigo, a pena é aumentada de 1/3 (um terço), se o crime é praticado: (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'I', '11', $t$I – com destruição, rompimento de obstáculo à subtração da coisa ou dano de qualquer natureza; (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'II', '11', $t$II – mediante o concurso de 2 (duas) ou mais pessoas; (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'III', '11', $t$III – com abuso de confiança ou valendo-se de vínculo atual ou passado com o ente lesado; ou (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'IV', '11', $t$IV – por ocupante de cargo, de emprego ou de função pública. (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, null, '12', $t$§ 12. Na hipótese do § 10 deste artigo, a pena é aumentada de 2/3 (dois terços) se do crime resulta: (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'I', '12', $t$I – suspensão ou paralisação das atividades do estabelecimento; (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'II', '12', $t$II – desabastecimento; (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'III', '12', $t$III – incêndio; (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'IV', '12', $t$IV – poluição efetiva ou potencial ao meio ambiente; (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'V', '12', $t$V – lesão corporal grave; ou (Incluído pela Lei nº 15.517, de 2026)$t$),
 (155, 'VI', '12', $t$VI – morte. (Incluído pela Lei nº 15.517, de 2026)$t$),
 (157, 'XI', '2', $t$XI – se a subtração for de petróleo e derivados, gás natural e suas frações recuperáveis, álcool etílico hidratado carburante e demais combustíveis fluidos carburantes, inclusive biocombustíveis, e óleos lubrificantes, removidos dos estabelecimentos de produção ou de quaisquer instalações de armazenamento e de transporte de combustíveis, incluídos dutos e unidades de transporte em qualquer modal. (Incluído pela Lei nº 15.517, de 2026)$t$)
) as v(numero, inciso, paragrafo, texto)
where not exists (
  select 1 from legislacao l
  where l.codigo='cp' and l.numero=v.numero and coalesce(l.titulo,'')=''
    and coalesce(l.inciso,'')=coalesce(v.inciso,'') and coalesce(l.paragrafo,'')=coalesce(v.paragrafo,'')
);
