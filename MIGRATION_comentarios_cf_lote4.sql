-- CF lote 4: arts. 131 a 144, 09/10/2026
-- Comentários didáticos (contexto e aplicacao_pratica) de CF, redigidos só a partir do texto dos artigos no banco.
-- Sem jurisprudência ou doutrina. Só atualiza onde aplicacao_pratica está vazia ou tem menos de 200 caracteres. Sem begin/commit.

-- BLOCO 1
update legislacao set
  contexto = $c$Advocacia-Geral da União$c$,
  aplicacao_pratica = $a$Define a Advocacia-Geral da União como a instituição que, diretamente ou através de órgão vinculado, representa a União, judicial e extrajudicialmente, e exerce as atividades de consultoria e assessoramento jurídico do Poder Executivo, nos termos de lei complementar. O § 1º trata da chefia pelo Advogado-Geral da União, de livre nomeação pelo Presidente da República, o § 2º do ingresso nas classes iniciais das carreiras e o § 3º da representação da União, pela Procuradoria-Geral da Fazenda Nacional, na execução da dívida ativa de natureza tributária.$a$
where codigo='cf' and numero=131 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Procuradores dos Estados e do Distrito Federal$c$,
  aplicacao_pratica = $a$Atribui aos Procuradores dos Estados e do Distrito Federal, organizados em carreira com ingresso por concurso público de provas e títulos e participação da Ordem dos Advogados do Brasil em todas as suas fases, a representação judicial e a consultoria jurídica das respectivas unidades federadas. O parágrafo único trata da estabilidade após três anos de efetivo exercício.$a$
where codigo='cf' and numero=132 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Advogado: indispensável à administração da justiça$c$,
  aplicacao_pratica = $a$Declara o advogado indispensável à administração da justiça e inviolável por seus atos e manifestações no exercício da profissão, nos limites da lei.$a$
where codigo='cf' and numero=133 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Defensoria Pública$c$,
  aplicacao_pratica = $a$Define a Defensoria Pública como instituição permanente, essencial à função jurisdicional do Estado, incumbida da orientação jurídica, da promoção dos direitos humanos e da defesa, em todos os graus, judicial e extrajudicial, dos direitos individuais e coletivos, de forma integral e gratuita, aos necessitados, na forma do art. 5º, LXXIV. O § 1º remete a lei complementar a organização da Defensoria Pública da União, do Distrito Federal e dos Territórios, os §§ 2º e 3º asseguram autonomia funcional e administrativa e iniciativa de proposta orçamentária às Defensorias Públicas e o § 4º enuncia seus princípios institucionais: unidade, indivisibilidade e independência funcional.$a$
where codigo='cf' and numero=134 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Remuneração das carreiras jurídicas$c$,
  aplicacao_pratica = $a$Determina que os servidores das carreiras disciplinadas nas Seções II e III do Capítulo sejam remunerados na forma do art. 39, § 4º.$a$
where codigo='cf' and numero=135 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 2
update legislacao set
  contexto = $c$Estado de defesa$c$,
  aplicacao_pratica = $a$Permite ao Presidente da República, ouvidos o Conselho da República e o Conselho de Defesa Nacional, decretar estado de defesa para preservar ou prontamente restabelecer, em locais restritos e determinados, a ordem pública ou a paz social ameaçadas por grave e iminente instabilidade institucional ou atingidas por calamidades de grandes proporções na natureza. O § 1º trata do conteúdo do decreto, o § 2º limita a duração a trinta dias, prorrogável uma vez por igual período, o § 3º lista as medidas na vigência do estado de defesa, e os §§ 4º a 7º tratam do controle pelo Congresso Nacional, inclusive a cessação imediata do estado de defesa se o decreto for rejeitado.$a$
where codigo='cf' and numero=136 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Solicitação de estado de sítio$c$,
  aplicacao_pratica = $a$Permite ao Presidente da República, ouvidos o Conselho da República e o Conselho de Defesa Nacional, solicitar ao Congresso Nacional autorização para decretar o estado de sítio em duas hipóteses: comoção grave de repercussão nacional ou fatos que comprovem a ineficácia de medida tomada durante o estado de defesa (I), e declaração de estado de guerra ou resposta a agressão armada estrangeira (II). O parágrafo único exige que o Presidente relate os motivos determinantes do pedido e que o Congresso Nacional decida por maioria absoluta.$a$
where codigo='cf' and numero=137 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Decreto do estado de sítio$c$,
  aplicacao_pratica = $a$Exige que o decreto do estado de sítio indique sua duração, as normas necessárias a sua execução e as garantias constitucionais que ficarão suspensas, e que o Presidente da República designe o executor das medidas específicas e as áreas abrangidas, depois de publicado o decreto. O § 1º limita o estado de sítio do art. 137, I, a trinta dias, sem prorrogação por prazo superior a cada vez, enquanto o do inciso II pode durar todo o tempo da guerra ou da agressão armada estrangeira. O § 2º trata do recesso parlamentar e o § 3º determina que o Congresso Nacional permaneça em funcionamento até o término das medidas coercitivas.$a$
where codigo='cf' and numero=138 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Medidas no estado de sítio$c$,
  aplicacao_pratica = $a$Limita, na vigência do estado de sítio decretado com fundamento no art. 137, I, as medidas contra as pessoas às seguintes: obrigação de permanência em localidade determinada (I), detenção em edifício não destinado a acusados ou condenados por crimes comuns (II), restrições relativas à inviolabilidade da correspondência, ao sigilo das comunicações, à prestação de informações e à liberdade de imprensa, radiodifusão e televisão, na forma da lei (III), suspensão da liberdade de reunião (IV), busca e apreensão em domicílio (V), intervenção nas empresas de serviços públicos (VI) e requisição de bens (VII). O parágrafo único exclui das restrições do inciso III a difusão de pronunciamentos de parlamentares em suas Casas, desde que liberada pela respectiva Mesa.$a$
where codigo='cf' and numero=139 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Fiscalização das medidas excepcionais$c$,
  aplicacao_pratica = $a$Atribui à Mesa do Congresso Nacional, ouvidos os líderes partidários, a designação de Comissão composta de cinco de seus membros para acompanhar e fiscalizar a execução das medidas referentes ao estado de defesa e ao estado de sítio.$a$
where codigo='cf' and numero=140 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

-- BLOCO 3
update legislacao set
  contexto = $c$Cessação do estado de defesa e do estado de sítio$c$,
  aplicacao_pratica = $a$Determina que, cessado o estado de defesa ou o estado de sítio, cessem também seus efeitos, sem prejuízo da responsabilidade pelos ilícitos cometidos por seus executores ou agentes. O parágrafo único trata das medidas aplicadas em sua vigência, que serão relatadas pelo Presidente da República em mensagem ao Congresso Nacional.$a$
where codigo='cf' and numero=141 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Forças Armadas$c$,
  aplicacao_pratica = $a$Define as Forças Armadas, constituídas pela Marinha, pelo Exército e pela Aeronáutica, como instituições nacionais permanentes e regulares, organizadas com base na hierarquia e na disciplina, sob a autoridade suprema do Presidente da República, destinadas à defesa da Pátria, à garantia dos poderes constitucionais e, por iniciativa de qualquer destes, da lei e da ordem. O § 1º remete a lei complementar as normas gerais de organização, o § 2º veda habeas corpus em relação a punições disciplinares militares e o § 3º trata do regime dos militares.$a$
where codigo='cf' and numero=142 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Serviço militar obrigatório$c$,
  aplicacao_pratica = $a$Estabelece que o serviço militar é obrigatório nos termos da lei. O § 1º atribui às Forças Armadas, na forma da lei, o serviço alternativo aos que, em tempo de paz, alegarem imperativo de consciência, e o § 2º isenta as mulheres e os eclesiásticos do serviço militar obrigatório em tempo de paz, sujeitos a outros encargos que a lei lhes atribuir.$a$
where codigo='cf' and numero=143 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;

update legislacao set
  contexto = $c$Segurança pública$c$,
  aplicacao_pratica = $a$Define a segurança pública como dever do Estado, direito e responsabilidade de todos, exercida para a preservação da ordem pública e da incolumidade das pessoas e do patrimônio, por meio dos órgãos dos incisos I a VI: polícia federal, polícia rodoviária federal, polícia ferroviária federal, polícias civis, polícias militares e corpos de bombeiros militares, e polícias penais federal, estaduais e distrital. Os parágrafos tratam das atribuições de cada órgão (§§ 1º a 5º-A), das forças auxiliares (§ 6º), da lei de organização (§ 7º), das guardas municipais (§ 8º), da remuneração dos policiais (§ 9º) e da segurança viária (§ 10).$a$
where codigo='cf' and numero=144 and coalesce(titulo,'')='' and inciso is null and paragrafo is null and coalesce(length(aplicacao_pratica),0)<200;
