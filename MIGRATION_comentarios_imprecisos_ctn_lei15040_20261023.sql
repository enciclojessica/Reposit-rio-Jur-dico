-- Correcao de 10 comentarios imprecisos apontados pela revisao independente de 23/10/2026 (CTN e Lei 15.040).
-- Somente aplicacao_pratica; so a partir do texto no banco. Autorizado pela Jessica em 23/10/2026.
-- Aplicada em 23/10/2026. Reversao: cada replace/concatenacao e invertivel trocando novo por antigo (os trechos antigos terminavam em 'nos termos do parágrafo.', 'nos termos dos incisos.' ou 'nos termos da tabela do dispositivo').
-- Conferencia feita por SELECT: 10 de 10 com o trecho novo, 0 travessoes, 0 remissoes 'nos termos do parágrafo' restantes nesses artigos.

-- CTN art. 9
update legislacao set aplicacao_pratica = replace(aplicacao_pratica,
 'entidades religiosas e templos de qualquer culto, patrimônio, renda ou serviços dos partidos políticos, das entidades sindicais dos trabalhadores, das instituições de educação e de assistência social sem fins lucrativos, e papel destinado',
 'entidades religiosas e templos de qualquer culto, inclusive suas organizações assistenciais e beneficentes, patrimônio, renda ou serviços dos partidos políticos, inclusive suas fundações, das entidades sindicais dos trabalhadores, das instituições de educação e de assistência social sem fins lucrativos, observados os requisitos fixados na Seção II deste Capítulo, e papel destinado')
where codigo='ctn' and numero=9 and paragrafo is null and inciso is null and vigente;

-- CTN art. 18-A
update legislacao set aplicacao_pratica = aplicacao_pratica || ' O inciso III do parágrafo único consta como revogado pela Lei Complementar n. 201, de 2023, e não integra o texto vigente.'
where codigo='ctn' and numero=18 and titulo='Art. 18-A' and paragrafo is null and inciso is null and vigente and aplicacao_pratica not like '%201, de 2023%';

-- CTN art. 35
update legislacao set aplicacao_pratica = aplicacao_pratica || ' O parágrafo único consta como revogado, também pela Lei Complementar n. 227, de 2026.'
where codigo='ctn' and numero=35 and coalesce(titulo,'')='' and paragrafo is null and inciso is null and vigente and aplicacao_pratica not like '%parágrafo único consta como revogado%';

-- CTN art. 38
update legislacao set aplicacao_pratica = replace(replace(aplicacao_pratica,
 'trata da divulgação, pelas administrações tributárias dos Municípios e do Distrito Federal, dos critérios usados',
 'dispõe que as administrações tributárias dos Municípios e do Distrito Federal deverão divulgar os critérios usados'),
 'em procedimento específico, nos termos do parágrafo.',
 'em procedimento específico, nos termos da legislação específica municipal ou distrital.')
where codigo='ctn' and numero=38 and paragrafo is null and inciso is null and vigente;

-- CTN art. 82-A
update legislacao set aplicacao_pratica = replace(aplicacao_pratica,
 '(inciso II), nos termos dos incisos.',
 '(inciso II). O inciso I abrange a aquisição, a implementação, a instalação, a expansão, a manutenção, a operação, a gestão e o desenvolvimento dos projetos, dos equipamentos, das tecnologias, dos serviços e dos ativos destinados à prestação de serviços relativos à rede de iluminação pública, temporária ou permanente, com o objetivo de prover iluminância em vias, logradouros públicos e equipamentos públicos comunitários e urbanos, em qualquer área do território municipal ou distrital. O inciso II abrange a aquisição, a implementação, a instalação, a expansão, a manutenção, a operação, a gestão e o desenvolvimento dos projetos, dos sistemas, das tecnologias, dos meios de transmissão da informação, da infraestrutura e dos equipamentos destinados ao monitoramento para administração, controle, segurança, preservação e prevenção a desastres em vias, logradouros públicos e equipamentos públicos comunitários e urbanos, em qualquer área do território municipal ou distrital, incluídos os ativos necessários ao funcionamento de centros integrados de operação e controle e à integração de sistemas de gestão de monitoramento pela administração pública.')
where codigo='ctn' and numero=82 and titulo='Art. 82-A' and paragrafo is null and inciso is null and vigente;

-- CTN art. 91
update legislacao set aplicacao_pratica = replace(replace(replace(aplicacao_pratica,
 'fator representativo da população (alínea a, nos termos da tabela do dispositivo)',
 'fator representativo da população (alínea a: percentual da população do Município em relação à do conjunto das Capitais, com fator 2 até 2%; de mais de 2% até 5%, fator 2 pelos primeiros 2% e mais 0,5 a cada 0,5% ou fração excedente; e fator 5 acima de 5%)'),
 'O § 2º trata da distribuição da parcela do inciso II por coeficiente',
 'O § 2º trata da distribuição da parcela do inciso II, deduzido o percentual referido no art. 3º do Decreto-lei que estabelece a redação do parágrafo (com a anotação "Vide Lei Complementar n. 91, de 1997"), por coeficiente'),
 '(alíneas a a e, nos termos da tabela do dispositivo)',
 '(alíneas a a e: coeficiente de 0,6 pelos primeiros 10.188 habitantes na faixa até 16.980, de 1,0 pelos primeiros 16.980 na faixa acima de 16.980 até 50.940, de 2,0 pelos primeiros 50.940 na faixa acima de 50.940 até 101.880, de 3,0 pelos primeiros 101.880 na faixa acima de 101.880 até 156.216 e de 4,0 acima de 156.216, com acréscimo de 0,2 para cada 3.396, 6.792, 10.188 e 13.584 habitantes ou fração excedente nas alíneas a a d, respectivamente)')
where codigo='ctn' and numero=91 and paragrafo is null and inciso is null and vigente;

-- CTN art. 151
update legislacao set aplicacao_pratica = replace(replace(aplicacao_pratica,
 'até a sua eventual dissolução (inciso IX)',
 'até a sua eventual dissolução, nos termos da legislação específica (inciso IX)'),
 'a aceitação, pelo credor, de apólice de seguro garantia ou de carta de fiança bancária oferecidas em execução fiscal, enquanto',
 'a aceitação, pelo credor, nos termos da regulamentação estabelecida pelos órgãos de cobrança judicial dos créditos tributários, de apólice de seguro garantia ou de carta de fiança bancária oferecidas em execução fiscal, inclusive quando convencionadas por meio de negócio jurídico processual, enquanto')
where codigo='ctn' and numero=151 and paragrafo is null and inciso is null and vigente;

-- CTN art. 194-A
update legislacao set aplicacao_pratica = replace(aplicacao_pratica,
 'acerca de precedentes e da legislação tributária e aduaneira, nos termos do parágrafo.',
 'acerca de precedentes, judiciais e administrativos, e da legislação tributária e aduaneira, tais como o aprimoramento e a ampliação dos sistemas internos de controle de informações, em especial com relação aos dados que refletem o contencioso tributário e aduaneiro e a efetividade das medidas adotadas para a arrecadação, sem prejuízo do disposto no § 2º.')
where codigo='ctn' and numero=194 and titulo='Art. 194-A' and paragrafo is null and inciso is null and vigente;

-- Lei 15.040 art. 21
update legislacao set aplicacao_pratica = replace(aplicacao_pratica,
 'contados da notificação do inadimplemento, nos termos do parágrafo.',
 'contados da notificação do inadimplemento, da qual deve constar a advertência de que, se houver abstenção nessa escolha, a decisão caberá à seguradora.')
where codigo='lei15040' and numero=21 and paragrafo is null and inciso is null and vigente;

-- Lei 15.040 art. 48
update legislacao set aplicacao_pratica = replace(aplicacao_pratica,
 'constantes da proposta, nos termos do parágrafo.',
 'constantes da proposta, prevalecendo, quando mencionado na proposta o número do processo administrativo, o clausulado correspondente cuja vigência abranja a época da contratação do seguro, ou o mais favorável ao segurado, caso haja diversos clausulados depositados para o mesmo ramo e modalidade de seguro e não exista menção específica a nenhum deles na proposta.')
where codigo='lei15040' and numero=48 and paragrafo is null and inciso is null and vigente;
