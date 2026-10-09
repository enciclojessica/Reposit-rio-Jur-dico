-- Reescrita de comentarios curtos do CPP, lote 2 (guardado por length(aplicacao_pratica)<200)
-- Reescrita de comentários curtos de CPP no padrão aprovado em 09/10/2026: só onde há função ou distinção verificada no texto do banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Foro de eleição na ação exclusivamente privada$c$,
  aplicacao_pratica = $a$Nos casos de exclusiva ação privada, permite ao querelante preferir o foro do domicílio ou da residência do réu, ainda quando conhecido o lugar da infração. Contrasta com o art. 72, em que o domicílio ou a residência do réu só fixa a competência quando o lugar da infração é desconhecido.$a$
where codigo='cpp' and numero=73 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Precedência da suspeição$c$,
  aplicacao_pratica = $a$Determina que a arguição de suspeição preceda a qualquer outra, salvo quando fundada em motivo superveniente. Na prática, a suspeição vem antes das demais exceções do art. 95, a menos que o motivo seja superveniente. As formas de afirmá-la ou de recusar o juiz estão nos arts. 97 e 98.$a$
where codigo='cpp' and numero=96 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Suspeição afirmada pelo próprio juiz$c$,
  aplicacao_pratica = $a$Obriga o juiz que afirma espontaneamente a suspeição a fazê-lo por escrito, declarando o motivo legal, remetendo imediatamente o processo ao substituto e intimando as partes. Difere do art. 98, em que a parte recusa o juiz por petição, e do art. 99, em que o juiz reconhece a suspeição arguida pela parte.$a$
where codigo='cpp' and numero=97 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Recusa do juiz pela parte: petição$c$,
  aplicacao_pratica = $a$Exige que a parte que pretende recusar o juiz o faça em petição assinada por ela própria ou por procurador com poderes especiais, apresentando as razões acompanhadas de prova documental ou do rol de testemunhas. Se o juiz reconhece a suspeição arguida, aplica-se o art. 99. Os poderes especiais do procurador são requisito da petição.$a$
where codigo='cpp' and numero=98 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Suspeição arguida e reconhecida pelo juiz$c$,
  aplicacao_pratica = $a$Se o juiz reconhece a suspeição, sustará a marcha do processo, mandará juntar aos autos a petição do recusante com os documentos que a instruam e, por despacho, se declarará suspeito, remetendo os autos ao substituto. Aplica-se à recusa feita pela parte nos termos do art. 98; quando o juiz declara a suspeição por iniciativa própria, vale o art. 97.$a$
where codigo='cpp' and numero=99 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Restituição das coisas apreendidas antes do trânsito em julgado$c$,
  aplicacao_pratica = $a$Veda a restituição das coisas apreendidas, antes do trânsito em julgado da sentença final, enquanto interessarem ao processo. O art. 119 trata do que não pode ser restituído mesmo depois do trânsito em julgado: as coisas a que se referem os arts. 74 e 100 do Código Penal, salvo se pertencerem ao lesado ou a terceiro de boa-fé.$a$
where codigo='cpp' and numero=118 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Destino dos instrumentos do crime e das coisas confiscadas$c$,
  aplicacao_pratica = $a$Determina que os instrumentos do crime cuja perda em favor da União for decretada e as coisas confiscadas, nos termos do art. 100 do Código Penal, sejam inutilizados ou recolhidos a museu criminal, se houver interesse na sua conservação. Distingue-se do art. 122, que manda alienar as coisas apreendidas nos termos do art. 133, e do art. 124-A, que permite destinar a museus públicos bens de relevante valor cultural ou artístico, se o crime não tiver vítima determinada.$a$
where codigo='cpp' and numero=124 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Sequestro de imóveis adquiridos com proventos da infração$c$,
  aplicacao_pratica = $a$Admite o sequestro dos bens imóveis adquiridos pelo indiciado com os proventos da infração, ainda que já transferidos a terceiro. Os bens móveis têm regra própria no art. 132. O requisito é a existência de indícios veementes da proveniência ilícita (art. 126), e o art. 127 diz quem pode requerer ou ordenar a medida.$a$
where codigo='cpp' and numero=125 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Sequestro: requisito dos indícios$c$,
  aplicacao_pratica = $a$Exige, para decretar o sequestro, apenas a existência de indícios veementes da proveniência ilícita dos bens. A regra vale para o sequestro de imóveis (art. 125) e de móveis (art. 132). O juiz pode ordená-lo de ofício ou a requerimento, em qualquer fase do processo ou antes da denúncia ou queixa (art. 127).$a$
where codigo='cpp' and numero=126 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Sequestro: autuação em apartado e embargos$c$,
  aplicacao_pratica = $a$Determina que o sequestro de imóveis (art. 125, que alcança bens já transferidos a terceiro) corra em autos apartados e admita embargos de terceiro. Quem tem o bem atingido pela medida pode embargar por aqui. O art. 130 trata de outra hipótese de embargo ao sequestro, e seu parágrafo único impede decisão nesses embargos antes do trânsito em julgado da sentença condenatória.$a$
where codigo='cpp' and numero=129 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Sequestro de bens móveis: caráter subsidiário$c$,
  aplicacao_pratica = $a$Determina o sequestro dos bens móveis, verificadas as condições do art. 126, apenas quando não couber a busca e apreensão regulada no Capítulo XI do Título VII deste Livro. É medida subsidiária em relação à busca e apreensão, enquanto o art. 125 trata do sequestro de imóveis.$a$
where codigo='cpp' and numero=132 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Hipoteca legal sobre imóveis do indiciado$c$,
  aplicacao_pratica = $a$Permite ao ofendido requerer a hipoteca legal sobre os imóveis do indiciado em qualquer fase do processo, desde que haja certeza da infração e indícios suficientes da autoria. O art. 136 permite o arresto prévio do imóvel, revogado se, em 15 dias, não for promovido o processo de inscrição da hipoteca legal, e o art. 141 manda levantar o arresto ou cancelar a hipoteca se, por sentença irrecorrível, o réu for absolvido ou julgada extinta a punibilidade.$a$
where codigo='cpp' and numero=134 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Arresto prévio do imóvel$c$,
  aplicacao_pratica = $a$Permite decretar de início o arresto do imóvel, que é revogado se, no prazo de 15 dias, não for promovido o processo de inscrição da hipoteca legal. É a medida cautelar que antecede a hipoteca legal do art. 134, e o prazo de 15 dias é o ponto a controlar.$a$
where codigo='cpp' and numero=136 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Ministério Público na hipoteca legal e no arresto$c$,
  aplicacao_pratica = $a$Atribui ao Ministério Público promover as medidas dos arts. 134 (hipoteca legal) e 137, se houver interesse da Fazenda Pública ou se o ofendido for pobre e o requerer. Nesses casos, o Ministério Público também pode pedir as medidas dos arts. 134, 136 e 137 no juízo cível contra o responsável civil (art. 144). Para a execução da sentença ou a ação civil do titular pobre, a legitimação do Ministério Público está no art. 68.$a$
where codigo='cpp' and numero=142 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Prova testemunhal supletiva do exame de corpo de delito$c$,
  aplicacao_pratica = $a$Admite que a prova testemunhal supra a falta do exame de corpo de delito quando este não for possível por terem desaparecido os vestígios. Em contraste, o art. 184 ressalva o exame de corpo de delito da regra de que a perícia requerida pode ser negada quando desnecessária. A impossibilidade do exame precisa decorrer do desaparecimento dos vestígios.$a$
where codigo='cpp' and numero=167 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 4
update legislacao set
  contexto = $c$Indeferimento da perícia requerida$c$,
  aplicacao_pratica = $a$Autoriza o juiz ou a autoridade policial a negar a perícia requerida pelas partes quando não for necessária ao esclarecimento da verdade, salvo o exame de corpo de delito, que não pode ser negado. Quando o exame de corpo de delito é impossível por terem desaparecido os vestígios, o art. 167 admite que a prova testemunhal supra a falta. O juiz não fica adstrito ao laudo produzido (art. 182).$a$
where codigo='cpp' and numero=184 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;
