-- CPC art. 1.063: redação dada pela Lei 14.976/2024 (vigente); inclui comentário. Aplicado em 09/10/2026.
update legislacao set vigente = true,
 contexto = $c$Juizados especiais: competência mantida$c$,
 aplicacao_pratica = $a$Mantém a competência dos juizados especiais cíveis da Lei nº 9.099/1995 para processar e julgar as causas previstas no inciso II do art. 275 do Código de Processo Civil de 1973. A Lei nº 14.976/2024 deu nova redação ao dispositivo e suprimiu a expressão "Até a edição de lei específica", que constava da redação anterior.$a$
where codigo='cpc' and numero=1063 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and vigente = false;
