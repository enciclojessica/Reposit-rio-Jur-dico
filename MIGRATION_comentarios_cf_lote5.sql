-- CF lote 5: arts. 145 a 156-A (16 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Espécies tributárias$c$,
  aplicacao_pratica = $a$Autoriza a União, os Estados, o Distrito Federal e os Municípios a instituir impostos (I), taxas, em razão do exercício do poder de polícia ou pela utilização, efetiva ou potencial, de serviços públicos (II), e contribuição de melhoria, decorrente de obras públicas (III). O § 1º trata do caráter pessoal e da capacidade econômica dos impostos, o § 2º veda que as taxas tenham base de cálculo própria de impostos, o § 3º enuncia princípios que o Sistema Tributário Nacional deve observar e o § 4º determina que as alterações na legislação tributária busquem atenuar efeitos regressivos.$a$
where codigo='cf' and numero=145 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Lei complementar em matéria tributária$c$,
  aplicacao_pratica = $a$Atribui à lei complementar dispor sobre conflitos de competência, em matéria tributária, entre os entes federativos (I), regular as limitações constitucionais ao poder de tributar (II) e estabelecer normas gerais em matéria de legislação tributária (III). O § 1º permite à lei complementar instituir regime único de arrecadação dos impostos e contribuições dos entes federativos, o § 2º trata da faculdade do optante de apurar e recolher tributos por esse regime e o § 3º do recolhimento dos tributos dos arts. 156-A e 195, V, por meio dele.$a$
where codigo='cf' and numero=146 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Critérios especiais de tributação$c$,
  aplicacao_pratica = $a$Permite que lei complementar estabeleça critérios especiais de tributação com o objetivo de prevenir desequilíbrios da concorrência, sem prejuízo da competência de a União, por lei, estabelecer normas de igual objetivo.$a$
where codigo='cf' and numero=146 and titulo='Art. 146-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Impostos em Território Federal e no Distrito Federal$c$,
  aplicacao_pratica = $a$Atribui à União, em Território Federal, os impostos estaduais e, se o Território não for dividido em Municípios, cumulativamente, os impostos municipais, e ao Distrito Federal os impostos municipais.$a$
where codigo='cf' and numero=147 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Empréstimos compulsórios$c$,
  aplicacao_pratica = $a$Permite que a União, mediante lei complementar, institua empréstimos compulsórios para atender a despesas extraordinárias decorrentes de calamidade pública, de guerra externa ou sua iminência (I) e no caso de investimento público de caráter urgente e de relevante interesse nacional (II). O parágrafo único vincula a aplicação dos recursos à despesa que fundamentou a instituição.$a$
where codigo='cf' and numero=148 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Contribuições sociais, interventivas e corporativas$c$,
  aplicacao_pratica = $a$Atribui exclusivamente à União a instituição de contribuições sociais, de intervenção no domínio econômico e de interesse das categorias profissionais ou econômicas, observados os arts. 146, III, e 150, I e III, e sem prejuízo do art. 195, § 6º. O § 1º trata da contribuição dos servidores para os regimes próprios de previdência, os §§ 1º-A a 1º-C do deficit atuarial, o § 2º das contribuições sociais e de intervenção no domínio econômico, o § 3º da pessoa natural destinatária de importação e o § 4º da incidência única.$a$
where codigo='cf' and numero=149 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Contribuição de iluminação pública$c$,
  aplicacao_pratica = $a$Permite que os Municípios e o Distrito Federal instituam contribuição, na forma das respectivas leis, para o custeio, a expansão e a melhoria do serviço de iluminação pública e de sistemas de monitoramento para segurança e preservação de logradouros públicos, observado o art. 150, I e III. O parágrafo único faculta a cobrança na fatura de consumo de energia elétrica.$a$
where codigo='cf' and numero=149 and titulo='Art. 149-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Regras comuns do IBS e da CBS$c$,
  aplicacao_pratica = $a$Determina que os tributos dos arts. 156-A e 195, V, observem as mesmas regras quanto a fatos geradores, bases de cálculo, hipóteses de não incidência e sujeitos passivos (I), imunidades (II), regimes específicos, diferenciados ou favorecidos de tributação (III) e regras de não cumulatividade e de creditamento (IV). O parágrafo único trata das imunidades que esses tributos observarão.$a$
where codigo='cf' and numero=149 and titulo='Art. 149-B' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Operações da administração pública$c$,
  aplicacao_pratica = $a$Destina integralmente ao ente federativo contratante o produto da arrecadação do imposto do art. 156-A e da contribuição do art. 195, V, incidentes sobre operações contratadas pela administração pública direta, por autarquias e por fundações públicas, inclusive suas importações, mediante redução a zero das alíquotas devidas aos demais entes. O § 1º permite alíquotas reduzidas de modo uniforme, o § 2º autoriza lei complementar a prever hipóteses em que o caput não se aplica e o § 3º trata das importações feitas pela administração pública.$a$
where codigo='cf' and numero=149 and titulo='Art. 149-C' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Limitações constitucionais ao poder de tributar$c$,
  aplicacao_pratica = $a$Veda à União, aos Estados, ao Distrito Federal e aos Municípios, sem prejuízo de outras garantias do contribuinte: exigir ou aumentar tributo sem lei que o estabeleça (I), instituir tratamento desigual entre contribuintes em situação equivalente (II), cobrar tributos nas hipóteses do inciso III, utilizar tributo com efeito de confisco (IV), estabelecer limitações ao tráfego de pessoas ou bens por meio de tributos interestaduais ou intermunicipais (V) e instituir impostos sobre as matérias do inciso VI. Os §§ 1º a 7º tratam de exceções e extensões dessas vedações, da informação ao consumidor sobre os impostos (§ 5º), dos benefícios fiscais, que dependem de lei específica (§ 6º), e da atribuição de responsabilidade tributária (§ 7º).$a$
where codigo='cf' and numero=150 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Vedações à União em matéria tributária$c$,
  aplicacao_pratica = $a$Veda à União instituir tributo que não seja uniforme em todo o território nacional ou que implique distinção ou preferência em relação a Estado, Distrito Federal ou Município (I), tributar a renda das obrigações da dívida pública dos Estados, do Distrito Federal e dos Municípios (II) e instituir isenções de tributos da competência dos Estados, do Distrito Federal ou dos Municípios (III).$a$
where codigo='cf' and numero=151 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Proibição de diferença tributária por procedência ou destino$c$,
  aplicacao_pratica = $a$Veda aos Estados, ao Distrito Federal e aos Municípios estabelecer diferença tributária entre bens e serviços, de qualquer natureza, em razão de sua procedência ou destino.$a$
where codigo='cf' and numero=152 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Impostos da União$c$,
  aplicacao_pratica = $a$Atribui à União a competência para instituir impostos sobre importação (I), exportação (II), renda e proventos de qualquer natureza (III), produtos industrializados (IV), operações de crédito, câmbio e seguro, ou relativas a títulos ou valores mobiliários (V), propriedade territorial rural (VI), grandes fortunas, nos termos de lei complementar (VII) e produção, extração, comercialização ou importação de bens e serviços prejudiciais à saúde ou ao meio ambiente (VIII). O § 1º faculta ao Poder Executivo alterar as alíquotas dos impostos dos incisos I, II, IV e V, nos limites da lei, e o § 5º trata do ouro definido em lei como ativo financeiro ou instrumento cambial.$a$
where codigo='cf' and numero=153 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competência residual e impostos extraordinários$c$,
  aplicacao_pratica = $a$Permite à União instituir, mediante lei complementar, impostos não previstos no art. 153, desde que sejam não cumulativos e não tenham fato gerador ou base de cálculo próprios dos discriminados na Constituição (I), e, na iminência ou no caso de guerra externa, impostos extraordinários, compreendidos ou não em sua competência tributária, a serem suprimidos gradativamente, cessadas as causas de sua criação (II).$a$
where codigo='cf' and numero=154 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Impostos dos Estados e do Distrito Federal$c$,
  aplicacao_pratica = $a$Atribui aos Estados e ao Distrito Federal a competência para instituir impostos sobre transmissão causa mortis e doação, de quaisquer bens ou direitos (I), operações relativas à circulação de mercadorias e prestações de serviços do inciso II e propriedade de veículos automotores (III). Os parágrafos tratam do regime de cada imposto (§§ 1º, 2º e 6º), das exceções do § 3º e, quanto ao inciso XII, h, da disciplina dos §§ 4º e 5º.$a$
where codigo='cf' and numero=155 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 4
update legislacao set
  contexto = $c$Imposto sobre bens e serviços (IBS)$c$,
  aplicacao_pratica = $a$Determina que lei complementar institua imposto sobre bens e serviços de competência compartilhada entre Estados, Distrito Federal e Municípios. Os parágrafos tratam, entre outros pontos, dos princípios do imposto (§ 1º), do sujeito passivo (§ 3º), da distribuição do produto da arrecadação (§ 4º), das matérias reservadas à lei complementar (§§ 5º e 6º), da isenção e da imunidade (§ 7º), da vinculação de receitas (§ 10) e da devolução prevista no § 5º, VIII (§§ 12 e 13).$a$
where codigo='cf' and numero=156 and titulo='Art. 156-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
