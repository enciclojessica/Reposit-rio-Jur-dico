-- CF lote 6: arts. 156 a 162 (9 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Impostos dos Municípios$c$,
  aplicacao_pratica = $a$Atribui aos Municípios a competência para instituir impostos sobre propriedade predial e territorial urbana (I), transmissão inter vivos, a qualquer título, por ato oneroso, de bens imóveis e direitos reais a eles relativos (II) e serviços de qualquer natureza, não compreendidos no art. 155, II (III). O § 1º trata da progressividade e o § 1º-A de hipótese de não incidência do imposto do inciso I, o § 2º do imposto do inciso II e o § 3º da função da lei complementar quanto ao imposto do inciso III.$a$
where codigo='cf' and numero=156 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Comitê Gestor do IBS$c$,
  aplicacao_pratica = $a$Determina que os Estados, o Distrito Federal e os Municípios exerçam de forma integrada, exclusivamente por meio do Comitê Gestor do Imposto sobre Bens e Serviços, as competências relativas ao imposto do art. 156-A, entre elas editar regulamento único e uniformizar a interpretação e a aplicação da legislação (I), arrecadar o imposto, efetuar as compensações e distribuir o produto da arrecadação (II) e decidir o contencioso administrativo (III). Os parágrafos tratam da natureza e da organização do Comitê (§§ 1º a 3º), das deliberações (§ 4º), do Presidente (§ 5º) e da atuação conjunta com a administração tributária da União (§§ 6º a 8º).$a$
where codigo='cf' and numero=156 and titulo='Art. 156-B' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Repartição de receitas: Estados e Distrito Federal$c$,
  aplicacao_pratica = $a$Determina que pertençam aos Estados e ao Distrito Federal o produto da arrecadação do imposto da União sobre renda e proventos de qualquer natureza, incidente na fonte, sobre rendimentos pagos, a qualquer título, por eles, suas autarquias e pelas fundações que instituírem e mantiverem (I), e vinte por cento do produto da arrecadação do imposto que a União instituir no exercício da competência do art. 154, I (II).$a$
where codigo='cf' and numero=157 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Repartição de receitas: Municípios$c$,
  aplicacao_pratica = $a$Determina que pertençam aos Municípios o produto da arrecadação do imposto da União sobre renda e proventos de qualquer natureza, incidente na fonte, sobre rendimentos pagos por eles, suas autarquias e fundações (I), cinquenta por cento do imposto da União sobre a propriedade territorial rural, relativamente aos imóveis neles situados, com a totalidade na hipótese de opção do art. 153, § 4º, III (II), cinquenta por cento do imposto do Estado sobre a propriedade de veículos automotores licenciados em seus territórios (III) e vinte e cinco por cento das parcelas do inciso IV. Os §§ 1º e 2º tratam das parcelas de receita pertencentes aos Municípios mencionadas no inciso IV.$a$
where codigo='cf' and numero=158 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Entrega de recursos pela União$c$,
  aplicacao_pratica = $a$Determina que a União entregue cinquenta por cento do produto da arrecadação dos impostos sobre renda e proventos de qualquer natureza, sobre produtos industrializados e do imposto do art. 153, VIII (I), dez por cento do produto do imposto sobre produtos industrializados e do imposto do art. 153, VIII aos Estados e ao Distrito Federal, proporcionalmente às suas exportações de produtos industrializados (II), e vinte e nove por cento da contribuição do art. 177, § 4º, aos Estados e ao Distrito Federal (III). O § 2º limita a vinte por cento do montante do inciso II a parcela de cada unidade federada, o § 3º determina que os Estados entreguem 25% dos recursos do inciso II aos Municípios e o § 4º destina 25% do montante do inciso III aos Municípios.$a$
where codigo='cf' and numero=159 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Fundo Nacional de Desenvolvimento Regional$c$,
  aplicacao_pratica = $a$Institui o Fundo Nacional de Desenvolvimento Regional, com o objetivo de reduzir as desigualdades regionais e sociais, nos termos do art. 3º, III, mediante a entrega de recursos da União aos Estados e ao Distrito Federal para realização de estudos, projetos e obras de infraestrutura (I), fomento a atividades produtivas com elevado potencial de geração de emprego e renda (II) e promoção de ações com vistas ao desenvolvimento científico e tecnológico (III). O § 1º veda a retenção ou restrição ao recebimento dos recursos, os §§ 2º a 4º tratam da aplicação e da entrega e o § 5º atribui ao Tribunal de Contas da União regulamentar e calcular as cotas.$a$
where codigo='cf' and numero=159 and titulo='Art. 159-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Vedação de retenção de repasses$c$,
  aplicacao_pratica = $a$Veda a retenção ou qualquer restrição à entrega e ao emprego dos recursos atribuídos, na seção, aos Estados, ao Distrito Federal e aos Municípios, neles compreendidos adicionais e acréscimos relativos a impostos. O § 1º trata do condicionamento da entrega de recursos pela União e pelos Estados e o § 2º dos contratos, acordos, ajustes, convênios, parcelamentos ou renegociações.$a$
where codigo='cf' and numero=160 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Lei complementar sobre repartição de receitas$c$,
  aplicacao_pratica = $a$Atribui à lei complementar definir valor adicionado para fins do art. 158, § 1º, I (I), estabelecer normas sobre a entrega dos recursos de que trata o art. 159 (II) e dispor sobre o acompanhamento, pelos beneficiários, do cálculo das quotas e da liberação das participações (III). O parágrafo único atribui ao Tribunal de Contas da União o cálculo das quotas referentes aos fundos de participação.$a$
where codigo='cf' and numero=161 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Transparência da arrecadação$c$,
  aplicacao_pratica = $a$Determina que a União, os Estados, o Distrito Federal e os Municípios divulguem, até o último dia do mês subsequente ao da arrecadação, os montantes de cada um dos tributos arrecadados, os recursos recebidos e os valores de origem tributária entregues e a entregar. O parágrafo único trata da discriminação dos dados divulgados pela União por Estado e por Município.$a$
where codigo='cf' and numero=162 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
