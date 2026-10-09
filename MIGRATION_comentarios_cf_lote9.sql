-- CF lote 9: arts. 170 a 180 (10 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Princípios da ordem econômica$c$,
  aplicacao_pratica = $a$Funda a ordem econômica na valorização do trabalho humano e na livre iniciativa, com o fim de assegurar a todos existência digna, conforme os ditames da justiça social, e lista os princípios dos incisos I a IX: soberania nacional (I), propriedade privada (II), função social da propriedade (III), livre concorrência (IV), defesa do consumidor (V), defesa do meio ambiente (VI), redução das desigualdades regionais e sociais (VII), busca do pleno emprego (VIII) e tratamento favorecido para as empresas de pequeno porte constituídas sob as leis brasileiras (IX). O parágrafo único assegura a todos o livre exercício de qualquer atividade econômica.$a$
where codigo='cf' and numero=170 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Capital estrangeiro$c$,
  aplicacao_pratica = $a$Determina que a lei discipline, com base no interesse nacional, os investimentos de capital estrangeiro, incentive os reinvestimentos e regule a remessa de lucros.$a$
where codigo='cf' and numero=172 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Exploração direta de atividade econômica pelo Estado$c$,
  aplicacao_pratica = $a$Permite a exploração direta de atividade econômica pelo Estado, ressalvados os casos previstos na Constituição, apenas quando necessária aos imperativos da segurança nacional ou a relevante interesse coletivo, conforme definidos em lei. O § 1º remete à lei o estatuto jurídico da empresa pública, da sociedade de economia mista e de suas subsidiárias, o § 2º veda privilégios fiscais não extensivos ao setor privado, o § 3º trata das relações da empresa pública com o Estado e a sociedade, o § 4º da repressão ao abuso do poder econômico e o § 5º da responsabilidade da pessoa jurídica.$a$
where codigo='cf' and numero=173 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Estado como agente normativo e regulador$c$,
  aplicacao_pratica = $a$Atribui ao Estado, como agente normativo e regulador da atividade econômica, as funções de fiscalização, incentivo e planejamento, na forma da lei, sendo o planejamento determinante para o setor público e indicativo para o setor privado. O § 1º trata das diretrizes e bases do planejamento do desenvolvimento nacional equilibrado, o § 2º do apoio ao cooperativismo e a outras formas de associativismo e os §§ 3º e 4º da atividade garimpeira organizada em cooperativas.$a$
where codigo='cf' and numero=174 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Serviços públicos: concessão e permissão$c$,
  aplicacao_pratica = $a$Incumbe ao Poder Público, na forma da lei, prestar serviços públicos diretamente ou sob regime de concessão ou permissão, sempre através de licitação. O parágrafo único remete à lei as matérias enumeradas em seus incisos.$a$
where codigo='cf' and numero=175 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Recursos minerais e potenciais de energia hidráulica$c$,
  aplicacao_pratica = $a$Declara as jazidas, em lavra ou não, os demais recursos minerais e os potenciais de energia hidráulica propriedade distinta da do solo, para efeito de exploração ou aproveitamento, pertencentes à União, garantida ao concessionário a propriedade do produto da lavra. O § 1º trata da pesquisa, da lavra e do aproveitamento dos potenciais, o § 2º da participação do proprietário do solo nos resultados da lavra, o § 3º do prazo determinado da autorização de pesquisa e da cessão das autorizações e concessões e o § 4º do aproveitamento de potencial de energia renovável de capacidade reduzida.$a$
where codigo='cf' and numero=176 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Monopólio da União$c$,
  aplicacao_pratica = $a$Constitui monopólio da União a pesquisa e a lavra das jazidas de petróleo, gás natural e outros hidrocarbonetos fluidos (I), a refinação do petróleo nacional ou estrangeiro (II), a importação e exportação dos produtos e derivados básicos resultantes dessas atividades (III), o transporte marítimo do petróleo bruto de origem nacional ou de derivados básicos de petróleo produzidos no País (IV) e a pesquisa, a lavra, o enriquecimento, o reprocessamento, a industrialização e o comércio de minérios e minerais nucleares e seus derivados (V). O § 1º permite à União contratar com empresas estatais ou privadas a realização dessas atividades, o § 2º trata da lei a que se refere o § 1º, o § 3º do transporte e da utilização de materiais radioativos e o § 4º da contribuição de intervenção no domínio econômico sobre a importação ou comercialização de petróleo, gás natural, álcool combustível e seus derivados.$a$
where codigo='cf' and numero=177 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Ordenação dos transportes$c$,
  aplicacao_pratica = $a$Remete à lei a ordenação dos transportes aéreo, aquático e terrestre, devendo observar, quanto ao transporte internacional, os acordos firmados pela União, atendido o princípio da reciprocidade. O parágrafo único remete à lei as condições em que o transporte de mercadorias na cabotagem e a navegação interior poderão ser feitos por embarcações estrangeiras.$a$
where codigo='cf' and numero=178 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Microempresas e empresas de pequeno porte$c$,
  aplicacao_pratica = $a$Determina que a União, os Estados, o Distrito Federal e os Municípios dispensem às microempresas e às empresas de pequeno porte, assim definidas em lei, tratamento jurídico diferenciado, visando a incentivá-las pela simplificação de suas obrigações administrativas, tributárias, previdenciárias e creditícias, ou pela eliminação ou redução destas por meio de lei.$a$
where codigo='cf' and numero=179 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Turismo$c$,
  aplicacao_pratica = $a$Determina que a União, os Estados, o Distrito Federal e os Municípios promovam e incentivem o turismo como fator de desenvolvimento social e econômico.$a$
where codigo='cf' and numero=180 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
