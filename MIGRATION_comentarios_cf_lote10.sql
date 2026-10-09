-- CF lote 10: arts. 181 a 189 (9 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Requisição estrangeira de documentos comerciais$c$,
  aplicacao_pratica = $a$Condiciona a autorização do Poder competente o atendimento de requisição de documento ou informação de natureza comercial, feita por autoridade administrativa ou judiciária estrangeira, a pessoa física ou jurídica residente ou domiciliada no País.$a$
where codigo='cf' and numero=181 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Política de desenvolvimento urbano$c$,
  aplicacao_pratica = $a$Atribui ao Poder Público municipal a execução da política de desenvolvimento urbano, conforme diretrizes gerais fixadas em lei, com o objetivo de ordenar o pleno desenvolvimento das funções sociais da cidade e garantir o bem-estar de seus habitantes. O § 1º torna o plano diretor, aprovado pela Câmara Municipal, obrigatório para cidades com mais de vinte mil habitantes, o § 2º trata da função social da propriedade urbana, o § 3º da desapropriação com prévia e justa indenização em dinheiro e o § 4º das medidas facultadas ao Poder Público municipal, mediante lei específica, para área incluída no plano diretor.$a$
where codigo='cf' and numero=182 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Usucapião especial urbana$c$,
  aplicacao_pratica = $a$Confere o domínio a quem possuir como sua área urbana de até duzentos e cinquenta metros quadrados, por cinco anos, ininterruptamente e sem oposição, utilizando-a para sua moradia ou de sua família, desde que não seja proprietário de outro imóvel urbano ou rural. O § 1º trata do título de domínio e da concessão de uso, o § 2º veda o reconhecimento do direito ao mesmo possuidor mais de uma vez e o § 3º exclui a usucapião de imóveis públicos.$a$
where codigo='cf' and numero=183 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Desapropriação para reforma agrária$c$,
  aplicacao_pratica = $a$Atribui à União a competência para desapropriar por interesse social, para fins de reforma agrária, o imóvel rural que não esteja cumprindo sua função social, mediante prévia e justa indenização em títulos da dívida agrária, com cláusula de preservação do valor real, resgatáveis em até vinte anos a partir do segundo ano de sua emissão. O § 1º determina a indenização das benfeitorias úteis e necessárias em dinheiro, o § 2º dispõe que o decreto que declara o imóvel de interesse social autoriza a União a propor a ação de desapropriação, o § 3º trata do procedimento contraditório especial, de rito sumário, a ser estabelecido por lei complementar, o § 4º do orçamento dos títulos da dívida agrária e o § 5º da isenção de impostos nas operações de transferência de imóveis desapropriados.$a$
where codigo='cf' and numero=184 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Imóveis insuscetíveis de desapropriação agrária$c$,
  aplicacao_pratica = $a$Declara insuscetíveis de desapropriação para fins de reforma agrária a pequena e média propriedade rural, assim definida em lei, desde que seu proprietário não possua outra (I), e a propriedade produtiva (II). O parágrafo único determina que a lei garanta tratamento especial à propriedade produtiva e fixe normas para o cumprimento dos requisitos relativos à sua função social.$a$
where codigo='cf' and numero=185 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Função social da propriedade rural$c$,
  aplicacao_pratica = $a$Considera cumprida a função social quando a propriedade rural atende, simultaneamente, segundo critérios e graus de exigência estabelecidos em lei, aos requisitos de aproveitamento racional e adequado (I), utilização adequada dos recursos naturais disponíveis e preservação do meio ambiente (II), observância das disposições que regulam as relações de trabalho (III) e exploração que favoreça o bem-estar dos proprietários e dos trabalhadores (IV).$a$
where codigo='cf' and numero=186 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Política agrícola$c$,
  aplicacao_pratica = $a$Determina que a política agrícola seja planejada e executada na forma da lei, com a participação efetiva do setor de produção, envolvendo produtores e trabalhadores rurais, bem como dos setores de comercialização, armazenamento e transportes, levando em conta os instrumentos creditícios e fiscais (I), os preços compatíveis com os custos de produção e a garantia de comercialização (II), o incentivo à pesquisa e à tecnologia (III), a assistência técnica e extensão rural (IV), o seguro agrícola (V), o cooperativismo (VI), a eletrificação rural e irrigação (VII) e a habitação para o trabalhador rural (VIII). O § 1º inclui no planejamento agrícola as atividades agroindustriais, agropecuárias, pesqueiras e florestais e o § 2º manda compatibilizar a política agrícola e a reforma agrária.$a$
where codigo='cf' and numero=187 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Terras públicas e devolutas$c$,
  aplicacao_pratica = $a$Determina que a destinação de terras públicas e devolutas seja compatibilizada com a política agrícola e com o plano nacional de reforma agrária. O § 1º submete à prévia aprovação do Congresso Nacional a alienação ou concessão, a qualquer título, de terras públicas com área superior a dois mil e quinhentos hectares a pessoa física ou jurídica, e o § 2º excetua dessa regra as alienações ou concessões para fins de reforma agrária.$a$
where codigo='cf' and numero=188 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Títulos da reforma agrária$c$,
  aplicacao_pratica = $a$Determina que os beneficiários da distribuição de imóveis rurais pela reforma agrária recebam títulos de domínio ou de concessão de uso, inegociáveis pelo prazo de dez anos. O parágrafo único determina que o título de domínio e a concessão de uso sejam conferidos ao homem ou à mulher, ou a ambos, independentemente do estado civil.$a$
where codigo='cf' and numero=189 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
