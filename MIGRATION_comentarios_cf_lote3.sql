-- CF lote 3: arts. 93 a 130 (41 artigos, inclusive 130-A), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Estatuto da Magistratura$c$,
  aplicacao_pratica = $a$Remete a lei complementar, de iniciativa do Supremo Tribunal Federal, o Estatuto da Magistratura, observados os princípios dos incisos I a XV, entre eles: ingresso na carreira de juiz substituto mediante concurso (I), promoção alternada por antiguidade e merecimento (II e III), residência do juiz titular na comarca, salvo autorização do tribunal (VII), motivação do ato de remoção ou disponibilidade por interesse público (VIII), publicidade e fundamentação de todos os julgamentos (IX), decisões administrativas motivadas e em sessão pública (X), atividade jurisdicional ininterrupta (XII), número de juízes proporcional à demanda (XIII) e distribuição imediata de processos (XV).$a$
where codigo='cf' and numero=93 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Quinto constitucional$c$,
  aplicacao_pratica = $a$Reserva um quinto dos lugares dos Tribunais Regionais Federais, dos Tribunais dos Estados e do Distrito Federal e Territórios a membros do Ministério Público, com mais de dez anos de carreira, e a advogados de notório saber jurídico e reputação ilibada, com mais de dez anos de efetiva atividade profissional, indicados em lista sêxtupla pelos órgãos de representação das respectivas classes.$a$
where codigo='cf' and numero=94 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Garantias da magistratura$c$,
  aplicacao_pratica = $a$Assegura aos juízes a vitaliciedade, adquirida no primeiro grau após dois anos de exercício nos termos do inciso I (I), a inamovibilidade, salvo por motivo de interesse público na forma do art. 93, VIII (II), e a irredutibilidade de subsídio, ressalvadas as exceções do inciso III. O parágrafo único lista vedações aos juízes.$a$
where codigo='cf' and numero=95 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência privativa dos tribunais$c$,
  aplicacao_pratica = $a$Fixa competências privativas dos tribunais (I), do Supremo Tribunal Federal, dos Tribunais Superiores e dos Tribunais de Justiça (II) e, quanto aos Tribunais de Justiça, o julgamento dos juízes estaduais e do Distrito Federal e Territórios (III). O parágrafo único trata dos Tribunais de Justiça compostos de mais de 170 desembargadores.$a$
where codigo='cf' and numero=96 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Declaração de inconstitucionalidade pelos tribunais$c$,
  aplicacao_pratica = $a$Condiciona a declaração de inconstitucionalidade de lei ou ato normativo do Poder Público pelos tribunais ao voto da maioria absoluta de seus membros ou dos membros do respectivo órgão especial.$a$
where codigo='cf' and numero=97 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Juizados especiais e justiça de paz$c$,
  aplicacao_pratica = $a$Determina que a União, no Distrito Federal e nos Territórios, e os Estados criem juizados especiais, providos por juízes togados, ou togados e leigos (I), e justiça de paz, remunerada, composta de cidadãos eleitos pelo voto direto, universal (II). O § 1º trata da lei federal sobre juizados especiais no âmbito da Justiça Federal, e o § 2º da destinação das custas e emolumentos ao custeio dos serviços.$a$
where codigo='cf' and numero=98 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Autonomia do Poder Judiciário$c$,
  aplicacao_pratica = $a$Assegura ao Poder Judiciário autonomia administrativa e financeira.$a$
where codigo='cf' and numero=99 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Precatórios$c$,
  aplicacao_pratica = $a$Fixa o regime de pagamento, pelas Fazendas Públicas, dos débitos em virtude de sentença judiciária: exclusivamente na ordem cronológica de apresentação dos precatórios e à conta dos créditos respectivos, proibida a designação de casos ou de pessoas nas dotações orçamentárias e nos créditos adicionais abertos para esse fim. Os parágrafos tratam, entre outros temas, dos débitos de natureza alimentícia (§§ 1º e 2º), das obrigações de pequeno valor fora do regime de precatórios (§§ 3º e 4º), da inclusão obrigatória no orçamento (§ 5º), da responsabilidade do Presidente do Tribunal que retardar o pagamento (§ 7º), da vedação de precatórios complementares ou suplementares de valor pago (§ 8º), da atualização de valores (§ 12), da cessão de precatórios (§§ 13 e 14), da assunção de débitos pela União (§ 16), da aferição mensal com base na receita corrente líquida (§§ 17 e 18), dos limites percentuais de pagamento por Estados, Distrito Federal e Municípios (§§ 23 e 24) e das medidas de redução do estoque de precatórios (§ 25).$a$
where codigo='cf' and numero=100 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Composição do Supremo Tribunal Federal$c$,
  aplicacao_pratica = $a$Compõe o Supremo Tribunal Federal de onze Ministros, escolhidos dentre cidadãos com mais de trinta e cinco e menos de setenta anos de idade, de notável saber jurídico e reputação ilibada. O parágrafo único trata da nomeação dos Ministros pelo Presidente da República.$a$
where codigo='cf' and numero=101 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência do Supremo Tribunal Federal$c$,
  aplicacao_pratica = $a$Atribui ao Supremo Tribunal Federal, precipuamente, a guarda da Constituição, cabendo-lhe processar e julgar originariamente as causas do inciso I, julgar em recurso ordinário (II) e julgar, mediante recurso extraordinário, as causas decididas em única ou última instância (III). Os parágrafos tratam da arguição de descumprimento de preceito fundamental (§ 1º), das decisões definitivas de mérito nas ações que indica (§ 2º) e da demonstração da repercussão geral no recurso extraordinário (§ 3º).$a$
where codigo='cf' and numero=102 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Legitimados para a ADI e a ADC$c$,
  aplicacao_pratica = $a$Lista quem pode propor a ação direta de inconstitucionalidade e a ação declaratória de constitucionalidade (incisos I a IX): o Presidente da República, as Mesas do Senado Federal, da Câmara dos Deputados, da Assembleia Legislativa ou da Câmara Legislativa do Distrito Federal, o Governador de Estado ou do Distrito Federal, o Procurador-Geral da República, o Conselho Federal da Ordem dos Advogados do Brasil, partido político com representação no Congresso Nacional e confederação sindical ou entidade de classe de âmbito nacional. O § 1º exige a prévia oitiva do Procurador-Geral da República nas ações de inconstitucionalidade, o § 2º trata da inconstitucionalidade por omissão e o § 3º da apreciação da inconstitucionalidade em tese de norma.$a$
where codigo='cf' and numero=103 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Súmula vinculante$c$,
  aplicacao_pratica = $a$Autoriza o Supremo Tribunal Federal, de ofício ou por provocação, mediante decisão de dois terços de seus membros e após reiteradas decisões sobre matéria constitucional, a aprovar súmula que, a partir da publicação na imprensa oficial, tem efeito vinculante em relação aos demais órgãos do Poder Judiciário e à administração pública direta e indireta, nas esferas federal, estadual e municipal, bem como a revisá-la ou cancelá-la, na forma da lei.$a$
where codigo='cf' and numero=103 and titulo='Art. 103-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Conselho Nacional de Justiça$c$,
  aplicacao_pratica = $a$Compõe o Conselho Nacional de Justiça de quinze membros, com mandato de dois anos, admitida uma recondução, entre eles o Presidente do Supremo Tribunal Federal, magistrados de diferentes tribunais e ramos, membros do Ministério Público, dois advogados indicados pelo Conselho Federal da Ordem dos Advogados do Brasil e dois cidadãos de notável saber jurídico e reputação ilibada (incisos I a XIII). O Conselho é presidido pelo Presidente do Supremo Tribunal Federal (§ 1º), os demais membros são nomeados pelo Presidente da República (§ 2º) e lhe compete o controle da atuação administrativa e financeira do Poder Judiciário, com as atribuições do § 4º. O Ministro do Superior Tribunal de Justiça exerce a função de Ministro-Corregedor (§ 5º).$a$
where codigo='cf' and numero=103 and titulo='Art. 103-B' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Composição do Superior Tribunal de Justiça$c$,
  aplicacao_pratica = $a$Compõe o Superior Tribunal de Justiça de, no mínimo, trinta e três Ministros.$a$
where codigo='cf' and numero=104 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência do Superior Tribunal de Justiça$c$,
  aplicacao_pratica = $a$Atribui ao Superior Tribunal de Justiça processar e julgar originariamente as causas do inciso I, julgar em recurso ordinário (II) e julgar, em recurso especial, as causas decididas em única ou última instância pelos tribunais indicados no inciso III. Os parágrafos tratam dos órgãos que funcionam junto ao Tribunal (§ 1º) e da exigência de que o recorrente demonstre, no recurso especial, a relevância das questões de direito federal infraconstitucional, nos casos do § 3º (§ 2º).$a$
where codigo='cf' and numero=105 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 4
update legislacao set
  contexto = $c$Órgãos da Justiça Federal$c$,
  aplicacao_pratica = $a$Define como órgãos da Justiça Federal os Tribunais Regionais Federais (I) e os Juízes Federais (II).$a$
where codigo='cf' and numero=106 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Composição dos Tribunais Regionais Federais$c$,
  aplicacao_pratica = $a$Compõe os Tribunais Regionais Federais de, no mínimo, sete juízes, recrutados, quando possível, na respectiva região e nomeados pelo Presidente da República dentre brasileiros com mais de trinta e menos de setenta anos de idade: um quinto dentre advogados e membros do Ministério Público, nos termos do inciso I, e os demais mediante promoção de juízes federais com mais de cinco anos de exercício (II). Os parágrafos tratam da remoção ou permuta de juízes (§ 1º), da justiça itinerante (§ 2º) e do funcionamento descentralizado (§ 3º).$a$
where codigo='cf' and numero=107 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência dos Tribunais Regionais Federais$c$,
  aplicacao_pratica = $a$Atribui aos Tribunais Regionais Federais processar e julgar originariamente as causas do inciso I e julgar, em grau de recurso, as causas decididas pelos juízes federais e pelos juízes estaduais no exercício de competência federal da área de sua jurisdição (II).$a$
where codigo='cf' and numero=108 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência dos juízes federais$c$,
  aplicacao_pratica = $a$Atribui aos juízes federais processar e julgar (incisos I a XI): as causas em que a União, entidade autárquica ou empresa pública federal forem interessadas (I), as causas entre Estado estrangeiro ou organismo internacional e Município ou pessoa (II), as fundadas em tratado ou contrato da União com Estado estrangeiro ou organismo internacional (III), os crimes políticos e as infrações penais praticadas em detrimento de bens, serviços ou interesse da União (IV), os crimes previstos em tratado ou convenção internacional (V), os crimes contra a organização do trabalho (VI), os habeas corpus em matéria criminal de sua competência (VII), os mandados de segurança e habeas data contra ato de autoridade federal (VIII), os crimes cometidos a bordo de navios ou aeronaves (IX), os crimes de ingresso ou permanência irregular de estrangeiro (X) e a disputa sobre direitos indígenas (XI). Os parágrafos tratam do foro das causas em que a União é autora (§ 1º) ou ré (§ 2º), da autorização legal para causas federais em juízo estadual (§ 3º), do recurso ao Tribunal Regional Federal (§ 4º) e do papel do Procurador-Geral da República nas hipóteses de grave violação de direitos humanos (§ 5º).$a$
where codigo='cf' and numero=109 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Seções judiciárias$c$,
  aplicacao_pratica = $a$Determina que cada Estado e o Distrito Federal constitua uma seção judiciária, com sede na respectiva Capital, e varas localizadas segundo o estabelecido em lei.$a$
where codigo='cf' and numero=110 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 5
update legislacao set
  contexto = $c$Órgãos da Justiça do Trabalho$c$,
  aplicacao_pratica = $a$Define como órgãos da Justiça do Trabalho o Tribunal Superior do Trabalho (I), os Tribunais Regionais do Trabalho (II) e os Juízes do Trabalho (III).$a$
where codigo='cf' and numero=111 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Composição do Tribunal Superior do Trabalho$c$,
  aplicacao_pratica = $a$Compõe o Tribunal Superior do Trabalho de vinte e sete Ministros, escolhidos dentre brasileiros com mais de trinta e cinco e menos de setenta anos de idade, de notável saber jurídico e reputação ilibada, nomeados pelo Presidente da República após aprovação pela maioria absoluta do Senado Federal: um quinto dentre advogados e membros do Ministério Público, nos termos do inciso I, e os demais dentre juízes dos Tribunais Regionais do Trabalho (II). A lei dispõe sobre a competência do Tribunal (§ 1º), o § 2º trata dos órgãos que funcionam junto a ele e o § 3º da competência originária para a reclamação.$a$
where codigo='cf' and numero=111 and titulo='Art. 111-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Varas do Trabalho$c$,
  aplicacao_pratica = $a$Determina que a lei crie varas da Justiça do Trabalho, podendo, nas comarcas não abrangidas por sua jurisdição, atribuí-la aos juízes de direito, com recurso para o respectivo Tribunal Regional do Trabalho.$a$
where codigo='cf' and numero=112 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Organização da Justiça do Trabalho$c$,
  aplicacao_pratica = $a$Remete à lei a constituição, investidura, jurisdição, competência, garantias e condições de exercício dos órgãos da Justiça do Trabalho.$a$
where codigo='cf' and numero=113 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência da Justiça do Trabalho$c$,
  aplicacao_pratica = $a$Atribui à Justiça do Trabalho processar e julgar (incisos I a IX): as ações oriundas da relação de trabalho, abrangidos os entes de direito público externo (I), as ações que envolvam exercício do direito de greve (II), as ações sobre representação sindical (III), os mandados de segurança, habeas corpus e habeas data quando o ato questionado envolver matéria sujeita à sua jurisdição (IV), os conflitos de competência entre órgãos com jurisdição trabalhista (V), as ações de indenização por dano moral ou patrimonial decorrentes da relação de trabalho (VI), as ações relativas às penalidades administrativas impostas aos empregadores (VII), a execução, de ofício, das contribuições sociais do art. 195 (VIII) e outras controvérsias decorrentes da relação de trabalho, na forma da lei (IX). Os parágrafos tratam da eleição de árbitros frustrada a negociação coletiva (§ 1º), da recusa à negociação coletiva ou à arbitragem (§ 2º) e da greve em atividade essencial (§ 3º).$a$
where codigo='cf' and numero=114 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 6
update legislacao set
  contexto = $c$Composição dos Tribunais Regionais do Trabalho$c$,
  aplicacao_pratica = $a$Compõe os Tribunais Regionais do Trabalho de, no mínimo, sete juízes, recrutados, quando possível, na respectiva região e nomeados pelo Presidente da República dentre brasileiros com mais de trinta e menos de setenta anos de idade: um quinto dentre advogados e membros do Ministério Público, nos termos do inciso I, e os demais mediante promoção de juízes do trabalho por antiguidade e merecimento (II). Os parágrafos tratam da justiça itinerante (§ 1º) e do funcionamento descentralizado (§ 2º).$a$
where codigo='cf' and numero=115 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Varas do Trabalho: juiz singular$c$,
  aplicacao_pratica = $a$Determina que, nas Varas do Trabalho, a jurisdição seja exercida por um juiz singular.$a$
where codigo='cf' and numero=116 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Órgãos da Justiça Eleitoral$c$,
  aplicacao_pratica = $a$Define como órgãos da Justiça Eleitoral o Tribunal Superior Eleitoral (I), os Tribunais Regionais Eleitorais (II), os Juízes Eleitorais (III) e as Juntas Eleitorais (IV).$a$
where codigo='cf' and numero=118 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Composição do Tribunal Superior Eleitoral$c$,
  aplicacao_pratica = $a$Compõe o Tribunal Superior Eleitoral de, no mínimo, sete membros, escolhidos mediante eleição, pelo voto secreto, nas hipóteses do inciso I, e por nomeação do Presidente da República de dois juízes dentre seis advogados de notável saber jurídico (II). O parágrafo único trata da eleição de seu Presidente e Vice-Presidente.$a$
where codigo='cf' and numero=119 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Tribunais Regionais Eleitorais$c$,
  aplicacao_pratica = $a$Prevê um Tribunal Regional Eleitoral na Capital de cada Estado e no Distrito Federal.$a$
where codigo='cf' and numero=120 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 7
update legislacao set
  contexto = $c$Organização da Justiça Eleitoral$c$,
  aplicacao_pratica = $a$Remete a lei complementar a organização e a competência dos tribunais, dos juízes de direito e das juntas eleitorais.$a$
where codigo='cf' and numero=121 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Órgãos da Justiça Militar$c$,
  aplicacao_pratica = $a$Define como órgãos da Justiça Militar o Superior Tribunal Militar (I) e os Tribunais e Juízes Militares instituídos por lei (II).$a$
where codigo='cf' and numero=122 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Composição do Superior Tribunal Militar$c$,
  aplicacao_pratica = $a$Compõe o Superior Tribunal Militar de quinze Ministros vitalícios, nomeados pelo Presidente da República depois de aprovada a indicação pelo Senado Federal: três dentre oficiais-generais da Marinha, quatro do Exército e três da Aeronáutica, todos da ativa e do posto mais elevado da carreira, e cinco dentre civis.$a$
where codigo='cf' and numero=123 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência da Justiça Militar$c$,
  aplicacao_pratica = $a$Atribui à Justiça Militar processar e julgar os crimes militares definidos em lei.$a$
where codigo='cf' and numero=124 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Justiça dos Estados$c$,
  aplicacao_pratica = $a$Determina que os Estados organizem sua Justiça, observados os princípios estabelecidos na Constituição.$a$
where codigo='cf' and numero=125 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 8
update legislacao set
  contexto = $c$Varas agrárias$c$,
  aplicacao_pratica = $a$Prevê que, para dirimir conflitos fundiários, o Tribunal de Justiça proponha a criação de varas especializadas, com competência exclusiva para questões agrárias.$a$
where codigo='cf' and numero=126 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Ministério Público: função essencial$c$,
  aplicacao_pratica = $a$Define o Ministério Público como instituição permanente, essencial à função jurisdicional do Estado, incumbida da defesa da ordem jurídica, do regime democrático e dos interesses sociais e individuais indisponíveis.$a$
where codigo='cf' and numero=127 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Estrutura do Ministério Público$c$,
  aplicacao_pratica = $a$Divide o Ministério Público em Ministério Público da União (I) e Ministérios Públicos dos Estados (II). Os parágrafos tratam da chefia do Ministério Público da União pelo Procurador-Geral da República (§ 1º), da destituição do Procurador-Geral da República (§ 2º), da escolha dos Procuradores-Gerais nos Ministérios Públicos dos Estados e do Distrito Federal e Territórios (§§ 3º e 4º), das leis complementares de organização (§ 5º) e da aplicação aos membros do disposto no art. 95, parágrafo único (§ 6º).$a$
where codigo='cf' and numero=128 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Funções institucionais do Ministério Público$c$,
  aplicacao_pratica = $a$Lista as funções institucionais do Ministério Público (incisos I a IX): promover, privativamente, a ação penal pública (I), zelar pelo efetivo respeito dos Poderes Públicos e dos serviços de relevância pública aos direitos assegurados na Constituição (II), promover o inquérito civil e a ação civil pública (III), promover a ação de inconstitucionalidade ou representação para fins de intervenção (IV), defender judicialmente os direitos e interesses das populações indígenas (V), expedir notificações nos procedimentos administrativos de sua competência (VI), exercer o controle externo da atividade policial (VII), requisitar diligências investigatórias e a instauração de inquérito policial (VIII) e exercer outras funções compatíveis com sua finalidade (IX). Os parágrafos tratam da legitimação para as ações civis (§ 1º), do exercício das funções por integrantes da carreira (§ 2º), do ingresso por concurso público (§ 3º), da aplicação do art. 93 (§ 4º) e da distribuição imediata de processos (§ 5º).$a$
where codigo='cf' and numero=129 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Ministério Público junto aos Tribunais de Contas$c$,
  aplicacao_pratica = $a$Estende aos membros do Ministério Público junto aos Tribunais de Contas as disposições da seção pertinentes a direitos, vedações e forma de investidura.$a$
where codigo='cf' and numero=130 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- 130-A
update legislacao set
  contexto = $c$Conselho Nacional do Ministério Público$c$,
  aplicacao_pratica = $a$Compõe o Conselho Nacional do Ministério Público de quatorze membros nomeados pelo Presidente da República, depois de aprovada a escolha pela maioria absoluta do Senado Federal, para mandato de dois anos, admitida uma recondução. Integram-no o Procurador-Geral da República, que o preside (I), quatro membros do Ministério Público da União (II), três membros dos Ministérios Públicos dos Estados (III), dois juízes (IV), dois advogados indicados pelo Conselho Federal da Ordem dos Advogados do Brasil (V) e dois cidadãos de notável saber jurídico e reputação ilibada (VI). O § 2º atribui-lhe o controle da atuação administrativa e financeira do Ministério Público e do cumprimento dos deveres funcionais de seus membros, o § 3º trata do Corregedor nacional, o § 4º prevê que o Presidente do Conselho Federal da Ordem dos Advogados do Brasil oficie junto ao Conselho e o § 5º as ouvidorias do Ministério Público.$a$
where codigo='cf' and numero=130 and titulo='Art. 130-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
