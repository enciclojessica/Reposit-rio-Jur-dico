-- Comentários (contexto e aplicacao_pratica) dos artigos do CP sem comentário, lote 3 (arts. 263 a 311-A).
-- Só a partir do texto do artigo, lido no banco em 09/10/2026. Remissões (arts. 258, 260 a 262, 267, 273 a 276) conferidas por SELECT.
-- Sem jurisprudência ou doutrina. Idempotente: só preenche quando contexto está vazio. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Perigo comum em transporte: resultado de lesão ou morte$c$,
  aplicacao_pratica = $a$Não cria tipo novo: manda aplicar o art. 258 quando, de qualquer dos crimes dos arts. 260 a 262 (estrada de ferro, outro meio de transporte público), no caso de desastre ou sinistro, resulta lesão corporal ou morte. O art. 258 aumenta a pena de metade se do crime doloso resulta lesão grave e a aplica em dobro se resulta morte; no caso de culpa, aumenta de metade se resulta lesão e aplica a pena do homicídio culposo aumentada de um terço se resulta morte. Na peça, serve para indicar a majorante pelo resultado.$a$
where codigo='cp' and numero=263 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Arremesso de projétil contra veículo de transporte público$c$,
  aplicacao_pratica = $a$Pune arremessar projétil contra veículo, em movimento, destinado ao transporte público por terra, por água ou pelo ar, com detenção de 1 a 6 meses. O parágrafo único prevê detenção de 6 meses a 2 anos se resulta lesão corporal e, se resulta morte, a pena do art. 121, § 3º, aumentada de um terço. O tipo exige que o veículo esteja em movimento.$a$
where codigo='cp' and numero=264 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Interrupção de serviço telefônico, telemático ou de informação$c$,
  aplicacao_pratica = $a$Pune interromper ou perturbar serviço telegráfico, radiotelegráfico ou telefônico, ou impedir ou dificultar-lhe o restabelecimento, com reclusão de 2 a 4 anos e multa (redação da Lei nº 15.397/2026). O § 1º estende a mesma pena a quem interrompe serviço telemático ou de informação de utilidade pública, ou impede ou dificulta seu restabelecimento. O § 2º aplica as penas em dobro se o crime é cometido por ocasião de calamidade pública ou mediante subtração, dano ou destruição de equipamento instalado em estrutura usada para telecomunicações.$a$
where codigo='cp' and numero=266 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Corrupção ou poluição de água potável$c$,
  aplicacao_pratica = $a$Pune corromper ou poluir água potável, de uso comum ou particular, tornando-a imprópria para consumo ou nociva à saúde, com reclusão de 2 a 5 anos. O parágrafo único prevê a forma culposa, com detenção de 2 meses a 1 ano. O resultado exigido é a água imprópria para consumo ou nociva à saúde, que precisa ser demonstrado.$a$
where codigo='cp' and numero=271 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 2
update legislacao set
  contexto = $c$Emprego de substância não permitida em produto de consumo$c$,
  aplicacao_pratica = $a$Pune empregar, no fabrico de produto destinado a consumo, revestimento, gaseificação artificial, matéria corante, substância aromática, antisséptica, conservadora ou qualquer outra não expressamente permitida pela legislação sanitária, com reclusão de 1 a 5 anos e multa. A permissão é verificada na legislação sanitária, de modo que a defesa pode discutir se a substância era expressamente permitida.$a$
where codigo='cp' and numero=274 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Rotulagem falsa quanto ao conteúdo de alimentos e medicamentos$c$,
  aplicacao_pratica = $a$Pune inculcar, em invólucro ou recipiente de produtos alimentícios, terapêuticos ou medicinais, a existência de substância que não se encontra em seu conteúdo ou que nele existe em quantidade menor que a mencionada, com reclusão de 1 a 5 anos e multa. A conduta é a informação falsa ou imprecisa na embalagem sobre o conteúdo. A venda ou entrega a consumo do produto nessas condições é conduta do art. 276.$a$
where codigo='cp' and numero=275 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Substância destinada a falsificar alimentos ou medicamentos$c$,
  aplicacao_pratica = $a$Pune vender, expor à venda, ter em depósito ou ceder substância destinada à falsificação de produtos alimentícios, terapêuticos ou medicinais, com reclusão de 1 a 5 anos e multa. O objeto é a substância destinada à falsificação, e não o produto já falsificado, que é tratado no art. 273.$a$
where codigo='cp' and numero=277 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Coisa ou substância nociva à saúde$c$,
  aplicacao_pratica = $a$Pune fabricar, vender, expor à venda, ter em depósito para vender ou, de qualquer forma, entregar a consumo coisa ou substância nociva à saúde, ainda que não destinada à alimentação ou a fim medicinal, com detenção de 1 a 3 anos e multa. O parágrafo único prevê a forma culposa, com detenção de 2 meses a 1 ano. O tipo alcança produtos fora do campo alimentar ou medicinal, o que o distingue dos arts. 273 a 277.$a$
where codigo='cp' and numero=278 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 3
update legislacao set
  contexto = $c$Anúncio de cura por meio secreto ou infalível$c$,
  aplicacao_pratica = $a$Pune inculcar ou anunciar cura por meio secreto ou infalível, com detenção de 3 meses a 1 ano e multa. A conduta é a promessa de cura com tais características, e basta o anúncio.$a$
where codigo='cp' and numero=283 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Crimes contra a saúde pública: aumento pelo resultado$c$,
  aplicacao_pratica = $a$Manda aplicar o art. 258 aos crimes do Capítulo dos crimes contra a saúde pública, salvo quanto ao definido no art. 267 (epidemia). O art. 258 aumenta a pena de metade se do crime doloso resulta lesão grave e a aplica em dobro se resulta morte; na culpa, aumenta de metade se resulta lesão e aplica a pena do homicídio culposo aumentada de um terço se resulta morte. A ressalva do art. 267 impede a aplicação do aumento ao crime de epidemia.$a$
where codigo='cp' and numero=285 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Milícia privada e organização paramilitar$c$,
  aplicacao_pratica = $a$Pune constituir, organizar, integrar, manter ou custear organização paramilitar, milícia particular, grupo ou esquadrão com a finalidade de praticar qualquer dos crimes previstos no Código Penal, com reclusão de 4 a 8 anos. A finalidade de praticar crimes do Código é elemento do tipo e deve ser demonstrada.$a$
where codigo='cp' and numero=288 and titulo='Art. 288-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Emissão irregular de título ao portador$c$,
  aplicacao_pratica = $a$Pune emitir, sem permissão legal, nota, bilhete, ficha, vale ou título que contenha promessa de pagamento em dinheiro ao portador ou a que falte indicação do nome da pessoa a quem deva ser pago, com detenção de 1 a 6 meses ou multa. O parágrafo único aplica detenção de 15 dias a 3 meses, ou multa, a quem recebe ou utiliza como dinheiro qualquer desses documentos. A ausência de permissão legal é elemento do tipo.$a$
where codigo='cp' and numero=292 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

-- BLOCO 4
update legislacao set
  contexto = $c$Petrechos de falsificação de papéis públicos$c$,
  aplicacao_pratica = $a$Pune fabricar, adquirir, fornecer, possuir ou guardar objeto especialmente destinado à falsificação de qualquer dos papéis referidos no artigo anterior, com reclusão de 1 a 3 anos e multa. É crime de natureza preparatória, que dispensa a falsificação em si. O objeto precisa ser especialmente destinado à falsificação.$a$
where codigo='cp' and numero=294 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Falsificação de selo ou peça filatélica$c$,
  aplicacao_pratica = $a$Pune reproduzir ou alterar selo ou peça filatélica que tenha valor para coleção, salvo quando a reprodução ou a alteração está visivelmente anotada na face ou no verso, com detenção de 1 a 3 anos e multa. O parágrafo único aplica a mesma pena a quem, para fins de comércio, faz uso do selo ou peça. A anotação visível da reprodução ou alteração afasta o crime.$a$
where codigo='cp' and numero=303 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Falsificação de marca ou sinal de fiscalização pública$c$,
  aplicacao_pratica = $a$Pune falsificar, fabricando-o ou alterando-o, marca ou sinal empregado pelo poder público no contraste de metal precioso ou na fiscalização alfandegária, ou usar marca ou sinal dessa natureza falsificado por outrem, com reclusão de 2 a 6 anos e multa. O parágrafo único trata da marca ou sinal usado para fiscalização sanitária, para autenticar ou encerrar objetos, ou para comprovar o cumprimento de formalidade legal, com reclusão ou detenção de 1 a 3 anos e multa. O uso do sinal falsificado por outrem é conduta autônoma do caput.$a$
where codigo='cp' and numero=306 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and (contexto is null or contexto='');

update legislacao set
  contexto = $c$Violação de sigilo em concurso, exame ou seleção$c$,
  aplicacao_pratica = $a$Pune utilizar ou divulgar, indevidamente, com o fim de beneficiar a si ou a outrem ou de comprometer a credibilidade do certame, conteúdo sigiloso de concurso público, avaliação ou exame públicos, processo seletivo para ingresso no ensino superior, ou exame ou processo seletivo previstos em lei, com reclusão de 1 a 4 anos e multa. O § 1º estende a pena a quem permite ou facilita o acesso de pessoas não autorizadas às informações; o § 2º prevê reclusão de 2 a 6 anos e multa se resulta dano à administração pública; o § 3º aumenta a pena de 1/3 se o fato é cometido por funcionário público. O fim de beneficiar ou de comprometer a credibilidade do certame é elemento do tipo.$a$
where codigo='cp' and numero=311 and titulo='Art. 311-A' and inciso is null and paragrafo is null and (contexto is null or contexto='');
