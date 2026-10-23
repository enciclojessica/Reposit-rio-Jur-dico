# Pipeline automático de comentários da legislação (Aplicação prática e Comentário didático)

Decisão da Jessica (23/10/2026): a revisão não passa por ela. Meta: acurácia medida acima de 88%. O pipeline roda sozinho (tarefa agendada ou sessão
manual) e só grava o que passa em todos os portões. Escopo: caputs vigentes de códigos que ainda não têm selo em `legislacao.comentario_conferencia`.
**Fora do pipeline, sempre:** cc, cdc, cp, cpc, lei9099 (só com erro comprovado, com autorização dela), lei8906 e cedoab (sem comentário por decisão dela).

## Fila e unidade de trabalho
- Unidade: o caput (linha com `paragrafo` e `inciso` nulos, `vigente`) mais os filhos do mesmo artigo (mesmo `codigo`, `numero`, `titulo`).
  Artigo com letra: `numero` inteiro e `titulo = 'Art. 18-A'`; artigo comum: `titulo` nulo (casar com `coalesce(titulo,'')`).
- Fila: `select codigo, count(*) from legislacao where paragrafo is null and inciso is null and vigente and comentario_conferencia is null and codigo not in ('cc','cdc','cp','cpc','lei9099','lei8906','cedoab') group by 1`. Ordem de cobertura: lep, cpp, cf, ctb, adct, clt, depois códigos novos. Lotes de até 55 artigos.
- Caput revogado/vetado não recebe comentário. Artigo que só registra revogação: o comentário apenas registra.

## Etapas (nenhuma é manual)
1. **Redação** (agente redator, um por faixa de artigos): lê o caput e os filhos no banco e escreve `contexto` (Comentário didático, já existente nos códigos antigos; para código novo, escrever os dois) e `aplicacao_pratica` (orientação de uso: o que conferir, como usar na peça, o que provar). Base: só o texto do artigo e dos filhos + raciocínio jurídico geral. **Proibido** jurisprudência, súmula, doutrina, remissão ou rótulo que não conste do texto, nome de instituto que o texto não traz.
2. **Checagem automática** (`scripts/comentarios/checagem.py`): reprova números, prazos, percentuais, siglas, datas e artigos citados que não estejam no texto do artigo e dos filhos, travessões, emojis, "no banco", marcadores de jurisprudência/doutrina, comentário curto demais ou que repete o caput. Reprovado volta ao redator com a lista de motivos.
3. **Revisão independente A e B** (dois agentes diferentes, que não viram a redação): cada um classifica cada comentário em CORRETO, IMPRECISO ou ERRADO, aponta trecho fora do texto (NENHUM, PRUDENTE, ARRISCADO) e se é genérico (só parafraseia o caput). Só passa se **os dois** derem CORRETO, sem ARRISCADO e sem genérico.
4. **Correção e nova revisão**: itens que não passaram voltam ao redator com os apontamentos; os itens alterados passam de novo pelos dois revisores. No máximo 2 rodadas. Quem não passar fica **sem comentário** (não se grava texto reprovado) e entra no relatório.
5. **Gravação**: `update` em blocos pequenos (o conector cancela escrita grande), `comentario_resultado = 'aprovado'` se o texto passou na primeira rodada sem ajuste, `'corrigido'` se foi ajustado; `comentario_conferencia = 'revisao_independente'`, `comentario_conferido_em = current_date`. Sempre gravar texto e selo no mesmo UPDATE (o gatilho zera o selo se só o texto mudar). Conferir por SELECT: 0 vazios, 0 travessões.
6. **Auditoria cega**: `scripts/comentarios/amostra.py` sorteia 10% (mínimo 12) dos caputs gravados; um terceiro agente, sem ver redação nem revisões, reclassifica. Acurácia auditada = CORRETO / amostra. **Se ficar abaixo de 88%**: não seguir para o próximo código, registrar no CLAUDE.md e avisar a Jessica (notificação e relatório). Se passar, registrar o número.
7. **Registro**: `MIGRATION_aplicacao_pratica_<codigo>_<data>.sql` (com cabeçalho: contagens, taxa de primeira passagem, taxa auditada, reversão), atualização do CLAUDE.md (uma linha por código), branch `claude/aplicacao-pratica-<codigo>`, `npx vitest run` e `npx vite build` se houver código, push e `main` só se o `main` não mudou.

## Métricas a registrar por código
- Primeira passagem: caputs aprovados por A e B na 1ª rodada / total.
- Publicados: caputs gravados / total; não publicados listados.
- Auditada: resultado da etapa 6.

## Erros recorrentes das revisões de CTN e Lei 15.040 (o redator deve evitá-los)
1. Transformar hipótese lícita em exclusividade ("só pode", "o rol não deve ser ampliado", "a lei apenas autoriza esta via") quando o texto só diz "é lícito", "caberá".
2. Trocar dever por faculdade (ou o inverso): "o juiz determinará" não é "autoriza o juiz".
3. Inventar hierarquia, ordem, direção ou critério de comparação que o texto não fixa.
4. Distribuir ônus da prova ("cabe ao contribuinte provar", "a seguradora deve provar") quando o texto não o faz. Usar "convém juntar/demonstrar" como orientação, nunca como regra.
5. Omitir ressalva de parágrafo ou inciso que muda a regra (ex.: exceção do § 6º, condição do § 5º, "nos termos da legislação específica"), apresentando a regra como absoluta.
6. Misturar alíneas ou incisos, ou atribuir a todos o qualificador de um só; contar mal os itens ("quatro itens" para cinco).
7. Remissão errada ou posição errada de artigo ("nos artigos seguintes" quando é anterior) e nome de instituto que o texto não traz.
8. Descrever "Vide", suspensão, inconstitucionalidade ou revogação como resultado: só registrar a anotação, sem afirmar efeito; não usar o passado ("tratava") nem "não vigente" sem o texto dizer.
9. Trocar o termo do texto por sinônimo que muda o sentido (suspensão x exclusão de exigibilidade, resgate x compensação, ciente x comunicada, intermediários x corretores).
10. Genericidade: parafrasear o caput e os filhos sem orientação. Cada Aplicação prática deve dizer o que conferir no caso, como usar na peça e o que juntar ou demonstrar, apoiado no texto.
11. Inverter quem invoca o artigo (utilidade para o contribuinte x para a Fazenda) sem apoio no texto.
12. Frases de consequência não trazidas pelo texto ("a quitação não afasta, por si, a penalidade").

Formato: sem travessões (usar vírgula, parênteses ou dois-pontos), sem emojis, sem a expressão "no banco" nem "Capítulo"/"Seção" do banco, sem "nos termos do parágrafo" como substituto de conteúdo; filho truncado na consulta é consultado de novo, não resumido de memória. Norma de organização, transitória ou de efeito exaurido: o comentário apenas registra o conteúdo.
