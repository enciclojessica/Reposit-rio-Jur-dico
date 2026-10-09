-- CF lote 13: arts. 206 a 212-A (8 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Princípios do ensino$c$,
  aplicacao_pratica = $a$Determina que o ensino seja ministrado com base nos princípios de igualdade de condições para o acesso e permanência na escola (I), liberdade de aprender, ensinar, pesquisar e divulgar o pensamento, a arte e o saber (II), pluralismo de ideias e de concepções pedagógicas e coexistência de instituições públicas e privadas (III), gratuidade do ensino público em estabelecimentos oficiais (IV), valorização dos profissionais da educação escolar (V), gestão democrática do ensino público (VI), garantia de padrão de qualidade (VII), piso salarial profissional nacional para os profissionais da educação escolar pública (VIII) e garantia do direito à educação e à aprendizagem ao longo da vida (IX). O parágrafo único remete à lei as categorias de trabalhadores considerados profissionais da educação básica.$a$
where codigo='cf' and numero=206 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Autonomia universitária$c$,
  aplicacao_pratica = $a$Assegura às universidades autonomia didático-científica, administrativa e de gestão financeira e patrimonial e impõe a elas o princípio de indissociabilidade entre ensino, pesquisa e extensão. O § 1º facilita admitir professores, técnicos e cientistas estrangeiros e o § 2º estende o disposto no artigo às instituições de pesquisa científica e tecnológica.$a$
where codigo='cf' and numero=207 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Dever do Estado com a educação$c$,
  aplicacao_pratica = $a$Efetiva o dever do Estado com a educação mediante a garantia de educação básica obrigatória e gratuita dos 4 aos 17 anos de idade (I), progressiva universalização do ensino médio gratuito (II), atendimento educacional especializado às pessoas com deficiência (III), educação infantil em creche e pré-escola às crianças até 5 anos (IV), acesso aos níveis mais elevados do ensino, da pesquisa e da criação artística (V), oferta de ensino noturno regular (VI) e atendimento ao educando, em todas as etapas da educação básica, por meio de programas suplementares (VII). O § 1º declara o acesso ao ensino obrigatório e gratuito direito público subjetivo, o § 2º atribui responsabilidade à autoridade competente pelo não oferecimento do ensino obrigatório ou por sua oferta irregular e o § 3º incumbe o Poder Público de recensear os educandos no ensino fundamental, fazer-lhes a chamada e zelar pela frequência à escola.$a$
where codigo='cf' and numero=208 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Ensino privado$c$,
  aplicacao_pratica = $a$Declara livre à iniciativa privada o ensino, atendidas as condições de cumprimento das normas gerais da educação nacional (I) e de autorização e avaliação de qualidade pelo Poder Público (II).$a$
where codigo='cf' and numero=209 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Conteúdos mínimos do ensino fundamental$c$,
  aplicacao_pratica = $a$Determina a fixação de conteúdos mínimos para o ensino fundamental, de maneira a assegurar formação básica comum e respeito aos valores culturais e artísticos, nacionais e regionais. O § 1º trata do ensino religioso, de matrícula facultativa, como disciplina dos horários normais das escolas públicas, e o § 2º do ensino fundamental regular em língua portuguesa, com as ressalvas que prevê para as comunidades indígenas.$a$
where codigo='cf' and numero=210 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Sistemas de ensino$c$,
  aplicacao_pratica = $a$Determina que a União, os Estados, o Distrito Federal e os Municípios organizem em regime de colaboração seus sistemas de ensino. O § 1º atribui à União organizar o sistema federal de ensino e o dos Territórios, financiar as instituições públicas federais e exercer função redistributiva e supletiva, o § 2º manda os Municípios atuarem prioritariamente no ensino fundamental e na educação infantil, o § 3º manda os Estados e o Distrito Federal atuarem prioritariamente no ensino fundamental e médio, o § 5º determina que a educação básica pública atenda prioritariamente ao ensino regular e o § 6º prevê a ação redistributiva de cada ente em relação a suas escolas.$a$
where codigo='cf' and numero=211 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Percentuais mínimos para o ensino$c$,
  aplicacao_pratica = $a$Determina que a União aplique, anualmente, nunca menos de dezoito por cento, e os Estados, o Distrito Federal e os Municípios, vinte e cinco por cento, no mínimo, da receita resultante de impostos, compreendida a proveniente de transferências, na manutenção e desenvolvimento do ensino. Os parágrafos tratam, entre outros pontos, da exclusão, do cálculo, da parcela de impostos transferida a outro ente (§ 1º), da prioridade ao ensino obrigatório na distribuição dos recursos (§ 3º), da contribuição social do salário-educação como fonte adicional de financiamento da educação básica (§ 5º), da vedação de uso dos recursos para pagamento de aposentadorias e pensões (§ 7º) e da fiscalização das despesas (§ 9º).$a$
where codigo='cf' and numero=212 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Fundeb: financiamento da educação básica$c$,
  aplicacao_pratica = $a$Determina que os Estados, o Distrito Federal e os Municípios destinem parte dos recursos do caput do art. 212 à manutenção e ao desenvolvimento do ensino na educação básica e à remuneração condigna de seus profissionais, respeitadas as disposições dos incisos I a XV. Entre elas: a distribuição de recursos e de responsabilidades entre os entes (I), a constituição de fundos por vinte por cento de determinadas receitas (II), a complementação da União aos fundos (IV), no mínimo vinte e três por cento (V), o cálculo do VAAT (VI), a proporção não inferior a setenta por cento de cada fundo na remuneração dos profissionais (XI) e o piso salarial profissional nacional por lei específica (XII). Os §§ 1º a 3º tratam do cálculo do VAAT e da destinação de cinquenta por cento dos recursos globais da alínea b do inciso V à educação infantil.$a$
where codigo='cf' and numero=212 and titulo='Art. 212-A' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
