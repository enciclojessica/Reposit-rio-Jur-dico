-- Padronização do índice de Assuntos e dos temas (21/10/2026), sem travessão e sem tag em formato de slug.
-- 1) Tags de assunto: hífen entre palavras vira espaço, acentos restaurados, tudo minúsculo.
--    Mantidas: tags técnicas de origem (pesquisa-juri, extraído-de-peça, auto-importado, usadas pelo código) e os
--    compostos legítimos (binômio necessidade-possibilidade, trinômio proporcionalidade-possibilidade-necessidade).
with m(velha, nova) as (values
 ('agencia-de-viagem','agência de viagem'),
 ('ALERTA-dano-coletivo-nao-individual','alerta dano coletivo não individual'),
 ('cadeia-de-fornecimento','cadeia de fornecimento'),
 ('cobranca-indevida','cobrança indevida'),
 ('conferir-inteiro-teor','conferir inteiro teor'),
 ('culpa-concorrente','culpa concorrente'),
 ('dano-moral','dano moral'),
 ('desvio-produtivo','desvio produtivo'),
 ('fortuito-interno','fortuito interno'),
 ('inadimplemento-contratual','inadimplemento contratual'),
 ('intermediacao','intermediação'),
 ('legitimidade-passiva','legitimidade passiva'),
 ('locacao-de-veiculo','locação de veículo'),
 ('mero-dissabor','mero dissabor'),
 ('negativacao','negativação'),
 ('plano-de-saude','plano de saúde'),
 ('precedente-contrário','precedente contrário'),
 ('tema-repetitivo','tema repetitivo'),
 ('tempo-util','tempo útil'))
update entradas e set tags = (
  select array_agg(distinct coalesce(m.nova, t)) from unnest(e.tags) t left join m on m.velha = t)
where exists (select 1 from unnest(e.tags) t join m on m.velha = t);
-- 18 entradas atualizadas. Observação: array_agg(distinct) reordena as tags de cada entrada em ordem alfabética.

-- 2) Temas: "Assunto — subtema" e "Assunto - subtema" viram "Assunto: subtema" (13 entradas, primeiro separador apenas).
update entradas set tema = regexp_replace(tema, '\s+[—–-]\s+', ': ') where tema ~ '[—–]| - ';

-- Reversão: usar a tabela m ao contrário para as tags (nova -> velha); para os temas não há reversão automática
-- (o separador original, travessão ou hífen, não foi guardado).
