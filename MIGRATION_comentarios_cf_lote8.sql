-- CF lote 8: arts. 167-A a 169 (9 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Ajuste fiscal de Estados, DF e Municípios$c$,
  aplicacao_pratica = $a$Facilita aos Poderes, ao Ministério Público, ao Tribunal de Contas e à Defensoria Pública do ente, quando, no período de 12 meses, a relação entre despesas correntes e receitas correntes superar 95% nos Estados, no Distrito Federal e nos Municípios, aplicar enquanto permanecer a situação o mecanismo de ajuste fiscal de vedação dos atos dos incisos I a X: concessão de vantagem, aumento ou reajuste de remuneração (I), criação de cargo, emprego ou função que implique aumento de despesa (II), alteração de estrutura de carreira que implique aumento de despesa (III), admissão ou contratação de pessoal, ressalvadas as hipóteses do inciso IV, realização de concurso público (V), criação ou majoração de auxílios, vantagens e verbas (VI), criação de despesa obrigatória (VII), reajuste de despesa obrigatória acima da variação da inflação (VIII), criação ou expansão de programas e linhas de financiamento (IX) e concessão ou ampliação de incentivo ou benefício de natureza tributária (X). O § 1º permite que, acima de 85% e sem exceder 95%, as medidas sejam adotadas por atos do Chefe do Poder Executivo, o § 3º trata da perda de eficácia do ato e o § 4º determina apuração bimestral.$a$
where codigo='cf' and numero=167 and titulo='Art. 167-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Regime extraordinário na calamidade nacional$c$,
  aplicacao_pratica = $a$Determina que, durante o estado de calamidade pública de âmbito nacional, decretado pelo Congresso Nacional por iniciativa privativa do Presidente da República, a União adote regime extraordinário fiscal, financeiro e de contratações, somente naquilo em que a urgência for incompatível com o regime regular, nos termos dos arts. 167-C a 167-G.$a$
where codigo='cf' and numero=167 and titulo='Art. 167-B' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Contratações simplificadas na calamidade$c$,
  aplicacao_pratica = $a$Permite ao Poder Executivo federal, com o propósito exclusivo de enfrentar a calamidade pública e seus efeitos sociais e econômicos durante sua duração, adotar processos simplificados de contratação temporária e emergencial de pessoal e de obras, serviços e compras que assegurem, quando possível, competição e igualdade de condições, dispensada a observância do art. 169, § 1º, na contratação do art. 37, IX, sem prejuízo do controle dos órgãos competentes.$a$
where codigo='cf' and numero=167 and titulo='Art. 167-C' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Dispensa de limitações legais na calamidade$c$,
  aplicacao_pratica = $a$Dispensa da observância das limitações legais quanto à criação, expansão ou aperfeiçoamento de ação governamental que acarrete aumento de despesa e à concessão ou ampliação de incentivo ou benefício tributário com renúncia de receita as proposições legislativas e os atos do Poder Executivo com propósito exclusivo de enfrentar a calamidade, com vigência e efeitos restritos à sua duração, desde que não impliquem despesa obrigatória de caráter continuado. O parágrafo único afasta, durante a calamidade pública do art. 167-B, a aplicação do art. 195, § 3º.$a$
where codigo='cf' and numero=167 and titulo='Art. 167-D' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Regra de ouro na calamidade$c$,
  aplicacao_pratica = $a$Dispensa, durante a integralidade do exercício financeiro em que vigore a calamidade pública de âmbito nacional, a observância do art. 167, III.$a$
where codigo='cf' and numero=167 and titulo='Art. 167-E' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Operações de crédito e superávit na calamidade$c$,
  aplicacao_pratica = $a$Durante a calamidade pública de âmbito nacional do art. 167-B, dispensa os limites, condições e restrições aplicáveis à União para a contratação de operações de crédito, bem como sua verificação (I), e permite destinar o superávit financeiro apurado em 31 de dezembro do ano anterior à cobertura de despesas das medidas de combate à calamidade e ao pagamento da dívida pública (II). O § 1º permite à lei complementar definir outras suspensões, dispensas e afastamentos e o § 2º exclui do inciso II determinadas fontes de recursos.$a$
where codigo='cf' and numero=167 and titulo='Art. 167-F' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Vedações do art. 167-A na calamidade$c$,
  aplicacao_pratica = $a$Aplica à União, até o término da calamidade pública do art. 167-B, as vedações previstas no art. 167-A. O § 1º afasta as vedações dos incisos II, IV, VII, IX e X do art. 167-A para medidas de combate à calamidade cuja vigência e efeitos não ultrapassem sua duração, o § 2º afasta o art. 159, I, c, mantendo a transferência nos mesmos montantes do exercício anterior à decretação, e o § 3º faculta aos Estados, ao Distrito Federal e aos Municípios a aplicação das vedações.$a$
where codigo='cf' and numero=167 and titulo='Art. 167-G' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Repasse de duodécimos$c$,
  aplicacao_pratica = $a$Determina que os recursos das dotações orçamentárias, compreendidos os créditos suplementares e especiais, destinados aos órgãos dos Poderes Legislativo e Judiciário, do Ministério Público e da Defensoria Pública, lhes sejam entregues até o dia 20 de cada mês, em duodécimos, na forma da lei complementar do art. 165, § 9º. O § 1º veda a transferência a fundos de recursos financeiros oriundos de repasses duodecimais e o § 2º trata do saldo financeiro decorrente dos recursos entregues.$a$
where codigo='cf' and numero=168 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Limite de despesa com pessoal$c$,
  aplicacao_pratica = $a$Estabelece que a despesa com pessoal ativo e inativo e pensionistas da União, dos Estados, do Distrito Federal e dos Municípios não pode exceder os limites fixados em lei complementar. O § 1º condiciona a concessão de vantagem ou aumento de remuneração e a criação de cargos, empregos e funções, os §§ 2º a 4º tratam da adaptação aos limites e das medidas a adotar, inclusive a perda do cargo, o § 5º da indenização do servidor que perder o cargo, o § 6º da extinção do cargo e o § 7º das normas gerais, fixadas em lei federal.$a$
where codigo='cf' and numero=169 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
