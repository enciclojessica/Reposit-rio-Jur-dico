-- CF lote 7: arts. 163 a 167 (8 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Lei complementar de finanças públicas$c$,
  aplicacao_pratica = $a$Remete a lei complementar a disciplina de finanças públicas (I), dívida pública externa e interna (II), concessão de garantias pelas entidades públicas (III), emissão e resgate de títulos da dívida pública (IV), fiscalização financeira da administração pública direta e indireta (V), operações de câmbio realizadas por órgãos e entidades públicos (VI), compatibilização das funções das instituições oficiais de crédito da União (VII), sustentabilidade da dívida (VIII) e condições e limites para concessão, ampliação ou prorrogação de incentivo ou benefício de natureza tributária (IX). O parágrafo único permite que a lei complementar do inciso VIII autorize a aplicação das vedações previstas no art. 167-A.$a$
where codigo='cf' and numero=163 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Transparência de dados contábeis e fiscais$c$,
  aplicacao_pratica = $a$Determina que a União, os Estados, o Distrito Federal e os Municípios disponibilizem suas informações e dados contábeis, orçamentários e fiscais, conforme periodicidade, formato e sistema estabelecidos pelo órgão central de contabilidade da União, de forma a garantir a rastreabilidade, a comparabilidade e a publicidade dos dados.$a$
where codigo='cf' and numero=163 and titulo='Art. 163-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Banco central e emissão de moeda$c$,
  aplicacao_pratica = $a$Atribui exclusivamente ao banco central a competência da União para emitir moeda. O § 1º veda ao banco central conceder, direta ou indiretamente, empréstimos ao Tesouro Nacional e a qualquer órgão ou entidade que não seja instituição financeira, o § 2º permite que compre e venda títulos de emissão do Tesouro Nacional com o objetivo de regular a oferta de moeda ou a taxa de juros, e o § 3º trata do depósito das disponibilidades de caixa da União no banco central.$a$
where codigo='cf' and numero=164 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Sustentabilidade da dívida pública$c$,
  aplicacao_pratica = $a$Determina que a União, os Estados, o Distrito Federal e os Municípios conduzam suas políticas fiscais de forma a manter a dívida pública em níveis sustentáveis, na forma da lei complementar referida no art. 163, VIII. O parágrafo único exige que a elaboração e a execução de planos e orçamentos reflitam a compatibilidade dos indicadores fiscais com essa sustentabilidade.$a$
where codigo='cf' and numero=164 and titulo='Art. 164-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Leis orçamentárias$c$,
  aplicacao_pratica = $a$Atribui a leis de iniciativa do Poder Executivo o estabelecimento do plano plurianual (I), das diretrizes orçamentárias (II) e dos orçamentos anuais (III). O § 1º trata do plano plurianual, o § 2º das diretrizes orçamentárias, o § 3º do relatório resumido da execução orçamentária publicado até trinta dias após o encerramento de cada bimestre, o § 5º do conteúdo da lei orçamentária anual, o § 8º da vedação de dispositivo estranho à previsão da receita e à fixação da despesa e o § 9º das matérias reservadas à lei complementar. Os §§ 10 a 22 tratam, entre outros pontos, do dever de executar as programações orçamentárias e dos limites individualizados.$a$
where codigo='cf' and numero=165 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Processo legislativo orçamentário$c$,
  aplicacao_pratica = $a$Determina que os projetos de lei relativos ao plano plurianual, às diretrizes orçamentárias, ao orçamento anual e aos créditos adicionais sejam apreciados pelas duas Casas do Congresso Nacional, na forma do regimento comum. O § 1º atribui a uma Comissão mista permanente de Senadores e Deputados o exame desses projetos, o § 2º trata das emendas na Comissão mista, o § 3º das emendas ao orçamento anual, o § 4º das emendas à lei de diretrizes orçamentárias, o § 5º da modificação dos projetos por mensagem do Presidente da República e o § 6º do envio dos projetos. Os §§ 9º a 20 tratam das emendas individuais e da execução obrigatória das programações.$a$
where codigo='cf' and numero=166 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Transferências de emendas individuais$c$,
  aplicacao_pratica = $a$Permite que as emendas individuais impositivas ao projeto de lei orçamentária anual aloquem recursos a Estados, ao Distrito Federal e a Municípios por meio de transferência especial (I) ou de transferência com finalidade definida (II). Os parágrafos tratam da natureza dos recursos transferidos (§ 1º), da transferência especial (§§ 2º, 3º e 5º) e da transferência com finalidade definida (§ 4º).$a$
where codigo='cf' and numero=166 and titulo='Art. 166-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Vedações orçamentárias$c$,
  aplicacao_pratica = $a$Veda, entre outros atos: o início de programas ou projetos não incluídos na lei orçamentária anual (I), a realização de despesas ou a assunção de obrigações diretas que excedam os créditos orçamentários ou adicionais (II), a realização de operações de crédito que excedam o montante das despesas de capital (III), a vinculação de receita de impostos a órgão, fundo ou despesa, ressalvadas as exceções do inciso IV, a abertura de crédito suplementar ou especial sem prévia autorização legislativa e sem indicação dos recursos correspondentes (V), a transposição, o remanejamento ou a transferência de recursos de uma categoria de programação para outra (VI), a concessão ou utilização de créditos ilimitados (VII), a utilização de recursos dos orçamentos fiscal e da seguridade social sem autorização legislativa específica (VIII) e a instituição de fundos de qualquer natureza sem prévia autorização legislativa (IX). Os incisos X a XIV e os §§ 1º a 7º tratam, entre outros pontos, de transferências voluntárias, do crédito extraordinário (§ 3º) e da vinculação de receitas (§ 4º).$a$
where codigo='cf' and numero=167 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
