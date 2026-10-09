-- Comentários didáticos (contexto e aplicacao_pratica) dos caputs vigentes que ainda não tinham
-- comentário em CC (9), CDC (14) e CPC (8), mais aplicacao_pratica do art. 95 da Lei 9.099/1995.
-- Redigidos só a partir do texto do dispositivo (sem jurisprudência ou doutrina).
-- Backup prévio: tabela public.legislacao_bkp_20261009 (criada em 09/10/2026).
-- Cada UPDATE só atua se o caput ainda estiver sem comentário (idempotente).

begin;

-- ===== CC =====
update legislacao set
  contexto = $c$Extensão da hipoteca$c$,
  aplicacao_pratica = $a$Permite ao proprietário estender a hipoteca já registrada para garantir novas obrigações em favor do mesmo credor, mantidos o registro e a publicidade originais, mas respeitada a prioridade de direitos contraditórios já ingressados na matrícula. A extensão não pode exceder o prazo e o valor máximo da garantia original (§ 1º) e é averbada na matrícula, com preferência da obrigação inicial e, havendo várias extensões, da obrigação mais antiga pela averbação (§ 2º). Com vários credores na mesma hipoteca estendida, só o de crédito mais prioritário executa a garantia, judicial ou extrajudicialmente, salvo convenção diversa de todos (§ 3º).$a$
where codigo='cc' and numero=1487 and titulo='Art. 1487-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Direito real de laje: instituição$c$,
  aplicacao_pratica = $a$Autoriza o proprietário da construção-base a ceder a superfície superior ou inferior para que o titular da laje mantenha unidade distinta da originalmente construída sobre o solo. A laje é unidade imobiliária autônoma, em matrícula própria, com poderes de usar, gozar e dispor (§§ 1º e 3º), e não atribui fração ideal de terreno nem participação nas áreas já edificadas (§ 4º). O titular responde pelos encargos e tributos da sua unidade (§ 2º), e Municípios e Distrito Federal podem dispor sobre posturas edilícias e urbanísticas (§ 5º). O § 6º admite laje sucessiva, com autorização expressa dos titulares da construção-base e das demais lajes.$a$
where codigo='cc' and numero=1510 and titulo='Art. 1510-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Direito real de laje: limites ao titular$c$,
  aplicacao_pratica = $a$Veda ao titular da laje prejudicar, com obras novas ou falta de reparação, a segurança, a linha arquitetônica ou o arranjo estético do edifício, observadas as posturas da legislação local. Serve de base para pretensão de abstenção ou de reparo contra obra que comprometa esses bens.$a$
where codigo='cc' and numero=1510 and titulo='Art. 1510-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Direito real de laje: despesas comuns$c$,
  aplicacao_pratica = $a$As despesas de conservação e fruição das partes que servem a todo o edifício e de serviços de interesse comum são partilhadas entre o proprietário da construção-base e o titular da laje, na proporção estipulada em contrato, sem prejuízo das normas do condomínio edilício, no que couber. O § 1º enumera as partes que servem a todo o edifício (estrutura, telhado ou terraços de cobertura, instalações gerais e coisas afetadas ao uso de todo o edifício). O § 2º assegura a qualquer interessado promover reparações urgentes, na forma do parágrafo único do art. 249.$a$
where codigo='cc' and numero=1510 and titulo='Art. 1510-C' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Direito real de laje: preferência na alienação$c$,
  aplicacao_pratica = $a$Na alienação de unidade sobreposta, o titular da construção-base e o da laje, nessa ordem, têm preferência em igualdade de condições com terceiros, devendo ser cientificados por escrito para se manifestar em trinta dias, salvo contrato em sentido diverso. Quem não foi cientificado pode haver para si a parte alienada, mediante depósito do preço, se requerer em cento e oitenta dias (prazo decadencial) contados da alienação (§ 1º). Havendo mais de uma laje, a preferência é sucessiva, das ascendentes e depois das descendentes, com prioridade para a mais próxima da unidade alienada (§ 2º).$a$
where codigo='cc' and numero=1510 and titulo='Art. 1510-D' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Direito real de laje: extinção$c$,
  aplicacao_pratica = $a$A ruína da construção-base extingue o direito real de laje, salvo se este foi instituído sobre o subsolo ou se a construção-base for reconstruída no prazo de cinco anos. O parágrafo único preserva o direito a reparação civil contra o culpado pela ruína.$a$
where codigo='cc' and numero=1510 and titulo='Art. 1510-E' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Curatela compartilhada$c$,
  aplicacao_pratica = $a$Faculta ao juiz, na nomeação de curador para a pessoa com deficiência, estabelecer curatela compartilhada a mais de uma pessoa. Ponto a requerer e fundamentar no processo de curatela quando houver mais de um curador apto ou necessário.$a$
where codigo='cc' and numero=1775 and titulo='Art. 1775-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Tomada de decisão apoiada$c$,
  aplicacao_pratica = $a$Define o apoio em que a pessoa com deficiência elege ao menos duas pessoas idôneas, de sua confiança, para auxiliá-la em atos da vida civil, fornecendo-lhes os elementos necessários para que exerça sua capacidade. O pedido é feito pela própria pessoa apoiada, com termo que fixe os limites do apoio, os compromissos dos apoiadores e o prazo de vigência (§§ 1º e 2º), após oitiva do Ministério Público e com assistência de equipe multidisciplinar (§ 3º). A decisão tomada dentro dos limites do apoio vale perante terceiros (§ 4º), que podem exigir a contra-assinatura dos apoiadores (§ 5º). Em negócio de risco ou prejuízo relevante, havendo divergência entre apoiado e apoiador, decide o juiz, ouvido o Ministério Público (§ 6º). O apoiador negligente, que pressione indevidamente ou descumpra o assumido pode ser denunciado ao Ministério Público ou ao juiz e destituído (§§ 7º e 8º). A pessoa apoiada pode encerrar o acordo a qualquer tempo (§ 9º), o apoiador pode pedir sua exclusão, condicionada à manifestação do juiz (§ 10), e aplicam-se, no que couber, as regras de prestação de contas da curatela (§ 11).$a$
where codigo='cc' and numero=1783 and titulo='Art. 1783-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Indignidade: exclusão após condenação penal$c$,
  aplicacao_pratica = $a$Em qualquer dos casos de indignidade do art. 1.814, o trânsito em julgado da sentença penal condenatória acarreta a exclusão imediata do herdeiro ou legatário indigno, independentemente da sentença prevista no caput do art. 1.815.$a$
where codigo='cc' and numero=1815 and titulo='Art. 1815-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- ===== CDC =====
update legislacao set
  contexto = $c$Identificação do fornecedor na cobrança$c$,
  aplicacao_pratica = $a$Todo documento de cobrança de débito apresentado ao consumidor deve trazer nome, endereço e CPF ou CNPJ do fornecedor do produto ou serviço. Serve para conferir a regularidade de boletos e notificações de cobrança e, na peça, para demonstrar a omissão desses dados. Ver também o art. 42 (vedação a constrangimento na cobrança).$a$
where codigo='cdc' and numero=42 and titulo='Art. 42-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Superendividamento: repactuação de dívidas$c$,
  aplicacao_pratica = $a$A requerimento do consumidor superendividado pessoa natural, o juiz pode instaurar processo de repactuação, com audiência conciliatória com todos os credores das dívidas do art. 54-A e proposta de plano de pagamento em até 5 anos, preservados o mínimo existencial e as garantias e formas de pagamento originalmente pactuadas. Excluem-se as dívidas de contratos celebrados dolosamente sem propósito de pagar, de crédito com garantia real, de financiamento imobiliário e de crédito rural (§ 1º). O credor que falta sem justificativa tem a exigibilidade suspensa e a mora interrompida, e se sujeita ao plano se o valor for certo e conhecido pelo consumidor, com pagamento só após os credores presentes (§ 2º). A sentença que homologa o acordo descreve o plano e tem eficácia de título executivo e força de coisa julgada (§ 3º); o plano deve conter os elementos do § 4º. O pedido não importa declaração de insolvência civil e só pode ser repetido dois anos após a liquidação das obrigações do plano homologado (§ 5º).$a$
where codigo='cdc' and numero=104 and titulo='Art. 104-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Superendividamento: plano judicial compulsório$c$,
  aplicacao_pratica = $a$Sem êxito na conciliação com quaisquer credores, o juiz, a pedido do consumidor, instaura processo por superendividamento para revisão e integração dos contratos e repactuação das dívidas remanescentes por plano judicial compulsório, citando os credores que não integraram o acordo. Os credores citados juntam documentos e as razões da recusa em 15 dias (§ 2º). O juiz pode nomear administrador, sem ônus às partes, que apresenta o plano em até 30 dias (§ 3º). O plano assegura ao menos o principal corrigido por índices oficiais e a liquidação total em até 5 anos, após a quitação do plano consensual do art. 104-A, com primeira parcela em até 180 dias da homologação (§ 4º).$a$
where codigo='cdc' and numero=104 and titulo='Art. 104-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Superendividamento: conciliação administrativa$c$,
  aplicacao_pratica = $a$Atribui, de forma concorrente e facultativa, aos órgãos do Sistema Nacional de Defesa do Consumidor a fase conciliatória e preventiva da repactuação, nos moldes do art. 104-A, com possibilidade de convênios entre os órgãos e as instituições credoras ou suas associações. Os órgãos podem promover audiência global de conciliação com todos os credores e facilitar o plano de pagamento, preservado o mínimo existencial (§ 1º). O acordo inclui a data de exclusão do consumidor de bancos de dados e cadastros de inadimplentes e condiciona seus efeitos à abstenção de condutas que agravem o superendividamento, especialmente novas dívidas (§ 2º).$a$
where codigo='cdc' and numero=104 and titulo='Art. 104-C' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 1º)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: acrescentou o inciso IV ao art. 1º da Lei 7.347/1985 (qualquer outro interesse difuso ou coletivo). Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=110 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 5º, II)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao inciso II do art. 5º da Lei 7.347/1985, para que inclua, entre as finalidades institucionais, a proteção ao meio ambiente, ao consumidor, ao patrimônio artístico, estético, histórico, turístico e paisagístico, ou a qualquer outro interesse difuso ou coletivo. Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=111 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 5º, § 3º)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao § 3º do art. 5º da Lei 7.347/1985, que prevê a assunção da titularidade ativa pelo Ministério Público ou por outro legitimado em caso de desistência infundada ou abandono da ação por associação legitimada. Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=112 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 5º, §§ 4º a 6º)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: acrescentou os §§ 4º, 5º e 6º ao art. 5º da Lei 7.347/1985, que tratam da dispensa pelo juiz do requisito da pré-constituição quando houver manifesto interesse social (§ 4º), do litisconsórcio facultativo entre os Ministérios Públicos da União, do Distrito Federal e dos Estados (§ 5º) e do compromisso de ajustamento de conduta tomado pelos órgãos públicos legitimados, com eficácia de título executivo extrajudicial (§ 6º). Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=113 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 15)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao art. 15 da Lei 7.347/1985, que prevê a execução pelo Ministério Público, com igual iniciativa facultada aos demais legitimados, decorridos sessenta dias do trânsito em julgado da sentença condenatória sem que a associação autora a promova. Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=114 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 17)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: suprimiu o caput do art. 17 da Lei 7.347/1985 e deu ao antigo parágrafo único a redação que prevê, em caso de litigância de má-fé, a condenação solidária da associação autora e dos diretores responsáveis em honorários advocatícios e ao décuplo das custas, sem prejuízo de perdas e danos. Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=115 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 18)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao art. 18 da Lei 7.347/1985, que afasta o adiantamento de custas, emolumentos, honorários periciais e outras despesas e a condenação da associação autora em honorários, custas e despesas, salvo comprovada má-fé. Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=116 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei da Ação Civil Pública (art. 21)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: acrescentou o art. 21 à Lei 7.347/1985, que manda aplicar, no que for cabível, os dispositivos do Título III do Código de Defesa do Consumidor à defesa dos direitos e interesses difusos, coletivos e individuais. Sem aplicação autônoma; consultar o texto vigente na própria Lei 7.347/1985.$a$
where codigo='cdc' and numero=117 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Vigência do Código$c$,
  aplicacao_pratica = $a$Fixou a entrada em vigor do Código em cento e oitenta dias contados de sua publicação. Norma de vigência já exaurida, sem aplicação prática atual.$a$
where codigo='cdc' and numero=118 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Cláusula revogatória$c$,
  aplicacao_pratica = $a$Revogou as disposições em contrário, em cláusula genérica, sem indicar as normas revogadas. Sem aplicação prática autônoma.$a$
where codigo='cdc' and numero=119 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- ===== CPC =====
update legislacao set
  contexto = $c$Alteração da Lei 9.289/1996 (art. 14, II)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao inciso II do art. 14 da Lei 9.289/1996. Sem aplicação autônoma; consultar o texto vigente na própria Lei 9.289/1996.$a$
where codigo='cpc' and numero=1060 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei de Arbitragem (art. 33, § 3º)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao § 3º do art. 33 da Lei 9.307/1996 (Lei de Arbitragem). Sem aplicação autônoma; consultar o texto vigente na própria Lei 9.307/1996.$a$
where codigo='cpc' and numero=1061 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei 9.099/1995 (art. 48)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao caput do art. 48 da Lei 9.099/1995, que prevê embargos de declaração contra sentença ou acórdão nos casos do Código de Processo Civil. Relevante nos Juizados Especiais; ver Lei 9.099, art. 48.$a$
where codigo='cpc' and numero=1064 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei 9.099/1995 (art. 50)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao art. 50 da Lei 9.099/1995, segundo o qual os embargos de declaração interrompem o prazo para a interposição de recurso. Relevante nos Juizados Especiais; ver Lei 9.099, art. 50.$a$
where codigo='cpc' and numero=1065 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei 9.099/1995 (art. 83)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao art. 83 da Lei 9.099/1995, que prevê embargos de declaração quando, em sentença ou acórdão, houver obscuridade, contradição ou omissão. Ver Lei 9.099, art. 83.$a$
where codigo='cpc' and numero=1066 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração do Código Eleitoral (art. 275)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao art. 275 da Lei 4.737/1965 (Código Eleitoral). Sem aplicação autônoma; consultar o texto vigente no próprio Código Eleitoral.$a$
where codigo='cpc' and numero=1067 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração do Código Civil (arts. 274 e 2.027)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: deu nova redação ao art. 274 do Código Civil (o julgamento contrário a um dos credores solidários não atinge os demais, mas o favorável lhes aproveita, ressalvada a exceção pessoal do devedor) e ao caput do art. 2.027 (a partilha é anulável pelos vícios e defeitos que invalidam, em geral, os negócios jurídicos). O texto vigente está nesses artigos do Código Civil.$a$
where codigo='cpc' and numero=1068 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Alteração da Lei de Registros Públicos (art. 216-A)$c$,
  aplicacao_pratica = $a$Dispositivo de alteração: acrescentou o art. 216-A ao Capítulo III do Título V da Lei 6.015/1973 (Lei de Registros Públicos). Sem aplicação autônoma; consultar o texto do art. 216-A na própria Lei 6.015/1973.$a$
where codigo='cpc' and numero=1071 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- ===== Lei 9.099/1995, art. 95 =====
update legislacao set
  aplicacao_pratica = $a$Norma exaurida: fixou o prazo de seis meses, a contar da vigência da Lei, para Estados, Distrito Federal e Territórios criarem e instalarem os Juizados Especiais. Interesse apenas histórico.$a$
where codigo='lei9099' and numero=95 and inciso is null and paragrafo is null and (aplicacao_pratica is null or aplicacao_pratica='');

commit;
