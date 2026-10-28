-- 28/10/2026: conferência de entradas públicas com a tag "conferir inteiro teor" (fontes consultadas em 28/10/2026).
-- Rodar no SQL Editor (o conector cancela UPDATE). Cada bloco é independente.

-- Súmula 323/STJ: a redação atual foi aprovada em 25/11/2009 (DJe 16/12/2009); o DJ de 05/12/2005 é do verbete original.
-- Fonte: portal de súmulas do STJ (scon.stj.jus.br, súmula 323) e notícia do TJCE de 27/11/2009 sobre a nova redação.
update entradas set
  fonte = 'STJ, Segunda Seção, redação atual aprovada em 25/11/2009, DJe 16/12/2009 (verbete original publicado no DJ de 05/12/2005)',
  tags = array_remove(tags, 'conferir inteiro teor')
where id = '3d6a6db7-27ce-44e1-af4f-52ee48a47c18';

-- Súmula 297/STJ: Segunda Seção, 12/05/2004, DJ 08/09/2004 (portal de súmulas do STJ). Confere com a fonte gravada.
update entradas set tags = array_remove(tags, 'conferir inteiro teor') where id = '2efd6914-a887-4aed-a2ee-01edfb7e9950';

-- Súmula 597/STJ: Segunda Seção, 08/11/2017, DJe 20/11/2017 (portal de súmulas do STJ). Confere com a fonte gravada.
update entradas set tags = array_remove(tags, 'conferir inteiro teor') where id = '0bfb4a49-b3d1-4fc0-8983-369f6cc83313';

-- REsp 2.209.868: notícia oficial do STJ de 15/07/2026 (Terceira Turma, unanimidade, Rel. Min. Humberto Martins). A página
-- não traz a data do julgamento (o link do acórdão indica publicação em 24/06/2026): "maio/2026" não foi confirmado e saiu.
-- A tag "conferir inteiro teor" permanece até haver a data do julgamento.
update entradas set
  fonte = 'STJ, Terceira Turma, unanimidade (data do julgamento a confirmar no acórdão, publicado em 24/06/2026); notícia do STJ de 15/07/2026',
  referencia = 'REsp 2.209.868, Rel. Min. Humberto Martins, Terceira Turma (conferir data de julgamento e inteiro teor no portal do STJ)',
  url = 'https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/15072026-Sem-transacoes-incompativeis-com-perfil-de-cliente--banco-nao-responde-por-golpe-da-falsa-central.aspx'
where id = 'c9cf09e0-05a7-4c5c-9836-2b9967ff4fc8';

-- Súmulas 385, 404, 548 e 565/STJ: datas de julgamento e publicação conferem com a fonte gravada em fontes secundárias
-- (385: PDF do TJBA reproduzindo o STJ, 27/05/2009, DJe 08/06/2009; 404: Damásio, aprovada em 28/10/2009, publicada em 24/11/2009;
-- 548: Damásio, 14/10/2015, 19/10/2015; 565: Damásio, 24/02/2016, 29/02/2016). Autorizado pela Jessica em 28/10/2026.
update entradas set tags = array_remove(tags, 'conferir inteiro teor')
where id in ('1f74f597-372d-402a-b95e-29bfc531804c','5cf67907-babb-4877-a244-93ba4def4350',
             '03129996-c557-49dc-9737-574bf29f932b','b98d4a5b-a830-4237-85be-d34b62f35b32');

-- Conferência (esperado: 8 súmulas sem a tag; restam 10 entradas públicas com a tag):
-- select count(*) from entradas where publica and 'conferir inteiro teor' = any(tags);
