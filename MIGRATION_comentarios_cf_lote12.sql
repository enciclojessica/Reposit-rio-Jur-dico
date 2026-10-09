-- CF lote 12: arts. 198 a 205 (8 caputs), 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Sistema único de saúde$c$,
  aplicacao_pratica = $a$Determina que as ações e serviços públicos de saúde integrem uma rede regionalizada e hierarquizada e constituam um sistema único, organizado conforme as diretrizes de descentralização, com direção única em cada esfera de governo (I), atendimento integral, com prioridade para as atividades preventivas (II) e participação da comunidade (III). O § 1º trata do financiamento do sistema, nos termos do art. 195, o § 2º da aplicação anual mínima de recursos pelos entes federativos, o § 3º da lei complementar que a regulamenta e os §§ 4º a 15 dos agentes comunitários de saúde e de combate às endemias, dos pisos salariais e da assistência financeira complementar da União.$a$
where codigo='cf' and numero=198 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Assistência à saúde pela iniciativa privada$c$,
  aplicacao_pratica = $a$Declara livre à iniciativa privada a assistência à saúde. O § 1º permite que as instituições privadas participem de forma complementar do sistema único de saúde, o § 2º veda a destinação de recursos públicos para auxílios ou subvenções às instituições privadas com fins lucrativos, o § 3º veda a participação direta ou indireta de empresas ou capitais estrangeiros na assistência à saúde, salvo nos casos previstos em lei, e o § 4º remete à lei as condições para a remoção de órgãos, tecidos e substâncias humanas para fins de transplante, pesquisa e tratamento, bem como a coleta, processamento e transfusão de sangue e derivados, vedado todo tipo de comercialização.$a$
where codigo='cf' and numero=199 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Competências do sistema único de saúde$c$,
  aplicacao_pratica = $a$Atribui ao sistema único de saúde, além de outras atribuições, nos termos da lei: controlar e fiscalizar procedimentos, produtos e substâncias de interesse para a saúde (I), executar as ações de vigilância sanitária e epidemiológica e de saúde do trabalhador (II), ordenar a formação de recursos humanos na área de saúde (III), participar da formulação da política e da execução das ações de saneamento básico (IV), incrementar o desenvolvimento científico e tecnológico e a inovação (V), fiscalizar e inspecionar alimentos (VI), participar do controle e fiscalização da produção, transporte, guarda e utilização de substâncias e produtos psicoativos, tóxicos e radioativos (VII) e colaborar na proteção do meio ambiente, nele compreendido o do trabalho (VIII).$a$
where codigo='cf' and numero=200 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Regime Geral de Previdência Social$c$,
  aplicacao_pratica = $a$Organiza a previdência social sob a forma do Regime Geral de Previdência Social, de caráter contributivo e de filiação obrigatória, observados critérios que preservem o equilíbrio financeiro e atuarial, atendendo, na forma da lei, à cobertura dos eventos de incapacidade temporária ou permanente para o trabalho e idade avançada (I), à proteção à maternidade, especialmente à gestante (II), à proteção ao trabalhador em situação de desemprego involuntário (III), ao salário-família e auxílio-reclusão para os dependentes dos segurados de baixa renda (IV) e à pensão por morte do segurado, ao cônjuge ou companheiro e dependentes (V). Os parágrafos tratam, entre outros pontos, da vedação de requisitos diferenciados (§ 1º), do piso dos benefícios (§ 2º), do reajustamento (§ 4º), da aposentadoria (§§ 7º a 9º-A), do sistema especial de inclusão previdenciária (§§ 12 e 13), da vedação de tempo de contribuição fictício (§ 14) e da acumulação de benefícios (§ 15).$a$
where codigo='cf' and numero=201 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Previdência privada complementar$c$,
  aplicacao_pratica = $a$Estabelece que o regime de previdência privada, de caráter complementar e organizado de forma autônoma em relação ao regime geral de previdência social, seja facultativo, baseado na constituição de reservas que garantam o benefício contratado, e regulado por lei complementar. O § 1º trata dos direitos do participante de planos de benefícios, o § 2º das contribuições do empregador e dos benefícios, o § 3º veda o aporte de recursos a entidade de previdência privada pelos entes públicos, o § 4º trata da relação entre os entes públicos e suas entidades fechadas, o § 5º das empresas privadas permissionárias ou concessionárias de serviços públicos e o § 6º dos requisitos para designação dos membros das diretorias.$a$
where codigo='cf' and numero=202 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Assistência social$c$,
  aplicacao_pratica = $a$Determina que a assistência social seja prestada a quem dela necessitar, independentemente de contribuição à seguridade social, com os objetivos de proteção à família, à maternidade, à infância, à adolescência e à velhice (I), amparo às crianças e adolescentes carentes (II), promoção da integração ao mercado de trabalho (III), habilitação e reabilitação das pessoas com deficiência e promoção de sua integração à vida comunitária (IV), garantia de um salário mínimo de benefício mensal à pessoa com deficiência e ao idoso que comprovem não possuir meios de prover a própria manutenção (V) e redução da vulnerabilidade socioeconômica de famílias em situação de pobreza ou de extrema pobreza (VI).$a$
where codigo='cf' and numero=203 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Financiamento e diretrizes da assistência social$c$,
  aplicacao_pratica = $a$Determina que as ações governamentais na área da assistência social sejam realizadas com recursos do orçamento da seguridade social, previstos no art. 195, além de outras fontes, e organizadas com base nas diretrizes de descentralização político-administrativa (I) e participação da população, por meio de organizações representativas, na formulação das políticas e no controle das ações em todos os níveis (II). O parágrafo único faculta aos Estados e ao Distrito Federal vincular a programa de apoio à inclusão e promoção social até cinco décimos por cento de sua receita tributária líquida, vedada a aplicação desses recursos em despesas com pessoal e encargos sociais, serviço da dívida e qualquer outra despesa corrente não vinculada diretamente aos investimentos ou ações apoiados.$a$
where codigo='cf' and numero=204 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Direito à educação$c$,
  aplicacao_pratica = $a$Declara a educação direito de todos e dever do Estado e da família, a ser promovida e incentivada com a colaboração da sociedade, visando ao pleno desenvolvimento da pessoa, seu preparo para o exercício da cidadania e sua qualificação para o trabalho.$a$
where codigo='cf' and numero=205 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
