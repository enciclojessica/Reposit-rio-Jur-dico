-- Reescrita CPP, lote 1 (arts. 16 a 68)
-- Reescrita de comentários curtos de CPP no padrão aprovado em 09/10/2026: só onde há função ou distinção verificada no texto do banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Devolução do inquérito pelo Ministério Público$c$,
  aplicacao_pratica = $a$Limita o poder do Ministério Público de pedir a devolução do inquérito à autoridade policial: só é admitida para novas diligências imprescindíveis ao oferecimento da denúncia. A requisição direta de esclarecimentos, documentos complementares ou novos elementos de convicção a quaisquer autoridades ou funcionários está no art. 47.$a$
where codigo='cpp' and numero=16 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Arquivamento do inquérito: vedação à autoridade policial$c$,
  aplicacao_pratica = $a$Veda à autoridade policial mandar arquivar autos de inquérito, de modo que a decisão de arquivar não lhe cabe. O art. 18 trata do que ocorre depois de ordenado o arquivamento pela autoridade judiciária: a autoridade policial pode proceder a novas pesquisas, se tiver notícia de outras provas.$a$
where codigo='cpp' and numero=17 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Novas pesquisas após o arquivamento$c$,
  aplicacao_pratica = $a$Depois de ordenado o arquivamento do inquérito pela autoridade judiciária, por falta de base para a denúncia, a autoridade policial pode proceder a novas pesquisas, se tiver notícia de outras provas. Contrasta com o art. 17, pelo qual a autoridade policial não pode mandar arquivar o inquérito: aqui o arquivamento é ordenado pela autoridade judiciária.$a$
where codigo='cpp' and numero=18 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Representação: limite da retratação$c$,
  aplicacao_pratica = $a$Fixa até quando o ofendido pode se retratar da representação, condição de procedibilidade da ação pública condicionada (art. 24): depois de oferecida a denúncia, a retratação não é mais possível. Não confundir com o prazo para exercer a representação, que é de decadência e está no art. 38. Na peça, a retratação só produz efeito se anterior à denúncia.$a$
where codigo='cpp' and numero=25 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Titularidade da ação penal privada$c$,
  aplicacao_pratica = $a$Atribui ao ofendido, ou a quem tenha qualidade para representá-lo, intentar a ação privada. Contrasta com o art. 24, pelo qual a ação pública é promovida por denúncia do Ministério Público. Com a morte do ofendido ou sua declaração de ausência, o direito de queixa passa às pessoas indicadas no art. 31.$a$
where codigo='cpp' and numero=30 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Sucessão no direito de queixa$c$,
  aplicacao_pratica = $a$Com a morte do ofendido ou sua declaração de ausência, o direito de oferecer queixa ou prosseguir na ação passa ao cônjuge, ascendente, descendente ou irmão. É a regra paralela, para a ação privada, do art. 24, § 1º, que transfere às mesmas pessoas o direito de representação. Na peça, a legitimidade de quem sucede o ofendido depende da relação de parentesco indicada.$a$
where codigo='cpp' and numero=31 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Renúncia ao direito de queixa: extensão a todos os autores$c$,
  aplicacao_pratica = $a$A renúncia ao exercício do direito de queixa em relação a um dos autores do crime se estende a todos, em decorrência da indivisibilidade da ação privada (art. 48). Difere do perdão do art. 51, que também aproveita a todos, mas não produz efeito em relação ao querelado que o recusar.$a$
where codigo='cpp' and numero=49 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Renúncia expressa: forma$c$,
  aplicacao_pratica = $a$Exige que a renúncia expressa conste de declaração assinada pelo ofendido, por seu representante legal ou por procurador com poderes especiais. O parágrafo único trata da renúncia do representante legal do menor que completou 18 anos. A mesma forma se aplica ao perdão extraprocessual expresso (art. 56), e a renúncia tácita se prova por todos os meios (art. 57).$a$
where codigo='cpp' and numero=50 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Perdão a um dos querelados: extensão e recusa$c$,
  aplicacao_pratica = $a$O perdão concedido a um dos querelados aproveita a todos, mas não produz efeito em relação ao que o recusar. Ao contrário da renúncia do art. 49, que se estende a todos os autores sem ressalva, o perdão depende da aceitação de cada querelado, cuja forma está nos arts. 58 e 59.$a$
where codigo='cpp' and numero=51 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Perdão extraprocessual expresso: forma$c$,
  aplicacao_pratica = $a$Manda aplicar ao perdão extraprocessual expresso o art. 50, de modo que ele conste de declaração assinada pelo ofendido, por seu representante legal ou por procurador com poderes especiais. A aceitação desse perdão tem forma própria no art. 59.$a$
where codigo='cpp' and numero=56 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Prova da renúncia e do perdão tácitos$c$,
  aplicacao_pratica = $a$Admite todos os meios de prova para demonstrar a renúncia tácita e o perdão tácito. Contrasta com a renúncia e o perdão expressos, que exigem declaração assinada (arts. 50, 56 e 59).$a$
where codigo='cpp' and numero=57 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Perdão do querelado: aceitação fora do processo$c$,
  aplicacao_pratica = $a$Regula a forma da aceitação do perdão concedido fora do processo: declaração assinada pelo querelado, por seu representante legal ou por procurador com poderes especiais. Contrasta com o art. 58, em que o perdão concedido nos autos exige intimação do querelado para dizer em três dias se o aceita, e o silêncio importa aceitação. O art. 55 admite a aceitação por procurador com poderes especiais.$a$
where codigo='cpp' and numero=59 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Absolvição criminal e ação civil$c$,
  aplicacao_pratica = $a$Admite a propositura da ação civil mesmo com sentença absolutória no juízo criminal, desde que não tenha sido reconhecida categoricamente a inexistência material do fato. A sentença condenatória transitada em julgado tem efeito próprio, que permite a execução no juízo cível (art. 63). Na peça, o fundamento da absolvição define se a via civil permanece aberta.$a$
where codigo='cpp' and numero=66 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Ministério Público na reparação do dano do pobre$c$,
  aplicacao_pratica = $a$Atribui ao Ministério Público, a requerimento do titular do direito à reparação que seja pobre (art. 32, §§ 1º e 2º), promover a execução da sentença condenatória (art. 63) ou a ação civil (art. 64). O requerimento do titular e a condição de pobreza são os pressupostos.$a$
where codigo='cpp' and numero=68 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;
