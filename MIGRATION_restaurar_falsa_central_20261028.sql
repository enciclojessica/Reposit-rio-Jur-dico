-- 28/10/2026: restaura a entrada "Golpe da falsa central: responsabilidade do banco não é automática" (REsp 2.209.868, STJ)
-- que existia só em entradas_bkp_20261021. Entra com publica = false (data do julgamento e inteiro teor a conferir).
insert into entradas (id, area, tipo, tema, fonte, referencia, url, teses, tags, status, publica)
select id, 'Consumidor', 'jurisprudência', tema, fonte, referencia, url, teses, tags, status, false
from entradas_bkp_20261021 where id = 'c9cf09e0-05a7-4c5c-9836-2b9967ff4fc8'
on conflict (id) do nothing;
-- Reversão: delete from entradas where id = 'c9cf09e0-05a7-4c5c-9836-2b9967ff4fc8';
-- Depois da conferência: update entradas set publica = true where id = 'c9cf09e0-05a7-4c5c-9836-2b9967ff4fc8';
