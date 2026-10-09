-- Reescrita de comentarios curtos do CPP, lote 4 (guardado por length(aplicacao_pratica)<200)
-- Reescrita de comentários curtos de CPP no padrão aprovado em 09/10/2026: só onde há função ou distinção verificada no texto do banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Nulidade: exigência de prejuízo$c$,
  aplicacao_pratica = $a$Impede declarar nulo ato do qual não resulte prejuízo para a acusação ou para a defesa. Na peça, quem alega nulidade deve demonstrar o prejuízo. O art. 566 acrescenta que não se declara a nulidade de ato que não houver influído na apuração da verdade substancial ou na decisão da causa, e o art. 565 impede a parte de arguir nulidade a que deu causa.$a$
where codigo='cpp' and numero=563 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Nulidade: vedação à parte que lhe deu causa$c$,
  aplicacao_pratica = $a$Impede a parte de arguir nulidade a que haja dado causa, ou para que tenha concorrido, ou referente a formalidade cuja observância só à parte contrária interesse. Complementa o art. 563, que exige prejuízo, e o art. 566, que exige influência na apuração da verdade substancial ou na decisão da causa.$a$
where codigo='cpp' and numero=565 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Nulidade: influência na verdade substancial ou na decisão$c$,
  aplicacao_pratica = $a$Impede declarar a nulidade de ato processual que não houver influído na apuração da verdade substancial ou na decisão da causa. Aproxima-se do art. 563, que exige prejuízo para a acusação ou para a defesa; na peça, convém demonstrar tanto o prejuízo quanto a influência do ato na decisão.$a$
where codigo='cpp' and numero=566 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Indisponibilidade do recurso do Ministério Público$c$,
  aplicacao_pratica = $a$Veda ao Ministério Público desistir de recurso que haja interposto. É paralelo ao art. 42, que veda ao Ministério Público desistir da ação penal.$a$
where codigo='cpp' and numero=576 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Legitimados para a revisão criminal$c$,
  aplicacao_pratica = $a$Permite pedir a revisão ao próprio réu, a procurador legalmente habilitado ou, no caso de morte do réu, ao cônjuge, ascendente, descendente ou irmão, o mesmo círculo de pessoas que sucede o ofendido nos arts. 24, § 1º, e 31. A revisão pode ser requerida em qualquer tempo, antes da extinção da pena ou após (art. 622).$a$
where codigo='cpp' and numero=623 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Execução de penas privativas cumuladas: ordem$c$,
  aplicacao_pratica = $a$Se impostas cumulativamente penas privativas da liberdade, executa-se primeiro a de reclusão, depois a de detenção e por último a de prisão simples. Disciplina a ordem entre espécies de pena; para o concurso de infrações, o Código Penal manda executar primeiro a pena mais grave (art. 76).$a$
where codigo='cpp' and numero=681 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Sursis: pronunciamento obrigatório na sentença$c$,
  aplicacao_pratica = $a$Impõe ao juiz ou tribunal que, na decisão que aplicar pena privativa da liberdade não superior a 2 anos, se pronuncie motivadamente sobre a suspensão condicional, quer a conceda, quer a negue. O limite de 2 anos coincide com o do art. 77 do Código Penal, que prevê a suspensão por 2 a 4 anos. A omissão do pronunciamento é ponto a arguir.$a$
where codigo='cpp' and numero=697 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Sursis: o que a suspensão não compreende$c$,
  aplicacao_pratica = $a$Dispõe que a suspensão não compreende a multa, as penas acessórias, os efeitos da condenação nem as custas. O Código Penal tem regra paralela, ao prever que a suspensão não se estende às penas restritivas de direitos nem à multa (art. 80).$a$
where codigo='cpp' and numero=700 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Livramento condicional: soma de penas$c$,
  aplicacao_pratica = $a$Permite somar as penas que correspondem a infrações diversas para efeito do livramento condicional. Reproduz, no plano processual, o art. 84 do Código Penal, segundo o qual as penas que correspondem a infrações diversas devem somar-se para efeito do livramento. O requisito de pena igual ou superior a 2 anos está no art. 83 do Código Penal.$a$
where codigo='cpp' and numero=711 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Livramento: parecer do Conselho Penitenciário$c$,
  aplicacao_pratica = $a$Atribui ao Conselho Penitenciário a verificação das condições de admissibilidade, conveniência e oportunidade do livramento, mas o parecer não vincula o juiz. Na peça, o parecer desfavorável não impede o pedido, e o parecer favorável não garante a concessão. As condições objetivas constam do art. 710.$a$
where codigo='cpp' and numero=713 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Livramento: revogação obrigatória$c$,
  aplicacao_pratica = $a$Impõe a revogação do livramento quando o liberado é condenado, por sentença irrecorrível, a pena privativa de liberdade, por crime ou contravenção. Distingue-se do art. 727, em que a revogação é facultativa (o juiz pode revogar), por descumprimento de obrigação, inobservância de proibição ou condenação irrecorrível, por crime, a pena não privativa de liberdade.$a$
where codigo='cpp' and numero=726 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Livramento: efeitos da revogação por outro motivo$c$,
  aplicacao_pratica = $a$Nas revogações por outro motivo, o tempo em que o liberado esteve solto não é computado na pena e não se concede novo livramento em relação à mesma pena. Contrasta com o art. 728, que, se a revogação decorre de infração penal anterior ao livramento, computa o período solto e permite somar as duas penas para novo livramento.$a$
where codigo='cpp' and numero=729 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Medida de segurança: juiz competente para aplicar$c$,
  aplicacao_pratica = $a$Define quem aplica a medida de segurança: o juiz da execução da pena, nos casos dos arts. 751 e 752, e o juiz da sentença, no caso do art. 753 (sentença absolutória transitada em julgado). Distingue-se do art. 758, que trata de quem executa a medida, e não de quem a aplica.$a$
where codigo='cpp' and numero=754 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Medida de segurança: juiz da execução$c$,
  aplicacao_pratica = $a$Atribui ao juiz da execução da sentença a execução da medida de segurança. Não confundir com o art. 754, que define o juiz competente para aplicá-la (juiz da execução da pena ou juiz da sentença, conforme o caso).$a$
where codigo='cpp' and numero=758 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Sentença estrangeira: homologação prévia$c$,
  aplicacao_pratica = $a$Exige homologação prévia da sentença estrangeira para que produza os efeitos do art. 7º do Código Penal. O texto atribui a homologação ao Supremo Tribunal Federal, mas a Constituição, art. 105, I, i, atribui ao Superior Tribunal de Justiça a competência originária para a homologação de sentenças estrangeiras. Na peça, indicar o órgão pela Constituição.$a$
where codigo='cpp' and numero=787 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;
