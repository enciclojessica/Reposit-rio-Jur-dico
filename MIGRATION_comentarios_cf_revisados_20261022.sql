-- Revisão dos comentários marcados "em revisão" (CF 7, 40, 198 e 201), 22/10/2026.
-- Só a partir do texto dos dispositivos no banco; sem jurisprudência ou doutrina.
-- Reversão: restaurar aplicacao_pratica com os textos anteriores (ver git) e comentario_revisar = true.

update legislacao set
  aplicacao_pratica = aplicacao_pratica || ' O § 1º (antigo parágrafo único) estende aos trabalhadores domésticos os direitos que enumera. O § 2º admite que convenção ou acordo coletivo estabeleça, excepcionalmente, regime compensatório que assegure, na média, 2 dias de repouso semanal remunerado dentro do mês-calendário, e o § 3º remete à lei as hipóteses e condições de regimes diferenciados de duração do trabalho e de repouso semanal, respeitados os limites dos incisos XIII, XIV e XV.',
  comentario_revisar = false
where codigo = 'cf' and numero = 7 and paragrafo is null and inciso is null and titulo is null;

update legislacao set
  aplicacao_pratica = aplicacao_pratica || ' O § 4º veda requisitos ou critérios diferenciados para concessão de benefícios no regime próprio, ressalvados os §§ 4º-A, 4º-B, 4º-C, 5º e 5º-A, e o § 5º-A fixa a idade de 57 anos (mulher) e 60 anos (homem) para o agente comunitário de saúde e o agente de combate às endemias que comprovem 25 anos de contribuição e de efetivo exercício na atividade.',
  comentario_revisar = false
where codigo = 'cf' and numero = 40 and paragrafo is null and inciso is null and titulo is null;

update legislacao set
  aplicacao_pratica = replace(aplicacao_pratica,
    'e participação da comunidade (III).',
    'e participação da comunidade (III), mais a atuação obrigatória e permanente dos agentes comunitários de saúde e dos agentes de combate às endemias, cuja atividade é essencial ao sistema único de saúde e exclusiva de Estado (IV).'),
  comentario_revisar = false
where codigo = 'cf' and numero = 198 and paragrafo is null and inciso is null and titulo is null;

update legislacao set
  aplicacao_pratica = aplicacao_pratica || ' O § 4º-A veda a contratação temporária ou terceirizada desses agentes, salvo emergência em saúde pública, na forma da lei; o § 4º-B os submete ao regime jurídico dos servidores de cargo efetivo; e o § 10 lhes assegura aposentadoria com requisitos diferenciados (art. 40, § 5º-A, e art. 201, § 8º-A) e adicional de insalubridade.',
  comentario_revisar = false
where codigo = 'cf' and numero = 198 and paragrafo is null and inciso is null and titulo is null;

update legislacao set
  aplicacao_pratica = aplicacao_pratica || ' O § 8º-A fixa o requisito de idade do § 7º, I, em 57 anos (mulher) e 60 anos (homem) para o agente comunitário de saúde e o agente de combate às endemias que comprovem 25 anos de contribuição e de efetivo exercício na atividade.',
  comentario_revisar = false
where codigo = 'cf' and numero = 201 and paragrafo is null and inciso is null and titulo is null;
