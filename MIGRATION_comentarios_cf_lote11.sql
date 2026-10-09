-- CF lote 11: arts. 190 a 197 (8 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Propriedade rural por estrangeiros$c$,
  aplicacao_pratica = $a$Determina que a lei regule e limite a aquisição ou o arrendamento de propriedade rural por pessoa física ou jurídica estrangeira e estabeleça os casos que dependerão de autorização do Congresso Nacional.$a$
where codigo='cf' and numero=190 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Usucapião especial rural$c$,
  aplicacao_pratica = $a$Confere a propriedade a quem, não sendo proprietário de imóvel rural ou urbano, possua como seu, por cinco anos ininterruptos e sem oposição, área de terra em zona rural não superior a cinquenta hectares, tornando-a produtiva por seu trabalho ou de sua família e tendo nela sua moradia. O parágrafo único exclui a usucapião de imóveis públicos.$a$
where codigo='cf' and numero=191 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Sistema financeiro nacional$c$,
  aplicacao_pratica = $a$Estrutura o sistema financeiro nacional de forma a promover o desenvolvimento equilibrado do País e a servir aos interesses da coletividade, em todas as partes que o compõem, abrangendo as cooperativas de crédito, e o submete a leis complementares, que disporão, inclusive, sobre a participação do capital estrangeiro nas instituições que o integram.$a$
where codigo='cf' and numero=192 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Ordem social$c$,
  aplicacao_pratica = $a$Fixa como base da ordem social o primado do trabalho e como objetivo o bem-estar e a justiça sociais. O parágrafo único atribui ao Estado a função de planejamento das políticas sociais, assegurada, na forma da lei, a participação da sociedade nos processos de formulação, monitoramento, controle e avaliação dessas políticas.$a$
where codigo='cf' and numero=193 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Seguridade social$c$,
  aplicacao_pratica = $a$Define a seguridade social como um conjunto integrado de ações de iniciativa dos Poderes Públicos e da sociedade, destinadas a assegurar os direitos relativos à saúde, à previdência e à assistência social. O parágrafo único atribui ao Poder Público, nos termos da lei, a organização da seguridade social com base nos objetivos que enumera.$a$
where codigo='cf' and numero=194 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Financiamento da seguridade social$c$,
  aplicacao_pratica = $a$Determina que a seguridade social seja financiada por toda a sociedade, de forma direta e indireta, nos termos da lei, mediante recursos dos orçamentos da União, dos Estados, do Distrito Federal e dos Municípios e das contribuições sociais do empregador, da empresa e da entidade a ela equiparada (I), do trabalhador e dos demais segurados da previdência social (II), sobre a receita de concursos de prognósticos (III), do importador de bens ou serviços do exterior ou de quem a lei a ele equiparar (IV) e sobre bens e serviços, nos termos de lei complementar (V). Os parágrafos tratam, entre outros pontos, do orçamento da seguridade social (§ 2º), da vedação a que a pessoa jurídica em débito com o sistema contrate com o Poder Público ou dele receba benefícios ou incentivos fiscais ou creditícios (§ 3º), de outras fontes de custeio (§ 4º), da exigência de fonte de custeio total para benefícios (§ 5º), da exigibilidade das contribuições somente após noventa dias da publicação da lei que as instituir ou modificar (§ 6º), da isenção de entidades beneficentes (§ 7º), da contribuição do produtor, parceiro, meeiro, arrendatário rural e pescador artesanal em regime de economia familiar (§ 8º), da vedação de moratória e de parcelamento em prazo superior a 60 meses (§ 11) e da contribuição sobre bens e serviços do inciso V (§§ 15 a 19).$a$
where codigo='cf' and numero=195 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Direito à saúde$c$,
  aplicacao_pratica = $a$Declara a saúde direito de todos e dever do Estado, garantido mediante políticas sociais e econômicas que visem à redução do risco de doença e de outros agravos e ao acesso universal e igualitário às ações e serviços para sua promoção, proteção e recuperação.$a$
where codigo='cf' and numero=196 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Relevância pública das ações de saúde$c$,
  aplicacao_pratica = $a$Declara de relevância pública as ações e serviços de saúde, cabendo ao Poder Público dispor, nos termos da lei, sobre sua regulamentação, fiscalização e controle, com execução feita diretamente ou através de terceiros e, também, por pessoa física ou jurídica de direito privado.$a$
where codigo='cf' and numero=197 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
