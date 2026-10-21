-- Povoamento de legislacao_versao e alerta inicial (21/10/2026). Contagem de linhas calculada na hora da carga.
insert into public.legislacao_versao (codigo, nome, url_compilado, termos, n_linhas, observacao)
select v.codigo, v.nome, v.url, v.termos, (select count(*) from public.legislacao l where l.codigo=v.codigo), v.obs
from (values
 ('cf','Constituição Federal','https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',array['Constituição Federal','Constituição da República'],'Alterada só por Emenda Constitucional. A página única da CF é longa e o resumo automático a trunca: não usar para detectar mudança.'),
 ('adct','ADCT',null,array['Ato das Disposições Constitucionais Transitórias'],'Alterado só por Emenda Constitucional; o texto compilado do ADCT fica em página própria.'),
 ('cc','Código Civil',null,array['Lei nº 10.406','Código Civil'],'Padrão de referência da Jessica: alterar só com autorização expressa.'),
 ('cdc','Código de Defesa do Consumidor','https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm',array['Lei nº 8.078','Código de Defesa do Consumidor'],'Padrão de referência da Jessica: alterar só com autorização expressa.'),
 ('cp','Código Penal','https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm',array['Decreto-Lei nº 2.848','Código Penal'],'Padrão de referência da Jessica. "Código Penal Militar" na ementa é falso positivo.'),
 ('cpc','Código de Processo Civil',null,array['Lei nº 13.105','Código de Processo Civil'],'Padrão de referência da Jessica: alterar só com autorização expressa.'),
 ('cpp','Código de Processo Penal','https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm',array['Decreto-Lei nº 3.689','Código de Processo Penal'],null),
 ('ctb','Código de Trânsito Brasileiro','https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm',array['Lei nº 9.503','Código de Trânsito Brasileiro'],null),
 ('lep','Lei de Execução Penal','https://www.planalto.gov.br/ccivil_03/leis/l7210compilado.htm',array['Lei nº 7.210','Lei de Execução Penal'],null),
 ('lei9099','Lei dos Juizados Especiais',null,array['Lei nº 9.099','Juizados Especiais'],'Padrão de referência da Jessica: alterar só com autorização expressa.'),
 ('lei8906','Estatuto da Advocacia e da OAB',null,array['Lei nº 8.906','Estatuto da Advocacia'],'Sem comentário por decisão da Jessica; está no banco por causa do app de questões.'),
 ('cedoab','Código de Ética e Disciplina da OAB',null,array[]::text[],'Fonte é a OAB, não o Planalto: fora do monitoramento automático.')
) as v(codigo,nome,url,termos,obs);
insert into public.legislacao_alertas (tipo, numero, data_norma, ementa, codigos, url, status, observacao) values
('ec','141','16/10/2026','Altera o art. 7º da Constituição Federal para reduzir a duração máxima semanal do trabalho e prever 2 dias de repouso semanal remunerado, sem redução salarial (segundo a página oficial; resumo automático, texto literal ainda não conferido).',array['cf'],'https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc141.htm','pendente','Detectada em 21/10/2026. Banco com art. 7º, XIII e XV na redação anterior. Vigência escalonada: aguardar o texto compilado com as anotações do Planalto antes de gravar. Não gravar a partir de resumo.');
-- Reversão: delete from public.legislacao_alertas where tipo='ec' and numero='141'; delete from public.legislacao_versao;
