-- Comentários (contexto e aplicacao_pratica) dos artigos do CP sem comentário, lote 2 (arts. 186 a 262).
-- Só a partir do texto do artigo, lido no banco em 09/10/2026. Sem jurisprudência ou doutrina.
-- Idempotente: só preenche quando contexto está vazio. Sem begin/commit, para rodar em blocos pequenos.

-- BLOCO 1
update legislacao set
  contexto = $c$Ação penal nos crimes contra a propriedade intelectual$c$,
  aplicacao_pratica = $a$Define como se procede nos crimes do art. 184: por queixa, nos crimes do caput (inciso I); por ação penal pública incondicionada, nos crimes dos §§ 1º e 2º (inciso II) e nos crimes cometidos em desfavor de entidades de direito público, autarquia, empresa pública, sociedade de economia mista ou fundação instituída pelo Poder Público (inciso III); e por ação penal pública condicionada à representação, nos crimes do § 3º (inciso IV). Na peça, a espécie de ação penal depende do parágrafo do art. 184 imputado, o que define quem tem legitimidade e se há prazo decadencial.$a$
where codigo='cp' and numero=186 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Paralisação coletiva de trabalho em obra ou serviço público$c$,
  aplicacao_pratica = $a$Pune participar de suspensão ou abandono coletivo de trabalho que provoque a interrupção de obra pública ou de serviço de interesse coletivo, com detenção de 6 meses a 2 anos e multa. O tipo exige o resultado de interrupção da obra ou do serviço, de modo que a paralisação sem esse efeito não se enquadra. Na defesa, a prova de que não houve interrupção ou de que o agente não participou da paralisação é o ponto central.$a$
where codigo='cp' and numero=201 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Frustração de obrigação legal sobre nacionalização do trabalho$c$,
  aplicacao_pratica = $a$Pune frustrar, mediante fraude ou violência, obrigação legal relativa à nacionalização do trabalho, com detenção de 1 mês a 1 ano e multa, além da pena correspondente à violência. O meio (fraude ou violência) é elemento do tipo, e a violência é punida em cumulação.$a$
where codigo='cp' and numero=204 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Importunação sexual$c$,
  aplicacao_pratica = $a$Tipifica praticar contra alguém, sem sua anuência, ato libidinoso com o objetivo de satisfazer a própria lascívia ou a de terceiro, com reclusão de 1 a 5 anos, se o ato não constitui crime mais grave. A cláusula final torna o tipo subsidiário: havendo crime mais grave, ele prevalece. Os elementos a provar são o ato libidinoso, a ausência de anuência da vítima e o fim de satisfazer a lascívia.$a$
where codigo='cp' and numero=215 and titulo='Art. 215-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 2
update legislacao set
  contexto = $c$Assédio sexual$c$,
  aplicacao_pratica = $a$Tipifica constranger alguém com o intuito de obter vantagem ou favorecimento sexual, prevalecendo-se o agente da condição de superior hierárquico ou da ascendência inerentes ao exercício de emprego, cargo ou função, com detenção de 1 a 2 anos. O tipo exige a relação de hierarquia ou ascendência. O § 2º aumenta a pena em até um terço se a vítima é menor de 18 anos.$a$
where codigo='cp' and numero=216 and titulo='Art. 216-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Registro não autorizado da intimidade sexual$c$,
  aplicacao_pratica = $a$Pune produzir, fotografar, filmar ou registrar, por qualquer meio, conteúdo com cena de nudez, ato sexual ou libidinoso de caráter íntimo e privado sem autorização dos participantes, com detenção de 6 meses a 1 ano e multa. O parágrafo único aplica a mesma pena a quem realiza montagem em fotografia, vídeo, áudio ou outro registro para incluir pessoa em cena de nudez ou ato sexual ou libidinoso de caráter íntimo. O tipo alcança a produção do registro; a divulgação tem tipo próprio no art. 218-C.$a$
where codigo='cp' and numero=216 and titulo='Art. 216-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Estupro de vulnerável$c$,
  aplicacao_pratica = $a$Tipifica ter conjunção carnal ou praticar outro ato libidinoso com menor de 14 anos, com reclusão de 10 a 18 anos e multa. O § 1º estende a mesma pena à prática com quem, por enfermidade ou deficiência mental, não tem o necessário discernimento, ou que não pode oferecer resistência por qualquer causa. O § 3º (lesão corporal grave) prevê reclusão de 12 a 24 anos e multa, e o § 4º (morte) de 20 a 40 anos e multa. O § 4º-A declara absoluta a presunção de vulnerabilidade, inadmitida sua relativização, e o § 5º aplica as penas independentemente do consentimento da vítima, de sua experiência sexual anterior ou de gravidez resultante. O elemento etário ou a condição de vulnerabilidade são os pontos a demonstrar, e as redações dos §§ 4º-A e 5º são da Lei nº 15.353/2026.$a$
where codigo='cp' and numero=217 and titulo='Art. 217-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Satisfação de lascívia na presença de menor de 14 anos$c$,
  aplicacao_pratica = $a$Pune praticar, na presença de alguém menor de 14 anos, ou induzi-lo a presenciar, conjunção carnal ou outro ato libidinoso, a fim de satisfazer lascívia própria ou de outrem, com reclusão de 5 a 12 anos e multa. A conduta é diferente da do art. 217-A, porque a vítima é espectadora, e não parte do ato. O fim de satisfazer lascívia é elemento do tipo.$a$
where codigo='cp' and numero=218 and titulo='Art. 218-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 3
update legislacao set
  contexto = $c$Favorecimento da prostituição ou exploração sexual de vulnerável$c$,
  aplicacao_pratica = $a$Pune submeter, induzir ou atrair à prostituição ou outra forma de exploração sexual alguém menor de 18 anos, ou que por enfermidade ou deficiência mental não tem discernimento, facilitá-la, ou impedir ou dificultar que a vítima a abandone. O § 2º equipara quem pratica conjunção carnal ou ato libidinoso com menor de 18 e maior de 14 anos na situação do caput (inciso I) e o proprietário, gerente ou responsável pelo local onde ocorrem as práticas (inciso II). O § 3º determina, como efeito obrigatório da condenação do inciso II do § 2º, a cassação da licença de localização e de funcionamento do estabelecimento.$a$
where codigo='cp' and numero=218 and titulo='Art. 218-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Divulgação de cena de estupro, nudez ou sexo$c$,
  aplicacao_pratica = $a$Pune oferecer, trocar, disponibilizar, transmitir, vender, expor à venda, distribuir, publicar ou divulgar, por qualquer meio, inclusive de comunicação de massa ou sistema de informática ou telemática, fotografia, vídeo ou outro registro audiovisual que contenha cena de estupro ou de estupro de vulnerável, ou que faça apologia ou induza a sua prática, ou, sem o consentimento da vítima, cena de sexo, nudez ou pornografia, com reclusão de 4 a 10 anos e multa, se o fato não constitui crime mais grave. O § 1º aumenta a pena de 1/3 a 2/3 se o agente mantém ou manteve relação íntima de afeto com a vítima, ou age com fim de vingança ou humilhação. O § 2º exclui o crime em publicação jornalística, científica, cultural ou acadêmica que use recurso que impossibilite a identificação da vítima, ressalvada a autorização prévia se ela é maior de 18 anos.$a$
where codigo='cp' and numero=218 and titulo='Art. 218-C' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Promoção de migração ilegal$c$,
  aplicacao_pratica = $a$Pune promover, por qualquer meio, com o fim de obter vantagem econômica, a entrada ilegal de estrangeiro em território nacional ou de brasileiro em país estrangeiro, com reclusão de 2 a 5 anos e multa. O § 1º estende a mesma pena à promoção da saída de estrangeiro do território nacional para ingressar ilegalmente em outro país. O § 2º aumenta a pena de 1/6 a 1/3 se há violência ou condição desumana ou degradante, e o § 3º aplica a pena sem prejuízo das correspondentes a infrações conexas. O fim de vantagem econômica é elemento do tipo.$a$
where codigo='cp' and numero=232 and titulo='Art. 232-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Crimes sexuais: causas de aumento de pena$c$,
  aplicacao_pratica = $a$Prevê aumentos de pena aplicáveis aos crimes do Título dos crimes contra a dignidade sexual. Entre eles: de metade a 2/3 se do crime resulta gravidez (inciso III); de 1/3 a 2/3 se o agente transmite à vítima doença sexualmente transmissível de que sabe ou deveria saber ser portador, ou se a vítima é idosa ou pessoa com deficiência (inciso IV). São causas de aumento da terceira fase da dosimetria, que exigem prova do resultado ou da condição indicada.$a$
where codigo='cp' and numero=234 and titulo='Art. 234-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Crimes sexuais: segredo de justiça e publicidade da condenação$c$,
  aplicacao_pratica = $a$Determina que os processos de crimes do Título correm em segredo de justiça. O § 1º torna de acesso público, no sistema de consulta processual, o nome completo do réu, o CPF e a tipificação penal a partir da condenação em primeira instância pelos crimes dos arts. 213, 216-B, 217-A, 218-B, 227, 228, 229 e 230. O § 2º restabelece o sigilo se o réu é absolvido em grau recursal, e o § 3º determina o monitoramento eletrônico do réu condenado. Na peça, a regra define o sigilo do processo e o momento em que passa a haver publicidade sobre o réu.$a$
where codigo='cp' and numero=234 and titulo='Art. 234-B' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 4
update legislacao set
  contexto = $c$Supressão de estado de filiação em instituição de assistência$c$,
  aplicacao_pratica = $a$Pune deixar em asilo de expostos ou outra instituição de assistência filho próprio ou alheio, ocultando-lhe a filiação ou atribuindo-lhe outra, com o fim de prejudicar direito inerente ao estado civil, com reclusão de 1 a 5 anos e multa. O fim de prejudicar direito inerente ao estado civil é elemento do tipo.$a$
where codigo='cp' and numero=243 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Explosão$c$,
  aplicacao_pratica = $a$Pune expor a perigo a vida, a integridade física ou o patrimônio de outrem, mediante explosão, arremesso ou simples colocação de engenho de dinamite ou de substância de efeitos análogos, com reclusão de 3 a 6 anos e multa. O § 1º trata da substância que não é dinamite nem de efeitos análogos, com reclusão de 1 a 4 anos e multa. O § 2º aumenta as penas de um terço nas hipóteses do § 1º, I, do art. 250 ou se visada ou atingida alguma das coisas enumeradas no inciso II do mesmo parágrafo. O § 3º traz a forma culposa, com detenção de 6 meses a 2 anos (dinamite ou substância análoga) ou de 3 meses a 1 ano (demais casos). O tipo é de perigo, e a prova do perigo concreto é central.$a$
where codigo='cp' and numero=251 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Uso de gás tóxico ou asfixiante$c$,
  aplicacao_pratica = $a$Pune expor a perigo a vida, a integridade física ou o patrimônio de outrem, usando gás tóxico ou asfixiante, com reclusão de 1 a 4 anos e multa. O parágrafo único prevê a forma culposa, com detenção de 3 meses a 1 ano. Difere do art. 253, que pune condutas preparatórias (fabricar, fornecer, adquirir, possuir ou transportar), e não o uso que expõe a perigo.$a$
where codigo='cp' and numero=252 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Fabrico, posse e transporte de explosivos e gases tóxicos$c$,
  aplicacao_pratica = $a$Pune fabricar, fornecer, adquirir, possuir ou transportar, sem licença da autoridade, substância ou engenho explosivo, gás tóxico ou asfixiante, ou material destinado à sua fabricação, com detenção de 6 meses a 2 anos e multa. A ausência de licença da autoridade é elemento do tipo, e a defesa pode se apoiar na existência da licença.$a$
where codigo='cp' and numero=253 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Obstáculo contra inundação$c$,
  aplicacao_pratica = $a$Pune remover, destruir ou inutilizar, em prédio próprio ou alheio, obstáculo natural ou obra destinada a impedir inundação, expondo a perigo a vida, a integridade física ou o patrimônio de outrem, com reclusão de 1 a 3 anos e multa. O perigo a bens ou pessoas é elemento do tipo, e vale para prédio próprio ou alheio.$a$
where codigo='cp' and numero=255 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 5
update legislacao set
  contexto = $c$Subtração de material de salvamento em desastre$c$,
  aplicacao_pratica = $a$Pune subtrair, ocultar ou inutilizar, por ocasião de incêndio, inundação, naufrágio ou outro desastre ou calamidade, aparelho, material ou qualquer meio destinado a serviço de combate ao perigo, de socorro ou salvamento, ou impedir ou dificultar serviço dessa natureza, com reclusão de 2 a 5 anos e multa. O tipo depende do contexto de desastre ou calamidade no momento do fato.$a$
where codigo='cp' and numero=257 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Difusão de doença ou praga$c$,
  aplicacao_pratica = $a$Pune difundir doença ou praga que possa causar dano a floresta, plantação ou animais de utilidade econômica, com reclusão de 2 a 5 anos e multa. O parágrafo único prevê a forma culposa, com detenção de 1 a 6 meses ou multa. O tipo exige a potencialidade de dano a recursos de utilidade econômica.$a$
where codigo='cp' and numero=259 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Perturbação de serviço de estrada de ferro$c$,
  aplicacao_pratica = $a$Pune impedir ou perturbar serviço de estrada de ferro por quatro meios: destruir, danificar ou desarranjar linha férrea, material rodante ou de tração, obra de arte ou instalação (inciso I); colocar obstáculo na linha (inciso II); transmitir falso aviso sobre o movimento dos veículos ou interromper ou embaraçar telégrafo, telefone ou radiotelegrafia (inciso III); ou praticar outro ato de que possa resultar desastre (inciso IV), com reclusão de 2 a 5 anos e multa. O § 1º, se resulta desastre, prevê reclusão de 4 a 12 anos e multa; o § 2º, no caso de culpa com desastre, detenção de 6 meses a 2 anos; o § 3º define estrada de ferro como qualquer via de comunicação em que circulem veículos de tração mecânica, em trilhos ou por cabo aéreo. A adequação a um dos incisos define a capitulação.$a$
where codigo='cp' and numero=260 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Perigo a outro meio de transporte público$c$,
  aplicacao_pratica = $a$Pune expor a perigo outro meio de transporte público, ou impedir-lhe ou dificultar-lhe o funcionamento, com detenção de 1 a 2 anos. O § 1º, se resulta desastre, prevê reclusão de 2 a 5 anos; o § 2º, no caso de culpa com desastre, detenção de 3 meses a 1 ano. O "outro meio" é o meio de transporte público diverso da estrada de ferro, tratada no art. 260.$a$
where codigo='cp' and numero=262 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');
