-- Comentários (contexto e aplicacao_pratica) dos artigos do CP sem comentário, lote 4 (arts. 313-A a 361), fecha o CP.
-- Só a partir do texto do artigo, lido integralmente no banco em 09/10/2026. Remissões (arts. 69, 70, 168-A, 313-A, 319-A, 337-B a 337-D, 337-F, 337-I, 349-A, 359-B, 359-L) conferidas pelo texto.
-- Sem jurisprudência ou doutrina. Idempotente: só preenche quando contexto está vazio. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Inserção de dados falsos em sistema da Administração Pública$c$,
  aplicacao_pratica = $a$Pune o funcionário autorizado que insere ou facilita a inserção de dados falsos, ou altera ou exclui indevidamente dados corretos, nos sistemas informatizados ou bancos de dados da Administração Pública, com o fim de obter vantagem indevida para si ou para outrem ou de causar dano, com reclusão de 2 a 12 anos e multa. O sujeito ativo é o funcionário autorizado a operar o sistema, e o fim especial de vantagem indevida ou de dano é elemento do tipo.$a$
where codigo='cp' and numero=313 and titulo='Art. 313-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Modificação não autorizada de sistema de informações$c$,
  aplicacao_pratica = $a$Pune o funcionário que modifica ou altera sistema de informações ou programa de informática sem autorização ou solicitação de autoridade competente, com detenção de 3 meses a 2 anos e multa. O parágrafo único aumenta as penas de um terço até a metade se da modificação resulta dano para a Administração Pública ou para o administrado. Difere do art. 313-A, que exige o fim de vantagem ou de dano e trata de dados, e não da alteração do sistema ou programa.$a$
where codigo='cp' and numero=313 and titulo='Art. 313-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Omissão do dever de vedar celular a preso$c$,
  aplicacao_pratica = $a$Pune o Diretor de Penitenciária e/ou agente público que deixa de cumprir seu dever de vedar ao preso o acesso a aparelho telefônico, de rádio ou similar que permita a comunicação com outros presos ou com o ambiente externo, com detenção de 3 meses a 1 ano. O crime é omissivo e próprio de quem tem o dever de vedar o acesso. A conduta de quem ingressa ou facilita a entrada do aparelho está no art. 349-A.$a$
where codigo='cp' and numero=319 and titulo='Art. 319-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Contrabando$c$,
  aplicacao_pratica = $a$Pune importar ou exportar mercadoria proibida, com reclusão de 2 a 5 anos. O § 1º equipara fato assimilado a contrabando em lei especial, a importação ou exportação clandestina de mercadoria que dependa de registro, análise ou autorização de órgão público, a reinserção no território nacional de mercadoria brasileira destinada à exportação, e a venda, o depósito, a utilização, a aquisição, o recebimento ou a ocultação de mercadoria proibida pela lei brasileira no exercício de atividade comercial ou industrial. O § 2º equipara a atividade comercial qualquer forma de comércio irregular ou clandestino de mercadorias estrangeiras, inclusive em residências. O § 3º aplica a pena em dobro se o contrabando é praticado em transporte aéreo, marítimo ou fluvial. O que define o crime é a proibição da mercadoria.$a$
where codigo='cp' and numero=334 and titulo='Art. 334-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Sonegação de contribuição previdenciária$c$,
  aplicacao_pratica = $a$Pune suprimir ou reduzir contribuição social previdenciária e qualquer acessório, por omissão de segurados da folha de pagamento ou de documento previdenciário (inciso I), por deixar de lançar mensalmente na contabilidade as quantias descontadas ou devidas (inciso II) ou por omitir receitas, lucros, remunerações ou outros fatos geradores (inciso III), com reclusão de 2 a 5 anos e multa. O § 1º extingue a punibilidade se o agente declara e confessa as contribuições e presta as informações antes do início da ação fiscal. O § 2º permite ao juiz deixar de aplicar a pena ou aplicar só multa, se o agente é primário e de bons antecedentes e, entre outras condições, o valor devido é igual ou inferior ao mínimo para execução fiscal (inciso II). O § 3º permite reduzir a pena de um terço até a metade ou aplicar só multa se o empregador não é pessoa jurídica e a folha mensal não ultrapassa R$ 1.510,00, valor reajustado conforme o § 4º. Os §§ 5º e 6º excluem a extinção do § 1º para o devedor contumaz inscrito no Cadin. Distingue-se da apropriação indébita previdenciária do art. 168-A, que trata de contribuição já descontada e não repassada.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 2
update legislacao set
  contexto = $c$Corrupção ativa em transação comercial internacional$c$,
  aplicacao_pratica = $a$Pune prometer, oferecer ou dar, direta ou indiretamente, vantagem indevida a funcionário público estrangeiro, ou a terceira pessoa, para determiná-lo a praticar, omitir ou retardar ato de ofício relacionado à transação comercial internacional, com reclusão de 1 a 8 anos e multa. O parágrafo único aumenta a pena de 1/3 se, em razão da vantagem ou promessa, o funcionário retarda ou omite o ato ou o pratica infringindo dever funcional. O conceito de funcionário público estrangeiro está no art. 337-D.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Tráfico de influência em transação comercial internacional$c$,
  aplicacao_pratica = $a$Pune solicitar, exigir, cobrar ou obter, para si ou para outrem, vantagem ou promessa de vantagem a pretexto de influir em ato praticado por funcionário público estrangeiro no exercício de suas funções, relacionado a transação comercial internacional, com reclusão de 2 a 5 anos e multa. O parágrafo único aumenta a pena da metade se o agente alega ou insinua que a vantagem é também destinada a funcionário estrangeiro. A conduta é a de quem vende a suposta influência, enquanto o art. 337-B trata de quem oferece a vantagem ao funcionário.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-C' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Conceito de funcionário público estrangeiro$c$,
  aplicacao_pratica = $a$Norma de definição, sem pena própria: considera funcionário público estrangeiro, para os efeitos penais, quem, ainda que transitoriamente ou sem remuneração, exerce cargo, emprego ou função pública em entidades estatais ou em representações diplomáticas de país estrangeiro. O parágrafo único equipara quem exerce cargo, emprego ou função em empresas controladas, direta ou indiretamente, pelo Poder Público de país estrangeiro ou em organizações públicas internacionais. Serve para delimitar o sujeito passivo dos arts. 337-B e 337-C.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-D' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Contratação direta ilegal$c$,
  aplicacao_pratica = $a$Pune admitir, possibilitar ou dar causa à contratação direta fora das hipóteses previstas em lei, com reclusão de 4 a 8 anos e multa. O tipo depende de a contratação direta (sem licitação) ocorrer fora das hipóteses legais, de modo que a defesa pode discutir o enquadramento da contratação nas hipóteses autorizadas.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-E' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Frustração do caráter competitivo de licitação$c$,
  aplicacao_pratica = $a$Pune frustrar ou fraudar, com o intuito de obter para si ou para outrem vantagem decorrente da adjudicação do objeto da licitação, o caráter competitivo do processo licitatório, com reclusão de 4 a 8 anos e multa. O intuito de obter vantagem decorrente da adjudicação é elemento do tipo, o que o diferencia do art. 337-I, que pune impedir, perturbar ou fraudar atos do processo licitatório sem esse fim especial.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-F' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 3
update legislacao set
  contexto = $c$Patrocínio de contratação indevida$c$,
  aplicacao_pratica = $a$Pune patrocinar, direta ou indiretamente, interesse privado perante a Administração Pública, dando causa à instauração de licitação ou à celebração de contrato cuja invalidação vier a ser decretada pelo Poder Judiciário, com reclusão de 6 meses a 3 anos e multa. O tipo pressupõe a invalidação do certame ou do contrato por decisão judicial.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-G' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Modificação ou pagamento irregular em contrato administrativo$c$,
  aplicacao_pratica = $a$Pune admitir, possibilitar ou dar causa a qualquer modificação ou vantagem, inclusive prorrogação contratual, em favor do contratado, durante a execução do contrato, sem autorização em lei, no edital ou nos instrumentos contratuais, ou pagar fatura com preterição da ordem cronológica de sua exigibilidade, com reclusão de 4 a 8 anos e multa. Alcança a fase de execução do contrato, e não a licitação.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-H' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Perturbação de processo licitatório$c$,
  aplicacao_pratica = $a$Pune impedir, perturbar ou fraudar a realização de qualquer ato de processo licitatório, com detenção de 6 meses a 3 anos e multa. Não exige intuito de vantagem decorrente da adjudicação, que é elemento do art. 337-F.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-I' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Violação de sigilo de proposta licitatória$c$,
  aplicacao_pratica = $a$Pune devassar o sigilo de proposta apresentada em processo licitatório ou proporcionar a terceiro o ensejo de devassá-lo, com detenção de 2 a 3 anos e multa. Alcança tanto quem devassa quanto quem possibilita a terceiro devassar a proposta.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-J' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Afastamento de licitante$c$,
  aplicacao_pratica = $a$Pune afastar ou tentar afastar licitante por meio de violência, grave ameaça, fraude ou oferecimento de vantagem de qualquer tipo, com reclusão de 3 a 5 anos e multa, além da pena correspondente à violência. O parágrafo único aplica a mesma pena a quem se abstém ou desiste de licitar em razão de vantagem oferecida. O verbo tentar também integra o tipo do caput.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-K' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 4
update legislacao set
  contexto = $c$Fraude em licitação ou contrato$c$,
  aplicacao_pratica = $a$Pune fraudar, em prejuízo da Administração Pública, licitação ou contrato dela decorrente, mediante entrega de mercadoria ou prestação de serviços de qualidade ou quantidade diversas das previstas no edital ou no contrato (inciso I), fornecimento de mercadoria falsificada, deteriorada, inservível ou vencida como se fosse verdadeira ou perfeita (inciso II), entrega de uma mercadoria por outra (inciso III), alteração da substância, qualidade ou quantidade do que é fornecido (inciso IV) ou qualquer meio fraudulento que torne injustamente mais onerosa a proposta ou a execução do contrato (inciso V), com reclusão de 4 a 8 anos e multa. O prejuízo à Administração e a adequação a um dos incisos devem ser demonstrados.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-L' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Licitação ou contrato com empresa declarada inidônea$c$,
  aplicacao_pratica = $a$Pune admitir à licitação empresa ou profissional declarado inidôneo, com reclusão de 1 a 3 anos e multa. O § 1º pune celebrar contrato com empresa ou profissional declarado inidôneo, com reclusão de 3 a 6 anos e multa. O § 2º aplica ao próprio declarado inidôneo a pena do caput, se participa de licitação, e a do § 1º, se contrata com a Administração Pública. Na peça, a declaração de inidoneidade vigente à data do fato é o ponto de prova.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-M' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Obstáculo a cadastro de licitante$c$,
  aplicacao_pratica = $a$Pune obstar, impedir ou dificultar injustamente a inscrição de qualquer interessado nos registros cadastrais, ou promover indevidamente a alteração, a suspensão ou o cancelamento de registro do inscrito, com reclusão de 6 meses a 2 anos e multa. Os advérbios injustamente e indevidamente indicam que a defesa pode discutir a regularidade do ato.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-N' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Omissão ou distorção de levantamento cadastral em contratação de projeto$c$,
  aplicacao_pratica = $a$Pune omitir, modificar ou entregar à Administração Pública levantamento cadastral ou condição de contorno em relevante dissonância com a realidade, em frustração ao caráter competitivo da licitação ou em detrimento da seleção da proposta mais vantajosa, em contratação para elaboração de projeto básico, projeto executivo ou anteprojeto, em diálogo competitivo ou em procedimento de manifestação de interesse, com reclusão de 6 meses a 3 anos e multa. O § 1º define condição de contorno (informações e levantamentos necessários para definir a solução de projeto e os preços, como sondagens, topografia, estudos de demanda e condições ambientais). O § 2º aplica a pena em dobro se o crime é praticado com o fim de obter benefício, direto ou indireto, próprio ou de outrem.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-O' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Multa nos crimes em licitações e contratos$c$,
  aplicacao_pratica = $a$Norma sobre a pena de multa: nos crimes do Capítulo, a multa segue a metodologia de cálculo do Código Penal e não pode ser inferior a 2% do valor do contrato licitado ou celebrado com contratação direta. Na dosimetria, o piso de 2% do valor do contrato limita a fixação da multa.$a$
where codigo='cp' and numero=337 and titulo='Art. 337-P' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 5
update legislacao set
  contexto = $c$Descumprimento de medida protetiva de urgência$c$,
  aplicacao_pratica = $a$Pune descumprir decisão judicial que defere medidas protetivas de urgência, com reclusão de 2 a 5 anos e multa. O § 1º dispõe que a configuração do crime independe da competência civil ou criminal do juiz que deferiu as medidas. O § 2º reserva à autoridade judicial a concessão de fiança em caso de prisão em flagrante, e o § 3º preserva a aplicação de outras sanções cabíveis. O que se prova é a existência da decisão e o seu descumprimento.$a$
where codigo='cp' and numero=338 and titulo='Art. 338-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Entrada de celular em estabelecimento prisional$c$,
  aplicacao_pratica = $a$Pune ingressar, promover, intermediar, auxiliar ou facilitar a entrada de aparelho telefônico de comunicação móvel, de rádio ou similar, sem autorização legal, em estabelecimento prisional, com detenção de 3 meses a 1 ano. A ausência de autorização legal é elemento do tipo. O dever de vedar o acesso do preso ao aparelho, que recai sobre o diretor ou agente público, é tratado no art. 319-A.$a$
where codigo='cp' and numero=349 and titulo='Art. 349-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Operação de crédito sem autorização$c$,
  aplicacao_pratica = $a$Pune ordenar, autorizar ou realizar operação de crédito, interno ou externo, sem prévia autorização legislativa, com reclusão de 1 a 2 anos. O parágrafo único aplica a mesma pena a quem realiza a operação com inobservância de limite, condição ou montante estabelecido em lei ou em resolução do Senado Federal (inciso I), ou quando o montante da dívida consolidada ultrapassa o limite máximo autorizado por lei (inciso II). Integra os crimes contra as finanças públicas.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Restos a pagar sem empenho prévio ou acima do limite$c$,
  aplicacao_pratica = $a$Pune ordenar ou autorizar a inscrição em restos a pagar de despesa que não tenha sido previamente empenhada ou que exceda limite estabelecido em lei, com detenção de 6 meses a 2 anos. Integra os crimes contra as finanças públicas.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Obrigação de despesa no fim do mandato$c$,
  aplicacao_pratica = $a$Pune ordenar ou autorizar a assunção de obrigação, nos dois últimos quadrimestres do último ano do mandato ou legislatura, cuja despesa não possa ser paga no mesmo exercício financeiro ou, restando parcela a pagar no exercício seguinte, sem contrapartida suficiente de disponibilidade de caixa, com reclusão de 1 a 4 anos. O período (dois últimos quadrimestres do último ano do mandato) e a ausência de disponibilidade de caixa são os elementos centrais.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-C' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 6
update legislacao set
  contexto = $c$Despesa não autorizada por lei$c$,
  aplicacao_pratica = $a$Pune ordenar despesa não autorizada por lei, com reclusão de 1 a 4 anos. O tipo gira em torno da ausência de autorização legal para a despesa ordenada.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-D' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Garantia sem contragarantia$c$,
  aplicacao_pratica = $a$Pune prestar garantia em operação de crédito sem que tenha sido constituída contragarantia em valor igual ou superior ao da garantia prestada, na forma da lei, com detenção de 3 meses a 1 ano. O elemento a verificar é a existência e o valor da contragarantia.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-E' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Omissão de cancelamento de restos a pagar$c$,
  aplicacao_pratica = $a$Pune deixar de ordenar, de autorizar ou de promover o cancelamento do montante de restos a pagar inscrito em valor superior ao permitido em lei, com detenção de 6 meses a 2 anos. É crime omissivo, o oposto da inscrição indevida punida no art. 359-B.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-F' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Aumento de despesa com pessoal no fim do mandato$c$,
  aplicacao_pratica = $a$Pune ordenar, autorizar ou executar ato que acarrete aumento de despesa total com pessoal nos cento e oitenta dias anteriores ao final do mandato ou da legislatura, com reclusão de 1 a 4 anos. O marco temporal de 180 dias antes do fim do mandato ou legislatura é elemento do tipo.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-G' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Oferta irregular de títulos da dívida pública$c$,
  aplicacao_pratica = $a$Pune ordenar, autorizar ou promover a oferta pública ou a colocação no mercado financeiro de títulos da dívida pública sem que tenham sido criados por lei ou sem que estejam registrados em sistema centralizado de liquidação e de custódia, com reclusão de 1 a 4 anos. Basta a falta de criação por lei ou de registro em sistema centralizado, e as duas hipóteses são alternativas.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-H' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 7
update legislacao set
  contexto = $c$Negociação com estrangeiro para provocar guerra$c$,
  aplicacao_pratica = $a$Pune negociar com governo ou grupo estrangeiro, ou seus agentes, com o fim de provocar atos típicos de guerra contra o País ou invadi-lo, com reclusão de 3 a 8 anos. O § 1º aumenta a pena de metade até o dobro se declarada guerra em decorrência das condutas do caput. O § 2º pune a participação em operação bélica com o fim de submeter o território nacional, ou parte dele, ao domínio ou à soberania de outro país, com reclusão de 4 a 12 anos.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-I' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Atentado à integridade nacional$c$,
  aplicacao_pratica = $a$Pune praticar violência ou grave ameaça com a finalidade de desmembrar parte do território nacional para constituir país independente, com reclusão de 2 a 6 anos, além da pena correspondente à violência. A finalidade de desmembramento é elemento do tipo, e a violência é punida em cumulação.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-J' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Espionagem$c$,
  aplicacao_pratica = $a$Pune entregar a governo estrangeiro, a seus agentes ou a organização criminosa estrangeira, em desacordo com determinação legal ou regulamentar, documento ou informação classificados como secretos ou ultrassecretos, cuja revelação possa colocar em perigo a preservação da ordem constitucional ou a soberania nacional, com reclusão de 3 a 12 anos. O § 1º estende a pena a quem presta auxílio a espião, conhecendo essa circunstância, para subtraí-lo à ação da autoridade pública. O § 2º prevê reclusão de 6 a 15 anos se o documento ou informação é transmitido ou revelado com violação do dever de sigilo. O § 3º pune, com detenção de 1 a 4 anos, facilitar a prática dos crimes do artigo mediante atribuição, fornecimento ou empréstimo de senha ou outro acesso de pessoas não autorizadas. O § 4º exclui o crime na comunicação, entrega ou publicação de informações ou documentos com o fim de expor a prática de crime ou a violação de direitos humanos.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-K' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Abolição violenta do Estado Democrático de Direito$c$,
  aplicacao_pratica = $a$Pune tentar, com emprego de violência ou grave ameaça, abolir o Estado Democrático de Direito, impedindo ou restringindo o exercício dos poderes constitucionais, com reclusão de 4 a 8 anos, além da pena correspondente à violência. O verbo tentar integra o próprio tipo descrito. A violência ou grave ameaça é elemento do tipo, e a pena da violência é cumulada.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-L' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Golpe de Estado$c$,
  aplicacao_pratica = $a$Pune tentar depor, por meio de violência ou grave ameaça, o governo legitimamente constituído, com reclusão de 4 a 12 anos, além da pena correspondente à violência. Como no art. 359-L, o verbo tentar integra o tipo. Enquanto o art. 359-L visa a abolição do Estado Democrático de Direito, este artigo tem por objeto a deposição do governo legitimamente constituído.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-M' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 8
update legislacao set
  contexto = $c$Concurso entre os crimes contra o Estado Democrático$c$,
  aplicacao_pratica = $a$Regra de aplicação da pena: quando os delitos do Capítulo estão inseridos no mesmo contexto, a pena é aplicada, ainda que haja desígnio autônomo, na forma do concurso formal próprio da primeira parte do art. 70, vedados o cômputo cumulativo da segunda parte desse dispositivo e o do art. 69. Na dosimetria, afasta a soma das penas e impõe a mais grave aumentada de 1/6 até metade. Texto introduzido pela Lei nº 15.402/2026.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-M-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Redução de pena em contexto de multidão$c$,
  aplicacao_pratica = $a$Causa de diminuição: quando os crimes do Capítulo são praticados em contexto de multidão, a pena é reduzida de 1/3 a 2/3, desde que o agente não tenha praticado ato de financiamento nem exercido papel de liderança. Na defesa, exige demonstrar o contexto de multidão e a ausência de financiamento e de liderança. Texto introduzido pela Lei nº 15.402/2026.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-M-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Sabotagem do sistema eletrônico de votação$c$,
  aplicacao_pratica = $a$Pune impedir ou perturbar a eleição ou a aferição de seu resultado, mediante violação indevida de mecanismos de segurança do sistema eletrônico de votação estabelecido pela Justiça Eleitoral, com reclusão de 3 a 6 anos e multa. O meio exigido é a violação indevida dos mecanismos de segurança do sistema.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-N' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Violência política$c$,
  aplicacao_pratica = $a$Pune restringir, impedir ou dificultar, com emprego de violência física, sexual ou psicológica, o exercício de direitos políticos a qualquer pessoa em razão de seu sexo, raça, cor, etnia, religião ou procedência nacional, com reclusão de 3 a 6 anos e multa, além da pena correspondente à violência. A motivação discriminatória é elemento do tipo.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-P' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Sabotagem de meios de defesa nacional$c$,
  aplicacao_pratica = $a$Pune destruir ou inutilizar meios de comunicação ao público, estabelecimentos, instalações ou serviços destinados à defesa nacional, com o fim de abolir o Estado Democrático de Direito, com reclusão de 2 a 8 anos. O fim de abolir o Estado Democrático de Direito é elemento do tipo.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-R' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 9
update legislacao set
  contexto = $c$Exclusão de crime: manifestação política e atividade jornalística$c$,
  aplicacao_pratica = $a$Norma permissiva: não constitui crime do Título dos crimes contra o Estado Democrático de Direito a manifestação crítica aos poderes constitucionais, nem a atividade jornalística, nem a reivindicação de direitos e garantias constitucionais por meio de passeatas, reuniões, greves, aglomerações ou qualquer outra forma de manifestação política com propósitos sociais. Na defesa, é o fundamento para afastar a tipicidade quando a conduta imputada se limita a essas formas de manifestação.$a$
where codigo='cp' and numero=359 and titulo='Art. 359-T' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Cláusula de revogação e ressalvas de legislação especial$c$,
  aplicacao_pratica = $a$Disposição final: ressalvada a legislação especial sobre os crimes contra a existência, a segurança e a integridade do Estado e contra a guarda e o emprego da economia popular, os crimes de imprensa e os de falência, os de responsabilidade do Presidente da República e dos Governadores ou Interventores, e os crimes militares, revogam-se as disposições em contrário. As matérias ressalvadas seguem reguladas por legislação especial.$a$
where codigo='cp' and numero=360 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Entrada em vigor do Código$c$,
  aplicacao_pratica = $a$Disposição final: o Código Penal entra em vigor no dia 1º de janeiro de 1942. A vigência de cada artigo alterado depois consta da anotação do próprio dispositivo.$a$
where codigo='cp' and numero=361 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');
