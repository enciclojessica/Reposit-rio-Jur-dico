-- CF lote 1: arts. 4 a 51 (30 artigos), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Princípios das relações internacionais$c$,
  aplicacao_pratica = $a$Enumera os princípios que regem as relações internacionais do Brasil (incisos I a X): independência nacional, prevalência dos direitos humanos, autodeterminação dos povos, não-intervenção, igualdade entre os Estados, defesa da paz, solução pacífica dos conflitos, repúdio ao terrorismo e ao racismo, cooperação entre os povos e concessão de asilo político. O parágrafo único prevê a busca da integração econômica, política, social e cultural.$a$
where codigo='cf' and numero=4 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Liberdade de associação sindical$c$,
  aplicacao_pratica = $a$Assegura a livre associação profissional ou sindical e fixa as regras dos incisos I a VIII: sem autorização do Estado para fundar sindicato (ressalvado o registro), vedação de mais de uma organização sindical representativa de categoria (II), defesa dos direitos e interesses da categoria (III), contribuição fixada em assembleia geral (IV), liberdade de filiação (V), participação obrigatória nas negociações coletivas (VI), voto do aposentado filiado (VII) e vedação de dispensa do empregado sindicalizado candidato a cargo de direção ou representação sindical (VIII). O parágrafo único estende a disciplina à organização de sindicatos rurais e de colônias.$a$
where codigo='cf' and numero=8 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Direito de greve$c$,
  aplicacao_pratica = $a$Assegura o direito de greve e atribui aos trabalhadores a decisão sobre a oportunidade de exercê-lo e sobre os interesses que devam defender por meio dele.$a$
where codigo='cf' and numero=9 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Participação em colegiados públicos$c$,
  aplicacao_pratica = $a$Assegura a participação de trabalhadores e empregadores nos colegiados dos órgãos públicos em que seus interesses profissionais ou previdenciários sejam objeto de discussão e deliberação.$a$
where codigo='cf' and numero=10 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Representante dos empregados na empresa$c$,
  aplicacao_pratica = $a$Nas empresas com mais de duzentos empregados, assegura a eleição de um representante deles, com a finalidade exclusiva de promover o entendimento direto com os empregadores.$a$
where codigo='cf' and numero=11 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Nacionalidade: natos, naturalizados e perda$c$,
  aplicacao_pratica = $a$Define quem são brasileiros natos (inciso I) e naturalizados (inciso II). Os parágrafos tratam da situação dos portugueses com residência permanente no País, havendo reciprocidade a brasileiros (§ 1º), da vedação de distinção entre natos e naturalizados, salvo nos casos previstos na Constituição (§ 2º), dos cargos privativos de brasileiro nato, como Presidente e Vice-Presidente da República, Presidentes da Câmara e do Senado, Ministro do Supremo Tribunal Federal, carreira diplomática, oficial das Forças Armadas e Ministro de Estado da Defesa (§ 3º), da perda da nacionalidade, inclusive por naturalização cancelada por sentença judicial em razão de fraude e por pedido expresso de perda (§ 4º), e dos efeitos da renúncia prevista no § 4º, II (§ 5º).$a$
where codigo='cf' and numero=12 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Idioma oficial$c$,
  aplicacao_pratica = $a$Fixa a língua portuguesa como idioma oficial da República Federativa do Brasil.$a$
where codigo='cf' and numero=13 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Soberania popular, voto e elegibilidade$c$,
  aplicacao_pratica = $a$Estabelece que a soberania popular se exerce pelo sufrágio universal e pelo voto direto e secreto, de igual valor para todos, e, nos termos da lei, por plebiscito, referendo e iniciativa popular. Os parágrafos tratam do alistamento e do voto, obrigatórios para os maiores de dezoito anos e facultativos nas hipóteses do inciso II (§ 1º), de quem não pode alistar-se (§ 2º), das condições de elegibilidade (§ 3º), das inelegibilidades (§§ 4º, 7º e 9º, este com remissão a lei complementar), dos titulares do Poder Executivo e de quem os houver sucedido (§ 5º), dos requisitos para concorrerem a outros cargos (§ 6º), da elegibilidade do militar (§ 8º), da impugnação do mandato eletivo no prazo de quinze dias contados da diplomação, em segredo de justiça (§§ 10 e 11), e das consultas populares realizadas junto às eleições municipais (§§ 12 e 13).$a$
where codigo='cf' and numero=14 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Partidos políticos$c$,
  aplicacao_pratica = $a$Garante a livre criação, fusão, incorporação e extinção de partidos políticos, resguardados a soberania nacional, o regime democrático, o pluripartidarismo e os direitos fundamentais da pessoa humana, e fixa os preceitos dos incisos I a IV: caráter nacional, proibição de recursos ou subordinação estrangeiros, prestação de contas à Justiça Eleitoral e funcionamento parlamentar de acordo com a lei. Os parágrafos tratam da autonomia partidária (§ 1º), do registro dos estatutos (§ 2º), dos requisitos para acesso aos recursos do fundo partidário e ao rádio e à televisão (§ 3º), da vedação de organização paramilitar (§ 4º), do mandato do eleito por partido que não preencher esses requisitos (§ 5º), do desligamento de parlamentares do partido (§ 6º) e da aplicação dos recursos do fundo partidário e do Fundo Especial de Financiamento de Campanha (§§ 7º a 9º).$a$
where codigo='cf' and numero=17 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Vedações comuns aos entes federativos$c$,
  aplicacao_pratica = $a$Veda à União, aos Estados, ao Distrito Federal e aos Municípios: estabelecer cultos religiosos ou igrejas, subvencioná-los ou embaraçar-lhes o funcionamento, nos termos do inciso I; recusar fé aos documentos públicos (II); e criar distinções entre brasileiros ou preferências entre si (III).$a$
where codigo='cf' and numero=19 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Bens da União$c$,
  aplicacao_pratica = $a$Enumera os bens da União (incisos I a XI): os que já lhe pertencem ou lhe vierem a ser atribuídos, terras devolutas indispensáveis à defesa das fronteiras, das fortificações e construções militares (II), lagos, rios e correntes de água em terrenos de seu domínio ou que banhem mais de um Estado, ilhas fluviais e lacustres limítrofes, praias marítimas, recursos naturais da plataforma continental e da zona econômica exclusiva, mar territorial, terrenos de marinha e seus acrescidos, potenciais de energia hidráulica, recursos minerais, cavidades naturais subterrâneas, sítios arqueológicos e pré-históricos e terras tradicionalmente ocupadas pelos índios. O § 1º assegura, nos termos da lei, participação à União, aos Estados, ao Distrito Federal e aos Municípios; o § 2º trata da faixa de fronteira, de até cento e cinquenta quilômetros de largura.$a$
where codigo='cf' and numero=20 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competências materiais da União$c$,
  aplicacao_pratica = $a$Lista as competências da União (incisos I a XXVI), entre elas: manter relações com Estados estrangeiros, declarar a guerra e celebrar a paz, assegurar a defesa nacional, decretar estado de sítio, estado de defesa e intervenção federal, emitir moeda, administrar as reservas cambiais, manter o serviço postal e o correio aéreo nacional, explorar os serviços de telecomunicações, organizar o Poder Judiciário e o Ministério Público do Distrito Federal e dos Territórios, conceder anistia, executar os serviços de polícia marítima, aeroportuária e de fronteiras, explorar os serviços e instalações nucleares, organizar, manter e executar a inspeção do trabalho e organizar e fiscalizar a proteção e o tratamento de dados pessoais.$a$
where codigo='cf' and numero=21 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Autonomia organizacional dos Estados$c$,
  aplicacao_pratica = $a$Reconhece que os Estados se organizam e se regem pelas Constituições e leis que adotarem, observados os princípios da Constituição Federal.$a$
where codigo='cf' and numero=25 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Bens dos Estados$c$,
  aplicacao_pratica = $a$Enumera os bens dos Estados: as águas superficiais ou subterrâneas, fluentes, emergentes e em depósito, com as ressalvas do inciso I (I); as áreas em ilhas oceânicas e costeiras sob seu domínio, excluídas as sob domínio da União (II); as ilhas fluviais e lacustres não pertencentes à União (III); e as terras devolutas não compreendidas entre as da União (IV).$a$
where codigo='cf' and numero=26 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Número de Deputados Estaduais$c$,
  aplicacao_pratica = $a$Calcula o número de Deputados à Assembleia Legislativa: o triplo da representação do Estado na Câmara dos Deputados e, atingido o número de trinta e seis, o acréscimo de tantos quantos forem os Deputados Federais acima de doze.$a$
where codigo='cf' and numero=27 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 4
update legislacao set
  contexto = $c$Eleição e posse do Governador$c$,
  aplicacao_pratica = $a$Fixa o mandato do Governador e do Vice-Governador de Estado em 4 anos, com eleição no primeiro domingo de outubro (primeiro turno) e no último domingo de outubro (segundo turno, se houver) do ano anterior ao do término do mandato dos antecessores, e posse em 6 de janeiro do ano subsequente, observado o art. 77 da Constituição.$a$
where codigo='cf' and numero=28 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Lei orgânica municipal$c$,
  aplicacao_pratica = $a$Submete o Município a lei orgânica, votada em dois turnos com interstício mínimo de dez dias e aprovada por dois terços dos membros da Câmara Municipal, atendidos os princípios da Constituição Federal e da Constituição do Estado. Os incisos I a XIV fixam preceitos como a eleição e a posse do Prefeito, do Vice-Prefeito e dos Vereadores, o limite de composição das Câmaras, os subsídios, a inviolabilidade dos Vereadores por suas opiniões, palavras e votos, o julgamento do Prefeito pelo Tribunal de Justiça, a iniciativa popular de projetos de lei e a perda do mandato do Prefeito (inciso XIV).$a$
where codigo='cf' and numero=29 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Limites de despesa do Legislativo municipal$c$,
  aplicacao_pratica = $a$Limita o total da despesa do Poder Legislativo Municipal, incluídos os subsídios dos Vereadores e os gastos com inativos e pensionistas, a percentuais do somatório da receita tributária e das transferências do exercício anterior, de 7% a 3,5% conforme a população do Município (incisos I a VI). A Câmara não gasta mais de setenta por cento de sua receita com folha de pagamento (§ 1º). Constituem crime de responsabilidade do Prefeito repassar acima do limite, não enviar o repasse até o dia vinte de cada mês ou enviá-lo a menor que a proporção fixada na Lei Orçamentária (§ 2º), e do Presidente da Câmara o desrespeito ao § 1º (§ 3º).$a$
where codigo='cf' and numero=29 and titulo='Art. 29-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Fiscalização do Município$c$,
  aplicacao_pratica = $a$Atribui a fiscalização do Município ao Poder Legislativo Municipal, mediante controle externo, e aos sistemas de controle interno do Poder Executivo Municipal, na forma da lei.$a$
where codigo='cf' and numero=31 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Distrito Federal: lei orgânica$c$,
  aplicacao_pratica = $a$Veda a divisão do Distrito Federal em Municípios e o submete a lei orgânica, votada em dois turnos com interstício mínimo de dez dias e aprovada por dois terços da Câmara Legislativa, atendidos os princípios da Constituição.$a$
where codigo='cf' and numero=32 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 5
update legislacao set
  contexto = $c$Territórios$c$,
  aplicacao_pratica = $a$Remete à lei a disciplina da organização administrativa e judiciária dos Territórios.$a$
where codigo='cf' and numero=33 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Intervenção do Estado nos Municípios$c$,
  aplicacao_pratica = $a$Veda a intervenção do Estado nos Municípios (e da União nos localizados em Território Federal), exceto quando: a dívida fundada deixar de ser paga, sem motivo de força maior, por dois anos consecutivos (I); não forem prestadas contas devidas, na forma da lei (II); não tiver sido aplicado o mínimo exigido da receita municipal na manutenção e desenvolvimento do ensino (III); ou o Tribunal de Justiça der provimento a representação para assegurar a observância de princípios indicados na Constituição (IV).$a$
where codigo='cf' and numero=35 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Decretação da intervenção$c$,
  aplicacao_pratica = $a$Condiciona a decretação da intervenção a: solicitação do Poder Legislativo ou do Poder Executivo coacto ou impedido, no caso do art. 34, IV (I); requisição de tribunal superior no caso de desobediência a ordem ou decisão judiciária (II); e provimento, pelo Supremo Tribunal Federal, de representação do Procurador-Geral da República (III). Os parágrafos tratam do decreto de intervenção, que especifica amplitude, prazo e condições de execução (§ 1º), da convocação extraordinária do Legislativo (§ 2º), da dispensa de apreciação legislativa nos casos que indica (§ 3º) e do retorno das autoridades afastadas ao cessarem os motivos da intervenção (§ 4º).$a$
where codigo='cf' and numero=36 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Servidor público em mandato eletivo$c$,
  aplicacao_pratica = $a$Fixa o regime do servidor da administração direta, autárquica e fundacional no exercício de mandato eletivo: afastamento do cargo, emprego ou função no mandato federal, estadual ou distrital (I); afastamento no mandato de Prefeito, com a faculdade de optar pela remuneração (II); acúmulo das vantagens do cargo no mandato de Vereador, havendo compatibilidade de horários (III); contagem do tempo de serviço nos casos de afastamento (IV); e permanência no regime próprio de previdência social, se segurado (V).$a$
where codigo='cf' and numero=38 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Conselho de política de pessoal$c$,
  aplicacao_pratica = $a$Determina que a União, os Estados, o Distrito Federal e os Municípios instituam conselho de política de administração e remuneração de pessoal, integrado por servidores designados pelos respectivos Poderes.$a$
where codigo='cf' and numero=39 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 6
update legislacao set
  contexto = $c$Militares dos Estados$c$,
  aplicacao_pratica = $a$Define como militares dos Estados, do Distrito Federal e dos Territórios os membros das Polícias Militares e dos Corpos de Bombeiros Militares, instituições organizadas com base na hierarquia e disciplina.$a$
where codigo='cf' and numero=42 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Câmara dos Deputados$c$,
  aplicacao_pratica = $a$Define a Câmara dos Deputados como composta por representantes do povo, eleitos pelo sistema proporcional em cada Estado, em cada Território e no Distrito Federal.$a$
where codigo='cf' and numero=45 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Senado Federal$c$,
  aplicacao_pratica = $a$Define o Senado Federal como composto por representantes dos Estados e do Distrito Federal, eleitos segundo o princípio majoritário. Difere da Câmara dos Deputados (art. 45) pelo critério de eleição e pelo ente representado.$a$
where codigo='cf' and numero=46 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Matérias de lei do Congresso Nacional$c$,
  aplicacao_pratica = $a$Atribui ao Congresso Nacional, com a sanção do Presidente da República (não exigida para o especificado nos arts. 49, 51 e 52), dispor sobre todas as matérias de competência da União, especialmente: sistema tributário, orçamento e dívida pública, efetivo das Forças Armadas, planos e programas de desenvolvimento, limites do território nacional, anistia, organização administrativa, judiciária, do Ministério Público e da Defensoria Pública, criação e extinção de cargos, Ministérios e órgãos, telecomunicações, matéria financeira, cambial e monetária, moeda e subsídio dos Ministros do Supremo Tribunal Federal (incisos I a XV).$a$
where codigo='cf' and numero=48 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência privativa da Câmara dos Deputados$c$,
  aplicacao_pratica = $a$Lista as competências privativas da Câmara dos Deputados: autorizar, por dois terços de seus membros, a instauração de processo contra o Presidente e o Vice-Presidente da República (I); proceder à tomada de contas do Presidente da República quando não apresentadas no prazo (II); elaborar seu regimento interno (III); dispor sobre sua organização, funcionamento, polícia e cargos (IV); e eleger membros do Conselho da República (V).$a$
where codigo='cf' and numero=51 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
