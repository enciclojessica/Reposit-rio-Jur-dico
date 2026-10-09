-- CF lote 2: arts. 52 a 92 (40 artigos), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Competência privativa do Senado Federal$c$,
  aplicacao_pratica = $a$Lista as competências privativas do Senado Federal (incisos I a XV): processar e julgar o Presidente e o Vice-Presidente da República nos crimes de responsabilidade (I) e as demais autoridades indicadas no inciso II, aprovar previamente, por voto secreto, a escolha de autoridades (III e IV), autorizar operações externas de natureza financeira de interesse da União, dos Estados, do Distrito Federal e dos Municípios (V), fixar e dispor sobre limites globais da dívida e das operações de crédito (VI a IX), suspender a execução, no todo ou em parte, de lei declarada inconstitucional (X), aprovar a exoneração de ofício do Procurador-Geral da República (XI), elaborar seu regimento interno (XII), dispor sobre sua organização e funcionamento (XIII), eleger membros do Conselho da República (XIV) e avaliar periodicamente a funcionalidade do Sistema Tributário Nacional (XV). Nos casos dos incisos I e II, o parágrafo único prevê que funcione como Presidente o do Supremo Tribunal Federal.$a$
where codigo='cf' and numero=52 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Proibições a Deputados e Senadores$c$,
  aplicacao_pratica = $a$Estabelece proibições aos Deputados e Senadores em dois momentos: desde a expedição do diploma (inciso I) e desde a posse (inciso II). A infração dessas proibições é causa de perda do mandato, conforme o art. 55, I.$a$
where codigo='cf' and numero=54 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Perda do mandato parlamentar$c$,
  aplicacao_pratica = $a$Prevê as hipóteses de perda do mandato do Deputado ou Senador: infração das proibições do art. 54 (I), procedimento declarado incompatível com o decoro parlamentar (II), ausência, em cada sessão legislativa, à terça parte das sessões ordinárias (III), perda ou suspensão dos direitos políticos (IV), decretação pela Justiça Eleitoral nos casos da Constituição (V) e condenação criminal em sentença transitada em julgado (VI). Os parágrafos tratam do decoro parlamentar (§ 1º), da decisão da Casa respectiva nos casos dos incisos I, II e VI (§ 2º), da declaração pela Mesa nos casos dos incisos III a V (§ 3º) e da renúncia de parlamentar submetido a processo que possa levar à perda do mandato (§ 4º).$a$
where codigo='cf' and numero=55 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Hipóteses em que não se perde o mandato$c$,
  aplicacao_pratica = $a$Prevê que não perde o mandato o Deputado ou Senador investido no cargo de Ministro de Estado, Governador de Território, Secretário de Estado e nos demais cargos do inciso I, nem o licenciado pela respectiva Casa por motivo de doença ou para tratar de interesse particular, nas condições do inciso II. Os parágrafos tratam da convocação do suplente (§ 1º), da eleição para preencher vaga quando não há suplente (§ 2º) e da opção pela remuneração do mandato na hipótese do inciso I (§ 3º).$a$
where codigo='cf' and numero=56 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Sessões legislativas do Congresso Nacional$c$,
  aplicacao_pratica = $a$Fixa que o Congresso Nacional se reúne anualmente, na Capital Federal, de 2 de fevereiro a 17 de julho e de 1º de agosto a 22 de dezembro.$a$
where codigo='cf' and numero=57 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Comissões do Congresso e das Casas$c$,
  aplicacao_pratica = $a$Prevê que o Congresso Nacional e suas Casas terão comissões permanentes e temporárias, constituídas na forma e com as atribuições previstas no respectivo regimento ou no ato de que resultar sua criação.$a$
where codigo='cf' and numero=58 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Processo legislativo: espécies normativas$c$,
  aplicacao_pratica = $a$Enumera o que compreende o processo legislativo: emendas à Constituição, leis complementares, leis ordinárias, leis delegadas, medidas provisórias, decretos legislativos e resoluções (incisos I a VII). O parágrafo único remete a lei complementar a disciplina da elaboração, redação, alteração e consolidação das leis.$a$
where codigo='cf' and numero=59 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Emenda à Constituição$c$,
  aplicacao_pratica = $a$Prevê quem pode propor emendas à Constituição: no mínimo um terço dos membros da Câmara dos Deputados ou do Senado Federal (I), o Presidente da República (II) e mais da metade das Assembleias Legislativas das unidades da Federação (III). Os parágrafos tratam da vedação de emenda na vigência de intervenção federal, estado de defesa ou estado de sítio (§ 1º), da discussão e votação em cada Casa, em dois turnos (§ 2º), da promulgação pelas Mesas da Câmara e do Senado (§ 3º), das matérias que não podem ser objeto de deliberação, a saber, a forma federativa de Estado, o voto direto, secreto, universal e periódico, a separação dos Poderes e os direitos e garantias individuais (§ 4º), e da matéria de proposta rejeitada ou havida por prejudicada (§ 5º).$a$
where codigo='cf' and numero=60 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Iniciativa das leis$c$,
  aplicacao_pratica = $a$Atribui a iniciativa das leis complementares e ordinárias a qualquer membro ou Comissão da Câmara dos Deputados, do Senado Federal ou do Congresso Nacional, ao Presidente da República, ao Supremo Tribunal Federal, aos Tribunais Superiores, ao Procurador-Geral da República e aos cidadãos, na forma e nos casos previstos na Constituição.$a$
where codigo='cf' and numero=61 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Medidas provisórias$c$,
  aplicacao_pratica = $a$Autoriza o Presidente da República, em caso de relevância e urgência, a adotar medidas provisórias com força de lei, que devem ser submetidas de imediato ao Congresso Nacional.$a$
where codigo='cf' and numero=62 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Vedação de aumento de despesa$c$,
  aplicacao_pratica = $a$Veda o aumento da despesa prevista nos projetos de iniciativa exclusiva do Presidente da República, ressalvado o disposto no inciso I (I), e nos projetos sobre organização dos serviços administrativos da Câmara dos Deputados, do Senado Federal e dos demais órgãos indicados no inciso II (II).$a$
where codigo='cf' and numero=63 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Casa iniciadora de projetos$c$,
  aplicacao_pratica = $a$Determina que a discussão e votação dos projetos de lei de iniciativa do Presidente da República, do Supremo Tribunal Federal e dos Tribunais Superiores comecem na Câmara dos Deputados.$a$
where codigo='cf' and numero=64 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Revisão do projeto pela outra Casa$c$,
  aplicacao_pratica = $a$Dispõe que o projeto de lei aprovado por uma Casa é revisto pela outra, em um só turno de discussão e votação, e enviado à sanção ou promulgação, se a Casa revisora o aprovar, ou arquivado, se o rejeitar.$a$
where codigo='cf' and numero=65 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Sanção do projeto de lei$c$,
  aplicacao_pratica = $a$Determina que a Casa na qual tenha sido concluída a votação envie o projeto de lei ao Presidente da República, que, aquiescendo, o sancionará.$a$
where codigo='cf' and numero=66 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Reapresentação de projeto rejeitado$c$,
  aplicacao_pratica = $a$Permite que a matéria de projeto de lei rejeitado constitua objeto de novo projeto, na mesma sessão legislativa, somente mediante proposta da maioria absoluta dos membros de qualquer das Casas do Congresso Nacional.$a$
where codigo='cf' and numero=67 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 4
update legislacao set
  contexto = $c$Leis delegadas$c$,
  aplicacao_pratica = $a$Dispõe que as leis delegadas são elaboradas pelo Presidente da República, que deve solicitar a delegação ao Congresso Nacional.$a$
where codigo='cf' and numero=68 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Quórum das leis complementares$c$,
  aplicacao_pratica = $a$Fixa que as leis complementares são aprovadas por maioria absoluta.$a$
where codigo='cf' and numero=69 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Fiscalização contábil, financeira e orçamentária$c$,
  aplicacao_pratica = $a$Atribui ao Congresso Nacional, mediante controle externo, e ao sistema de controle interno de cada Poder a fiscalização contábil, financeira, orçamentária, operacional e patrimonial da União e das entidades da administração direta e indireta, quanto à legalidade, legitimidade, economicidade, aplicação das subvenções e renúncia de receitas.$a$
where codigo='cf' and numero=70 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competências do Tribunal de Contas da União$c$,
  aplicacao_pratica = $a$Prevê que o controle externo, a cargo do Congresso Nacional, é exercido com o auxílio do Tribunal de Contas da União, a quem compete (incisos I a XI): apreciar, mediante parecer prévio, as contas anuais do Presidente da República (I), julgar as contas dos administradores e demais responsáveis por dinheiros, bens e valores públicos (II), apreciar, para fins de registro, a legalidade dos atos de admissão de pessoal (III), realizar fiscalizações por iniciativa própria ou por solicitação do Legislativo (IV), fiscalizar recursos repassados pela União mediante convênio (VI), aplicar aos responsáveis, em caso de ilegalidade de despesa ou irregularidade de contas, as sanções do inciso VIII, assinar prazo para que o órgão adote as providências necessárias ao cumprimento da lei (IX), sustar a execução de ato impugnado (X) e representar ao Poder competente sobre irregularidades ou abusos apurados (XI). Os parágrafos tratam da sustação de contrato pelo Congresso Nacional (§ 1º), do prazo de noventa dias para as medidas (§ 2º), da eficácia de título das decisões que imputem débito ou multa (§ 3º) e do relatório trimestral e anual de atividades (§ 4º).$a$
where codigo='cf' and numero=71 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Comissão mista e indícios de despesas não autorizadas$c$,
  aplicacao_pratica = $a$Permite à comissão mista permanente do art. 166, § 1º, diante de indícios de despesas não autorizadas, ainda que sob a forma de investimentos não programados ou de subsídios não aprovados, solicitar à autoridade governamental responsável que, no prazo de cinco dias, preste os esclarecimentos necessários.$a$
where codigo='cf' and numero=72 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 5
update legislacao set
  contexto = $c$Composição e sede do TCU$c$,
  aplicacao_pratica = $a$Define o Tribunal de Contas da União como integrado por nove Ministros, com sede no Distrito Federal, quadro próprio de pessoal e jurisdição em todo o território nacional, exercendo, no que couber, as atribuições previstas no art. 96.$a$
where codigo='cf' and numero=73 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Controle interno integrado$c$,
  aplicacao_pratica = $a$Determina que os Poderes Legislativo, Executivo e Judiciário mantenham, de forma integrada, sistema de controle interno para: avaliar o cumprimento das metas do plano plurianual e a execução dos programas (I), comprovar a legalidade e avaliar os resultados da gestão (II), exercer o controle das operações de crédito, avais e garantias (III) e apoiar o controle externo (IV). O § 1º trata do dever dos responsáveis pelo controle interno ao tomarem conhecimento de irregularidade, e o § 2º reconhece a qualquer cidadão, partido político, associação ou sindicato legitimidade, na forma que indica.$a$
where codigo='cf' and numero=74 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Tribunais de Contas estaduais e municipais$c$,
  aplicacao_pratica = $a$Declara os Tribunais de Contas instituições permanentes, essenciais ao exercício do controle externo, e estende as normas da Seção, no que couber, à organização, composição e fiscalização dos Tribunais de Contas dos Estados e do Distrito Federal e dos Tribunais e Conselhos de Contas dos Municípios, vedada sua extinção, criação ou instalação.$a$
where codigo='cf' and numero=75 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Poder Executivo$c$,
  aplicacao_pratica = $a$Atribui o exercício do Poder Executivo ao Presidente da República, auxiliado pelos Ministros de Estado.$a$
where codigo='cf' and numero=76 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Eleição presidencial$c$,
  aplicacao_pratica = $a$Fixa a eleição simultânea do Presidente e do Vice-Presidente da República no primeiro domingo de outubro (primeiro turno) e no último domingo de outubro (segundo turno, se houver) do ano anterior ao do término do mandato presidencial vigente.$a$
where codigo='cf' and numero=77 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 6
update legislacao set
  contexto = $c$Posse do Presidente e do Vice-Presidente$c$,
  aplicacao_pratica = $a$Determina que tomem posse em sessão do Congresso Nacional, prestando o compromisso de manter, defender e cumprir a Constituição, observar as leis, promover o bem geral do povo brasileiro, sustentar a união, a integridade e a independência do Brasil.$a$
where codigo='cf' and numero=78 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Substituição e sucessão do Presidente$c$,
  aplicacao_pratica = $a$Prevê que o Vice-Presidente substitui o Presidente no caso de impedimento e lhe sucede no de vaga.$a$
where codigo='cf' and numero=79 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Ordem de chamada à Presidência$c$,
  aplicacao_pratica = $a$No impedimento do Presidente e do Vice-Presidente, ou vacância dos respectivos cargos, chama sucessivamente ao exercício da Presidência o Presidente da Câmara dos Deputados, o do Senado Federal e o do Supremo Tribunal Federal.$a$
where codigo='cf' and numero=80 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Eleição por vacância dos cargos$c$,
  aplicacao_pratica = $a$Estabelece que, vagando os cargos de Presidente e Vice-Presidente da República, a eleição se faz noventa dias depois de aberta a última vaga.$a$
where codigo='cf' and numero=81 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Mandato presidencial$c$,
  aplicacao_pratica = $a$Fixa o mandato do Presidente da República em 4 anos, com início em 5 de janeiro do ano seguinte ao de sua eleição.$a$
where codigo='cf' and numero=82 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 7
update legislacao set
  contexto = $c$Ausência do País$c$,
  aplicacao_pratica = $a$Exige licença do Congresso Nacional para que o Presidente e o Vice-Presidente da República se ausentem do País por período superior a quinze dias, sob pena de perda do cargo.$a$
where codigo='cf' and numero=83 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competências privativas do Presidente da República$c$,
  aplicacao_pratica = $a$Lista as competências privativas do Presidente da República (incisos I a XXVIII), entre elas: nomear e exonerar Ministros de Estado, exercer a direção superior da administração federal, iniciar o processo legislativo, sancionar, promulgar e fazer publicar as leis e expedir decretos e regulamentos, vetar projetos de lei, manter relações com Estados estrangeiros, celebrar tratados sujeitos a referendo do Congresso Nacional, decretar o estado de defesa e o estado de sítio, decretar e executar a intervenção federal, conceder indulto e comutar penas, exercer o comando supremo das Forças Armadas, nomear, após aprovação pelo Senado Federal, os Ministros do Supremo Tribunal Federal e dos Tribunais Superiores, declarar guerra e celebrar a paz com autorização ou referendo do Congresso Nacional, editar medidas provisórias (XXVI) e propor ao Congresso Nacional a decretação do estado de calamidade pública de âmbito nacional (XXVIII). O parágrafo único permite ao Presidente delegar atribuições mencionadas nos incisos que indica.$a$
where codigo='cf' and numero=84 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Crimes de responsabilidade do Presidente$c$,
  aplicacao_pratica = $a$Define como crimes de responsabilidade os atos do Presidente da República que atentem contra a Constituição Federal e, especialmente, contra: a existência da União (I), o livre exercício dos Poderes e do Ministério Público (II), o exercício dos direitos políticos, individuais e sociais (III), a segurança interna do País (IV), a probidade na administração (V), a lei orçamentária (VI) e o cumprimento das leis e das decisões judiciais (VII). O parágrafo único remete a lei especial a definição desses crimes e das normas de processo e julgamento.$a$
where codigo='cf' and numero=85 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Admissão da acusação e julgamento do Presidente$c$,
  aplicacao_pratica = $a$Admitida a acusação contra o Presidente da República por dois terços da Câmara dos Deputados, ele é submetido a julgamento perante o Supremo Tribunal Federal, nas infrações penais comuns, ou perante o Senado Federal, nos crimes de responsabilidade.$a$
where codigo='cf' and numero=86 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Ministros de Estado$c$,
  aplicacao_pratica = $a$Exige que os Ministros de Estado sejam escolhidos dentre brasileiros maiores de vinte e um anos e no exercício dos direitos políticos.$a$
where codigo='cf' and numero=87 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 8
update legislacao set
  contexto = $c$Ministérios e órgãos da administração$c$,
  aplicacao_pratica = $a$Remete à lei a criação e a extinção de Ministérios e órgãos da administração pública.$a$
where codigo='cf' and numero=88 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Conselho da República$c$,
  aplicacao_pratica = $a$Define o Conselho da República como órgão superior de consulta do Presidente da República e lista seus membros (incisos I a VII): o Vice-Presidente, os Presidentes da Câmara dos Deputados e do Senado Federal, os líderes da maioria e da minoria em cada Casa, o Ministro da Justiça e seis cidadãos brasileiros natos com mais de trinta e cinco anos de idade.$a$
where codigo='cf' and numero=89 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência do Conselho da República$c$,
  aplicacao_pratica = $a$Atribui ao Conselho da República pronunciar-se sobre intervenção federal, estado de defesa e estado de sítio (I) e sobre as questões relevantes para a estabilidade das instituições democráticas (II). O Presidente da República pode convocar Ministro de Estado para participar da reunião (§ 1º), e a lei regula a organização e o funcionamento do Conselho (§ 2º).$a$
where codigo='cf' and numero=90 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Conselho de Defesa Nacional$c$,
  aplicacao_pratica = $a$Define o Conselho de Defesa Nacional como órgão de consulta do Presidente da República nos assuntos relacionados com a soberania nacional e a defesa do Estado democrático, com membros natos como o Vice-Presidente, os Presidentes da Câmara dos Deputados e do Senado Federal, os Ministros da Justiça, da Defesa, das Relações Exteriores e do Planejamento e os Comandantes da Marinha, do Exército e da Aeronáutica (incisos I a VIII). Compete-lhe opinar sobre declaração de guerra e celebração da paz e sobre estado de defesa, estado de sítio e intervenção federal, propor critérios de utilização de áreas indispensáveis à segurança do território e acompanhar iniciativas para garantir a independência nacional e a defesa do Estado democrático (§ 1º). A lei regula sua organização e funcionamento (§ 2º).$a$
where codigo='cf' and numero=91 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Órgãos do Poder Judiciário$c$,
  aplicacao_pratica = $a$Enumera os órgãos do Poder Judiciário (incisos I a VII): Supremo Tribunal Federal, Superior Tribunal de Justiça, Tribunais Regionais Federais e Juízes Federais, Tribunais e Juízes do Trabalho, Eleitorais e Militares, e Tribunais e Juízes dos Estados e do Distrito Federal e Territórios. O § 1º trata do Supremo Tribunal Federal, do Conselho Nacional de Justiça e dos Tribunais Superiores, e o § 2º da jurisdição do Supremo Tribunal Federal e dos Tribunais Superiores em todo o território nacional.$a$
where codigo='cf' and numero=92 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
