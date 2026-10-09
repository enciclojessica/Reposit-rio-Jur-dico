-- Reescrita de comentarios curtos do CPP, lote 3 (guardado por length(aplicacao_pratica)<200)
-- Reescrita de comentários curtos de CPP no padrão aprovado em 09/10/2026: só onde há função ou distinção verificada no texto do banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Assistente do Ministério Público: legitimidade e limites$c$,
  aplicacao_pratica = $a$Permite que intervenha, em todos os termos da ação pública, como assistente do Ministério Público, o ofendido ou seu representante legal ou, na falta, qualquer das pessoas mencionadas no art. 31. Os limites estão nos artigos seguintes: o assistente é admitido enquanto não passar em julgado a sentença e recebe a causa no estado em que se achar (art. 269); o corréu não pode ser assistente (art. 270); o Ministério Público é ouvido previamente sobre a admissão (art. 272); e do despacho que admitir ou não o assistente não cabe recurso (art. 273).$a$
where codigo='cpp' and numero=268 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Suspeição estendida aos peritos$c$,
  aplicacao_pratica = $a$Estende aos peritos, no que for aplicável, o disposto sobre a suspeição dos juízes. A arguição pelas partes está prevista no art. 105, que também alcança intérpretes e serventuários, decidindo o juiz de plano e sem recurso. Os intérpretes são equiparados aos peritos para todos os efeitos (art. 281), e o art. 274 faz a mesma extensão aos serventuários e funcionários da justiça.$a$
where codigo='cpp' and numero=280 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Perda da fiança por não apresentação para cumprir a pena$c$,
  aplicacao_pratica = $a$Considera perdido, na totalidade, o valor da fiança se, condenado, o acusado não se apresentar para o início do cumprimento da pena definitivamente imposta. Perdida a fiança, o valor, deduzidas as custas e demais encargos, é recolhido ao fundo penitenciário (art. 345). No quebramento da fiança, o destino do valor restante segue o art. 346.$a$
where codigo='cpp' and numero=344 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Quebramento da fiança: destino do valor$c$,
  aplicacao_pratica = $a$No quebramento da fiança, feitas as deduções do art. 345, o valor restante é recolhido ao fundo penitenciário, na forma da lei. Difere da perda do art. 344, que ocorre quando o condenado não se apresenta para cumprir a pena. Se o julgamento que declarou quebrada a fiança for reformado, ela subsiste em todos os seus efeitos (art. 342).$a$
where codigo='cpp' and numero=346 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Fiança: devolução do saldo$c$,
  aplicacao_pratica = $a$Não ocorrendo a hipótese do art. 345 (perda da fiança), o saldo é entregue a quem a houver prestado, depois de deduzidos os encargos a que o réu estiver obrigado. Se a fiança foi prestada por meio de hipoteca, a execução é promovida no juízo cível pelo Ministério Público (art. 348).$a$
where codigo='cpp' and numero=347 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Citação por precatória$c$,
  aplicacao_pratica = $a$Quando o réu está fora do território da jurisdição do juiz processante, a citação é feita mediante precatória. Contrasta com o art. 351, pelo qual a citação inicial é feita por mandado se o réu está no território sujeito à jurisdição do juiz que a ordenou. Havendo urgência, a precatória pode ser expedida por via telegráfica (art. 356).$a$
where codigo='cpp' and numero=353 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Interdições: execução após o trânsito em julgado$c$,
  aplicacao_pratica = $a$Transitando em julgado a sentença condenatória, são executadas somente as interdições nela aplicadas ou que derivarem da imposição da pena principal. Antes disso, o despacho que aplicar provisoriamente, substituir ou revogar interdição de direito deve ser fundamentado (art. 375), e a decisão que impronunciar ou absolver o réu faz cessar a aplicação provisória (art. 376).$a$
where codigo='cpp' and numero=377 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Prazo da primeira fase do Júri$c$,
  aplicacao_pratica = $a$Fixa em 90 dias o prazo máximo para concluir o procedimento da primeira fase do Júri. Nesse procedimento, a resposta não apresentada no prazo legal leva à nomeação de defensor, que a oferece em até 10 dias (art. 408); o Ministério Público ou o querelante se manifesta sobre preliminares e documentos em 5 dias (art. 409); e a inquirição das testemunhas e as diligências requeridas são determinadas no prazo máximo de 10 dias (art. 410).$a$
where codigo='cpp' and numero=412 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Assistente no Júri: habilitação$c$,
  aplicacao_pratica = $a$Condiciona a admissão do assistente à habilitação requerida até 5 dias antes da data da sessão na qual pretenda atuar. A legitimidade e as demais regras da assistência estão nos arts. 268 a 273, como a admissão enquanto não passar em julgado a sentença (art. 269) e a oitiva prévia do Ministério Público (art. 272).$a$
where codigo='cpp' and numero=430 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Dispensa do jurado por decisão motivada$c$,
  aplicacao_pratica = $a$Determina que o jurado somente seja dispensado por decisão motivada do juiz presidente, consignada na ata dos trabalhos. A escusa só é aceita se fundada em motivo relevante comprovado e apresentada até a chamada dos jurados, salvo força maior (art. 443), e os casos de isenção e dispensa e o pedido de adiamento são decididos até a abertura dos trabalhos da sessão (art. 454).$a$
where codigo='cpp' and numero=444 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;
