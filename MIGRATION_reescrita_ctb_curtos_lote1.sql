-- Reescrita de comentarios curtos do CTB, lote 1 (guardado por length(aplicacao_pratica)<200)
-- Reescrita de comentários curtos de CTB no padrão aprovado em 09/10/2026: só onde há função ou distinção verificada no texto do banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Condutor: domínio do veículo e atenção$c$,
  aplicacao_pratica = $a$Impõe ao condutor o domínio do veículo a todo momento, com a atenção e os cuidados indispensáveis à segurança do trânsito. A infração correspondente à falta de atenção ou de cuidados indispensáveis é a do art. 169.$a$
where codigo='ctb' and numero=28 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Ultrapassagem: proibição nas interseções$c$,
  aplicacao_pratica = $a$Proíbe a ultrapassagem nas interseções e em suas proximidades. Soma-se aos locais do art. 32 (curvas, aclives sem visibilidade, passagens de nível, pontes, viadutos e travessias de pedestres). A infração por ultrapassar em interseções e passagens de nível está no art. 202.$a$
where codigo='ctb' and numero=33 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Frenagem brusca: ressalva de segurança$c$,
  aplicacao_pratica = $a$Veda frear bruscamente o veículo, salvo por razões de segurança. A ressalva delimita o que é frenagem lícita: a frenagem brusca só é admitida quando motivada pela segurança.$a$
where codigo='ctb' and numero=42 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Publicidade sobre a sinalização$c$,
  aplicacao_pratica = $a$Proíbe afixar, sobre a sinalização de trânsito e seus suportes ou junto a ambos, publicidade, inscrições, legendas e símbolos que não se relacionem com a mensagem da sinalização. Distingue-se do art. 83, que trata da publicidade ao longo das vias e a condiciona à aprovação prévia do órgão com circunscrição sobre a via.$a$
where codigo='ctb' and numero=82 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Publicidade ao longo das vias: aprovação prévia$c$,
  aplicacao_pratica = $a$Condiciona a afixação de publicidade, legendas ou símbolos ao longo das vias à aprovação prévia do órgão ou entidade com circunscrição sobre a via. Distingue-se do art. 82, que proíbe qualquer afixação sobre a sinalização, seus suportes ou junto a eles, quando não relacionada à mensagem da sinalização.$a$
where codigo='ctb' and numero=83 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Limites de lotação e peso fixados pelo fabricante$c$,
  aplicacao_pratica = $a$Proíbe circular com lotação, peso bruto total ou peso por eixo acima do fixado pelo fabricante, ou acima da capacidade máxima de tração da unidade tratora. Distingue-se do art. 99, cujo parâmetro são os limites de peso e dimensões do CONTRAN, e do art. 101, que permite autorização especial para carga fora desses limites.$a$
where codigo='ctb' and numero=100 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Infração: falta de sinalização antecipada$c$,
  aplicacao_pratica = $a$Define como infração grave, com multa, deixar de indicar com antecedência, por gesto regulamentar de braço ou luz indicadora de direção, o início da marcha, a parada, a mudança de direção ou de faixa. Corresponde ao dever de sinalização antes de deslocamento lateral do art. 35.$a$
where codigo='ctb' and numero=196 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Infração: ultrapassagem em local proibido$c$,
  aplicacao_pratica = $a$Define como infração gravíssima, com multa (cinco vezes), ultrapassar outro veículo pelo acostamento ou em interseções e passagens de nível. Corresponde às proibições de ultrapassagem dos arts. 32 (passagens de nível) e 33 (interseções).$a$
where codigo='ctb' and numero=202 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Infração: conversão sem espera no acostamento$c$,
  aplicacao_pratica = $a$Define como infração grave, com multa, deixar de parar no acostamento à direita para aguardar oportunidade de cruzar a pista ou entrar à esquerda, onde não houver local apropriado para retorno. Corresponde à conduta exigida pelo art. 37 nas vias com acostamento.$a$
where codigo='ctb' and numero=204 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Infração: ingresso em área lindeira sem cautela$c$,
  aplicacao_pratica = $a$Define como infração média, com multa, entrar ou sair de áreas lindeiras sem estar adequadamente posicionado e sem as precauções com pedestres e outros veículos. Corresponde aos deveres dos arts. 36 (preferência a quem já transita pela via) e 38 (posicionamento antes de entrar em lotes lindeiros).$a$
where codigo='ctb' and numero=216 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Infração: luz alta em via iluminada$c$,
  aplicacao_pratica = $a$Define como infração leve, com multa, fazer uso do facho de luz alta em vias providas de iluminação pública. Distingue-se do art. 223, que exige que o facho perturbe a visão de outro condutor (ou o farol esteja desregulado); aqui basta o uso em via com iluminação pública.$a$
where codigo='ctb' and numero=224 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;

update legislacao set
  contexto = $c$Infração: falta de documentos de porte obrigatório$c$,
  aplicacao_pratica = $a$Define como infração leve, com multa e retenção do veículo até a apresentação do documento, conduzir veículo sem os documentos de porte obrigatório previstos no Código. Entre eles está o Certificado de Licenciamento Anual, cujo porte o art. 133 torna obrigatório.$a$
where codigo='ctb' and numero=232 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and length(aplicacao_pratica)<200;
