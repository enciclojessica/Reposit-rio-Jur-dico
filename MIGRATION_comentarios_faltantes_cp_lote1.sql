-- Comentários (contexto e aplicacao_pratica) dos artigos do CP sem comentário, lote 1 (arts. 35 a 183-A).
-- Só a partir do texto do artigo; remissões conferidas por SELECT em 09/10/2026. Sem jurisprudência ou doutrina.
-- Idempotente: só preenche quando contexto está vazio. Sem begin/commit, para rodar em blocos pequenos.

-- BLOCO 1
update legislacao set
  contexto = $c$Regime semiaberto: início do cumprimento e trabalho$c$,
  aplicacao_pratica = $a$Define as regras do condenado que inicia a pena em regime semiaberto: aplica-se a ele o exame criminológico de classificação do art. 34, caput (art. 35, caput); o § 1º impõe trabalho em comum no período diurno, em colônia agrícola, industrial ou estabelecimento similar; o § 2º admite o trabalho externo e a frequência a cursos supletivos profissionalizantes, de instrução de segundo grau ou superior. Serve de base para pedidos de trabalho externo e de estudo durante o cumprimento.$a$
where codigo='cp' and numero=35 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Cumprimento da pena pela mulher$c$,
  aplicacao_pratica = $a$Estabelece que a mulher cumpre pena em estabelecimento próprio, respeitados os deveres e direitos inerentes à sua condição pessoal e, no que couber, as demais regras do Capítulo. Fundamenta pedido de transferência quando a condenada é mantida em unidade que não é própria para mulheres.$a$
where codigo='cp' and numero=37 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Remissão à legislação especial sobre direitos e deveres do preso$c$,
  aplicacao_pratica = $a$Não traz regra própria: remete à legislação especial (a Lei de Execução Penal, Lei nº 7.210/1984) a matéria dos arts. 38 e 39, os deveres e direitos do preso, os critérios de revogação e transferência de regimes e as infrações disciplinares com as sanções correspondentes. Na peça, a discussão sobre falta disciplinar, regressão de regime ou direitos do preso deve ser fundamentada na lei de execução, e este artigo indica por que o Código Penal não a esgota.$a$
where codigo='cp' and numero=40 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Substituição da pena: prestação pecuniária e perda de bens$c$,
  aplicacao_pratica = $a$O caput apenas remete ao art. 44 (cabimento da substituição) e aos arts. 46, 47 e 48 (demais penas restritivas). O conteúdo próprio está nos parágrafos: § 1º, prestação pecuniária paga à vítima, a dependentes ou a entidade com destinação social, de 1 a 360 salários mínimos, com dedução do valor em eventual reparação civil; § 2º, possibilidade de prestação de outra natureza, se o beneficiário aceitar; § 3º, perda de bens e valores em favor do Fundo Penitenciário Nacional, com teto no maior valor entre o prejuízo causado e o provento obtido com o crime.$a$
where codigo='cp' and numero=45 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Multa: suspensão por doença mental$c$,
  aplicacao_pratica = $a$Suspende a execução da pena de multa quando, depois da condenação, sobrevém doença mental ao condenado. Aplica-se apenas à execução da multa já imposta; a doença mental ao tempo do fato é outra matéria (art. 26).$a$
where codigo='cp' and numero=52 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 2
update legislacao set
  contexto = $c$Duração das penas restritivas de direitos$c$,
  aplicacao_pratica = $a$Fixa a duração das penas restritivas dos incisos III, IV, V e VI do art. 43: é a mesma da pena privativa de liberdade substituída, ressalvado o § 4º do art. 46. Na peça, serve para calcular o tempo da prestação de serviços, da interdição ou da limitação de fim de semana quando se pede a substituição.$a$
where codigo='cp' and numero=55 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Interdição de direitos: crimes no exercício de função$c$,
  aplicacao_pratica = $a$Define quando se aplicam as interdições dos incisos I e II do art. 47 (proibição de cargo, função, atividade pública ou mandato eletivo, e de profissão, atividade ou ofício que dependam de habilitação, licença ou autorização do poder público): em todo crime cometido no exercício de profissão, atividade, ofício, cargo ou função, sempre que houver violação dos deveres inerentes a eles. Na defesa, a ausência de violação desses deveres afasta a interdição.$a$
where codigo='cp' and numero=56 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Suspensão de habilitação para dirigir: crimes culposos de trânsito$c$,
  aplicacao_pratica = $a$Aplica a interdição do inciso III do art. 47 (suspensão de autorização ou de habilitação para dirigir veículo) aos crimes culposos de trânsito. Em contraste com o art. 56, que trata das interdições dos incisos I e II, este artigo é restrito aos crimes culposos de trânsito.$a$
where codigo='cp' and numero=57 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Execução no concurso de infrações$c$,
  aplicacao_pratica = $a$Trata da ordem de execução, não do cálculo da pena: no concurso de infrações, executa-se primeiro a pena mais grave. A forma de somar ou exasperar as penas está nas regras do concurso material (art. 69), do concurso formal (art. 70) e do crime continuado (art. 71). Na execução, serve para conferir a ordem em que as penas estão sendo cumpridas.$a$
where codigo='cp' and numero=76 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Sursis: condições adicionais fixadas na sentença$c$,
  aplicacao_pratica = $a$Permite que a sentença acrescente outras condições à suspensão condicional da pena (art. 77), desde que adequadas ao fato e à situação pessoal do condenado. É o fundamento para impugnar condição genérica ou desproporcional e para pedir condição compatível com a realidade do condenado, por exemplo a de residência ou a de comparecimento.$a$
where codigo='cp' and numero=79 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 3
update legislacao set
  contexto = $c$Livramento condicional: condições na sentença$c$,
  aplicacao_pratica = $a$Exige que a sentença que concede o livramento especifique as condições a que ele fica subordinado. Os requisitos para a concessão estão no art. 83; as condições aqui tratadas são as obrigações que o liberado deve cumprir, e seu descumprimento pode levar à revogação (art. 87).$a$
where codigo='cp' and numero=85 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Livramento condicional: extinção da pena suspensa por novo processo$c$,
  aplicacao_pratica = $a$Impede o juiz de declarar extinta a pena enquanto não transitar em julgado a sentença de processo a que o liberado responde por crime cometido na vigência do livramento. Complementa o art. 90 (extinção da pena se o livramento não é revogado até o término) e o art. 86 (revogação por condenação irrecorrível a pena privativa de liberdade). Na prática, o término do prazo não basta se há processo pendente por fato praticado durante o livramento.$a$
where codigo='cp' and numero=89 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Perda alargada de bens (patrimônio incompatível)$c$,
  aplicacao_pratica = $a$Permite a perda, como produto ou proveito do crime, dos bens correspondentes à diferença entre o patrimônio do condenado e o compatível com seu rendimento lícito, quando a infração tem pena máxima superior a 6 anos de reclusão. O § 1º define patrimônio (bens titulados ou de domínio e benefício do condenado, e bens transferidos a terceiros a título gratuito ou por contraprestação irrisória); o § 2º permite ao condenado demonstrar a inexistência da incompatibilidade ou a origem lícita; o § 3º exige pedido expresso do Ministério Público na denúncia, com indicação da diferença; o § 4º impõe à sentença declarar o valor e especificar os bens; o § 5º trata dos instrumentos de organizações criminosas e milícias. Difere do art. 91, que cuida dos efeitos gerais da condenação. Na defesa, a ausência de pedido expresso na denúncia (§ 3º) e a prova da origem lícita (§ 2º) são os pontos centrais.$a$
where codigo='cp' and numero=91 and titulo='Art. 91-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Medida de segurança em substituição à pena do semi-imputável$c$,
  aplicacao_pratica = $a$No caso do parágrafo único do art. 26 (redução de pena do agente não inteiramente capaz), permite substituir a pena privativa de liberdade por internação ou tratamento ambulatorial, se o condenado precisa de especial tratamento curativo, pelo prazo mínimo de 1 a 3 anos, nos termos do art. 97 e de seus §§ 1º a 4º. Na peça, é o fundamento para pedir a medida de segurança em lugar da pena quando há laudo de semi-imputabilidade.$a$
where codigo='cp' and numero=98 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Extinção da punibilidade e crimes conexos$c$,
  aplicacao_pratica = $a$Duas regras: a extinção da punibilidade de crime que é pressuposto, elemento constitutivo ou circunstância agravante de outro não se estende a este; e, nos crimes conexos, a extinção da punibilidade de um deles não impede, quanto aos outros, a agravação da pena resultante da conexão. Na defesa, impede concluir automaticamente que a prescrição ou outra causa extintiva de um crime beneficie o outro.$a$
where codigo='cp' and numero=108 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 4
update legislacao set
  contexto = $c$Feminicídio: tipo próprio$c$,
  aplicacao_pratica = $a$Tipifica o feminicídio como crime autônomo, em artigo separado do homicídio do art. 121, com pena de reclusão de 20 a 40 anos. O § 1º define as razões da condição do sexo feminino: violência doméstica e familiar e menosprezo ou discriminação à condição de mulher. O § 2º traz causas de aumento de 1/3 até a metade (gestação ou três meses após o parto, vítima mãe ou responsável por criança, adolescente ou pessoa com deficiência, vítima vulnerável, presença física ou virtual de descendente ou ascendente, descumprimento de medidas protetivas, e circunstâncias dos incisos III, IV e VIII do § 2º do art. 121). O § 3º comunica ao coautor ou partícipe as circunstâncias pessoais elementares do § 1º.$a$
where codigo='cp' and numero=121 and titulo='Art. 121-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Vicaricídio: morte de pessoa ligada à mulher para atingi-la$c$,
  aplicacao_pratica = $a$Tipifica matar descendente, ascendente, dependente, enteado ou pessoa sob guarda ou responsabilidade direta da mulher, com o fim específico de causar-lhe sofrimento, punição ou controle, no contexto de violência doméstica e familiar, com pena de reclusão de 20 a 40 anos. A vítima é a pessoa ligada à mulher, e o alvo do dolo específico é a própria mulher, o que o distingue do feminicídio do art. 121-A. O parágrafo único aumenta a pena de 1/3 até a metade se o crime é praticado na presença da mulher, contra criança, adolescente, idoso ou pessoa com deficiência, ou em descumprimento de medida protetiva de urgência. O fim específico e o contexto de violência doméstica precisam ser provados.$a$
where codigo='cp' and numero=121 and titulo='Art. 121-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Exigência de garantia para atendimento médico emergencial$c$,
  aplicacao_pratica = $a$Pune quem exige cheque-caução, nota promissória ou qualquer garantia, ou o preenchimento prévio de formulários administrativos, como condição para o atendimento médico-hospitalar emergencial, com detenção de 3 meses a 1 ano e multa. O parágrafo único aumenta a pena até o dobro se da negativa resulta lesão corporal grave e até o triplo se resulta morte. A condição é a exigência feita antes do atendimento emergencial, e o resultado agrava a pena.$a$
where codigo='cp' and numero=135 and titulo='Art. 135-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Intimidação sistemática (bullying)$c$,
  aplicacao_pratica = $a$Tipifica intimidar sistematicamente, individualmente ou em grupo, uma ou mais pessoas, de modo intencional e repetitivo e sem motivação evidente, por atos de intimidação, humilhação ou discriminação, ou por ações verbais, morais, sexuais, sociais, psicológicas, físicas, materiais ou virtuais. O parágrafo único trata da conduta realizada por rede de computadores, rede social, aplicativos, jogos on-line ou outro meio digital, ou transmitida em tempo real, com pena de reclusão de 2 a 4 anos e multa, se a conduta não constituir crime mais grave. Na peça, a repetição e o caráter sistemático são os elementos a demonstrar ou a contestar.$a$
where codigo='cp' and numero=146 and titulo='Art. 146-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 5
update legislacao set
  contexto = $c$Perseguição (stalking)$c$,
  aplicacao_pratica = $a$Tipifica perseguir alguém, reiteradamente e por qualquer meio, ameaçando-lhe a integridade física ou psicológica, restringindo-lhe a locomoção ou invadindo ou perturbando sua esfera de liberdade ou privacidade, com reclusão de 6 meses a 2 anos e multa. A reiteração é elemento do tipo. O § 1º aumenta a pena pela metade em casos como vítima criança, adolescente ou idosa, concurso de 2 ou mais pessoas ou emprego de arma; o § 2º aplica as penas sem prejuízo das correspondentes à violência; o § 3º exige representação.$a$
where codigo='cp' and numero=147 and titulo='Art. 147-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Violência psicológica contra a mulher$c$,
  aplicacao_pratica = $a$Tipifica causar dano emocional à mulher que a prejudique e perturbe seu pleno desenvolvimento ou vise a degradar ou controlar suas ações, comportamentos, crenças e decisões, mediante ameaça, constrangimento, humilhação, manipulação, isolamento, chantagem, ridicularização, limitação do direito de ir e vir ou outro meio que prejudique sua saúde psicológica. O parágrafo único aumenta a pena pela metade se o crime é cometido com inteligência artificial ou outro recurso tecnológico que altere imagem ou som da vítima. O dano emocional e o nexo com os meios descritos são os pontos a provar.$a$
where codigo='cp' and numero=147 and titulo='Art. 147-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Ameaça no contexto do crime organizado$c$,
  aplicacao_pratica = $a$Tipo próprio de ameaça: ameaçar alguém, por palavra, escrito, gesto ou outro meio simbólico, de causar-lhe mal injusto e grave, no contexto da atuação ou para a consecução das condutas do art. 2º da lei do marco legal do combate ao crime organizado, com reclusão de 1 a 3 anos. O que o diferencia da ameaça comum é o contexto de crime organizado, que precisa ser demonstrado pela acusação.$a$
where codigo='cp' and numero=147 and titulo='Art. 147-C' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Tráfico de pessoas$c$,
  aplicacao_pratica = $a$Tipifica agenciar, aliciar, recrutar, transportar, transferir, comprar, alojar ou acolher pessoa, mediante grave ameaça, violência, coação, fraude ou abuso, com a finalidade de remoção de órgãos, tecidos ou partes do corpo, trabalho análogo ao de escravo, servidão, adoção ilegal ou exploração sexual, com reclusão de 4 a 8 anos e multa. A finalidade é elemento do tipo e define a capitulação. O § 1º aumenta a pena de um terço até a metade (funcionário público, vítima criança, adolescente, idosa ou com deficiência, prevalecimento de relação de poder ou dependência, saída da vítima do território nacional); o § 2º reduz de um a dois terços se o agente é primário e não integra organização criminosa.$a$
where codigo='cp' and numero=149 and titulo='Art. 149-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Violação de correspondência comercial$c$,
  aplicacao_pratica = $a$Pune o sócio ou empregado de estabelecimento comercial ou industrial que abusa dessa condição para desviar, sonegar, subtrair ou suprimir correspondência, ou revelar seu conteúdo a estranho, com detenção de 3 meses a 2 anos. O sujeito ativo é qualificado pela relação com o estabelecimento. O parágrafo único exige representação.$a$
where codigo='cp' and numero=152 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 6
update legislacao set
  contexto = $c$Invasão de dispositivo informático$c$,
  aplicacao_pratica = $a$Tipifica invadir dispositivo informático de uso alheio, conectado ou não à rede, para obter, adulterar ou destruir dados sem autorização, ou instalar vulnerabilidades para obter vantagem ilícita, com reclusão de 1 a 4 anos e multa. O § 1º equipara quem produz, oferece, distribui, vende ou difunde programa destinado a permitir a invasão; o § 2º aumenta de 1/3 a 2/3 se há prejuízo econômico; o § 3º é a forma qualificada (conteúdo de comunicações privadas, segredos comerciais ou industriais, informações sigilosas ou controle remoto), com reclusão de 2 a 5 anos e multa; o § 4º aumenta de um a dois terços se há divulgação ou comercialização dos dados; o § 5º aumenta de um terço à metade se a vítima é autoridade dos incisos I a IV.$a$
where codigo='cp' and numero=154 and titulo='Art. 154-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Invasão de dispositivo: ação penal$c$,
  aplicacao_pratica = $a$Define que os crimes do art. 154-A dependem de representação, salvo se cometidos contra a administração pública direta ou indireta de qualquer dos Poderes da União, Estados, Distrito Federal ou Municípios, ou contra empresas concessionárias de serviços públicos. Na peça da vítima, a representação deve ser verificada dentro do prazo; na defesa, a falta dela, quando não incide a exceção, é falta de condição de procedibilidade.$a$
where codigo='cp' and numero=154 and titulo='Art. 154-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Supressão ou alteração de marca em animais$c$,
  aplicacao_pratica = $a$Pune suprimir ou alterar, indevidamente, em gado ou rebanho alheio, marca ou sinal indicativo de propriedade, com detenção de 6 meses a 3 anos e multa. O objeto é a marca ou sinal que identifica o dono, e o elemento a provar é a alteração indevida em animais de terceiro.$a$
where codigo='cp' and numero=162 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Dano em coisa tombada$c$,
  aplicacao_pratica = $a$Pune destruir, inutilizar ou deteriorar coisa tombada pela autoridade competente em virtude de valor artístico, arqueológico ou histórico, com detenção de 6 meses a 2 anos e multa. É forma especial do dano do art. 163 (detenção de 1 a 6 meses, ou multa), com pena maior em razão do tombamento. O tombamento pela autoridade competente precisa ser comprovado.$a$
where codigo='cp' and numero=165 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração de local especialmente protegido$c$,
  aplicacao_pratica = $a$Pune alterar, sem licença da autoridade competente, o aspecto de local especialmente protegido por lei, com detenção de 1 mês a 1 ano ou multa. A ausência de licença e a proteção legal do local são os elementos a demonstrar.$a$
where codigo='cp' and numero=166 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 7
update legislacao set
  contexto = $c$Dano: casos de ação penal privada$c$,
  aplicacao_pratica = $a$Fixa que se procede mediante queixa nos casos do art. 163, parágrafo único, IV (dano por motivo egoístico ou com prejuízo considerável para a vítima) e do art. 164 (introdução ou abandono de animais em propriedade alheia). Na peça, a legitimidade ativa é do ofendido, por queixa, e o prazo decadencial deve ser observado.$a$
where codigo='cp' and numero=167 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Apropriação indébita previdenciária$c$,
  aplicacao_pratica = $a$Pune deixar de repassar à previdência social as contribuições recolhidas dos contribuintes, no prazo e forma legal ou convencional, com reclusão de 2 a 5 anos e multa. O § 1º equipara quem deixa de recolher contribuição descontada de segurados, terceiros ou arrecadada do público, quem não recolhe contribuições integradas a despesas ou custos, e quem paga benefício já reembolsado pela previdência. O § 2º extingue a punibilidade se o agente declara, confessa e paga, com as informações devidas, antes do início da ação fiscal; o § 3º permite ao juiz deixar de aplicar a pena ou aplicar só multa (agente primário, bons antecedentes e pagamento antes da denúncia ou valor mínimo de execução fiscal); o § 4º afasta essa faculdade em parcelamentos de valor superior ao mínimo; os §§ 5º e 6º excluem a extinção do § 2º para o devedor contumaz inscrito no Cadin.$a$
where codigo='cp' and numero=168 and titulo='Art. 168-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Apropriação indébita: aplicação do furto privilegiado$c$,
  aplicacao_pratica = $a$Manda aplicar aos crimes do capítulo da apropriação indébita o art. 155, § 2º: se o criminoso é primário e é de pequeno valor a coisa, o juiz pode substituir a reclusão por detenção, diminuir a pena de um a dois terços ou aplicar somente multa. Na defesa, é o fundamento para pedir o privilégio com a prova de primariedade e do pequeno valor.$a$
where codigo='cp' and numero=170 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Fraude com ativos virtuais e valores mobiliários$c$,
  aplicacao_pratica = $a$Tipifica organizar, gerir, ofertar ou distribuir carteiras, ou intermediar operações que envolvam ativos virtuais, valores mobiliários ou outros ativos financeiros, com o fim de obter vantagem ilícita em prejuízo alheio, induzindo ou mantendo alguém em erro por artifício, ardil ou meio fraudulento. É tipo próprio, distinto do estelionato do art. 171, pelo objeto (operações com ativos) e pela atuação organizacional. O erro induzido ou mantido e o fim de vantagem ilícita são os elementos a provar.$a$
where codigo='cp' and numero=171 and titulo='Art. 171-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Fraudes na fundação e administração de sociedade por ações$c$,
  aplicacao_pratica = $a$O caput pune quem promove a fundação de sociedade por ações com afirmação falsa sobre sua constituição ou ocultando fato relativo a ela, com reclusão de 1 a 4 anos e multa, se o fato não constitui crime contra a economia popular. O § 1º lista condutas de diretor, gerente, fiscal e liquidante (afirmação falsa sobre condições econômicas, falsa cotação, empréstimo da sociedade a si, compra e venda de ações da própria sociedade, penhor de ações próprias, lucros fictícios, aprovação de contas por interposta pessoa), mais o representante da sociedade anônima estrangeira (inciso IX). O § 2º pune o acionista que negocia o voto em assembleia geral, com detenção de 6 meses a 2 anos e multa. Cada inciso exige identificar o cargo do agente e a conduta específica.$a$
where codigo='cp' and numero=177 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 8
update legislacao set
  contexto = $c$Emissão irregular de conhecimento de depósito ou warrant$c$,
  aplicacao_pratica = $a$Pune emitir conhecimento de depósito ou warrant em desacordo com disposição legal, com reclusão de 1 a 4 anos e multa. A conduta é a emissão desses títulos sem observar a lei que os rege.$a$
where codigo='cp' and numero=178 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Receptação de animal$c$,
  aplicacao_pratica = $a$Pune adquirir, receber, transportar, conduzir, ocultar, ter em depósito ou vender, com a finalidade de produção ou comercialização, semovente domesticável de produção (ainda que abatido ou dividido em partes) ou animal doméstico que sabe ou deve saber ser produto de crime, com reclusão de 3 a 8 anos. A finalidade de produção ou comercialização e o conhecimento (efetivo ou devido) da origem criminosa são elementos a provar, e a redação é da Lei nº 15.397/2026.$a$
where codigo='cp' and numero=180 and titulo='Art. 180-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Crimes patrimoniais contra instituições financeiras e segurança privada$c$,
  aplicacao_pratica = $a$Aumenta as penas de 1/3 até o dobro nos crimes do Título dos crimes contra o patrimônio, quando cometidos contra instituições financeiras e prestadores de serviço de segurança privada do Estatuto da Segurança Privada e da Segurança das Instituições Financeiras. É causa de aumento aplicada na terceira fase da dosimetria, e a vítima precisa se enquadrar nessas categorias.$a$
where codigo='cp' and numero=183 and titulo='Art. 183-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');
