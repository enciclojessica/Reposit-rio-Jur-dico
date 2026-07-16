// Biblioteca de modelos (esqueletos estruturais) de peças processuais.
// Contém apenas estrutura e placeholders — nenhuma jurisprudência, doutrina
// ou citação é fabricada aqui, em conformidade com o rigor de fonte
// primária da plataforma. O preenchimento de fundamentação, teses e
// precedentes continua vindo do Repositório via Editor.

export const CATEGORIAS_MODELO = ['Cível', 'JEC', 'Trabalhista', 'Penal']

export const MODELOS_PECAS = [
  {
    id: 'peticao-inicial-ordinario',
    categoria: 'Cível',
    titulo: 'Petição Inicial — Rito Ordinário (CPC)',
    rito: 'Rito Ordinário — CPC',
    descricao: 'Estrutura padrão de petição inicial cível: endereçamento, qualificação, fatos, direito, pedidos e valor da causa.',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [X] VARA CÍVEL DA COMARCA DE [COMARCA/UF]

[NOME DO AUTOR], [nacionalidade], [estado civil], [profissão], portador(a) do RG nº [XXX] e inscrito(a) no CPF sob o nº [XXX], residente e domiciliado(a) em [endereço completo], por seu(sua) advogado(a) que esta subscreve (procuração anexa), vem, respeitosamente, à presença de Vossa Excelência, propor a presente

AÇÃO [NATUREZA DA AÇÃO]

em face de [NOME DO RÉU], [qualificação completa], pelos fatos e fundamentos jurídicos a seguir expostos.

## I — DOS FATOS

[Narrativa objetiva e cronológica dos fatos relevantes ao caso.]

## II — DO DIREITO

[Fundamentação jurídica. Utilize o Editor (busca de teses ao lado) para inserir precedentes e dispositivos legais do Repositório.]

## III — DA TUTELA DE URGÊNCIA (se cabível)

[Demonstração de probabilidade do direito e perigo de dano ou risco ao resultado útil do processo, nos termos do art. 300 do CPC.]

## IV — DOS PEDIDOS

Diante do exposto, requer-se:

a) [citação do(a) réu(ré) para, querendo, apresentar contestação];
b) [pedido principal];
c) a condenação do(a) réu(ré) ao pagamento das custas processuais e honorários advocatícios;
d) [demais pedidos].

## V — DAS PROVAS

Protesta provar o alegado por todos os meios de prova em direito admitidos, notadamente [documental, testemunhal, pericial].

Dá-se à causa o valor de R$ [XXX].

Termos em que,
Pede deferimento.

[Cidade], [data].

[Nome do(a) advogado(a)]
OAB/[UF] nº [XXX]`,
  },
  {
    id: 'contestacao',
    categoria: 'Cível',
    titulo: 'Contestação',
    rito: 'Rito Ordinário — CPC',
    descricao: 'Estrutura padrão de contestação: preliminares, mérito e pedidos.',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [X] VARA CÍVEL DA COMARCA DE [COMARCA/UF]

Processo nº [XXX]

[NOME DO RÉU], já qualificado(a) nos autos da ação em epígrafe movida por [NOME DO AUTOR], por seu(sua) advogado(a) que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, apresentar

CONTESTAÇÃO

pelos fatos e fundamentos a seguir expostos.

## I — DAS PRELIMINARES (se houver)

[Ex: inépcia da inicial, ilegitimidade de parte, prescrição/decadência, etc.]

## II — DOS FATOS

[Versão do(a) réu(ré) sobre os fatos narrados na inicial, com impugnação específica.]

## III — DO DIREITO

[Fundamentação jurídica. Utilize o Editor para inserir precedentes e dispositivos legais do Repositório.]

## IV — DOS PEDIDOS

Diante do exposto, requer-se:

a) [o acolhimento das preliminares e a extinção do processo sem resolução de mérito, se for o caso];
b) subsidiariamente, a total improcedência dos pedidos formulados na inicial;
c) a condenação do(a) autor(a) ao pagamento das custas processuais e honorários advocatícios.

## V — DAS PROVAS

Protesta provar o alegado por todos os meios de prova em direito admitidos.

Termos em que,
Pede deferimento.

[Cidade], [data].

[Nome do(a) advogado(a)]
OAB/[UF] nº [XXX]`,
  },
  {
    id: 'peticao-inicial-jec',
    categoria: 'JEC',
    titulo: 'Petição Inicial — JEC (Lei 9.099/95)',
    rito: 'JEC — Lei 9.099/95',
    descricao: 'Petição inicial simplificada para o Juizado Especial Cível, linguagem direta conforme o rito.',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE [COMARCA/UF]

[NOME DO AUTOR], [qualificação completa], vem propor a presente

AÇÃO [NATUREZA DA AÇÃO]

em face de [NOME DO RÉU], [qualificação completa], com fundamento na Lei nº 9.099/95, pelos fatos e fundamentos a seguir expostos.

## I — DOS FATOS

[Narrativa objetiva dos fatos.]

## II — DO DIREITO

[Fundamentação jurídica direta. Utilize o Editor para inserir teses do Repositório.]

## III — DOS PEDIDOS

Requer-se:

a) a citação do(a) réu(ré) para comparecer à audiência de conciliação;
b) [pedido principal — indenização, obrigação de fazer, etc.];
c) a condenação do(a) réu(ré) ao pagamento do valor pleiteado.

## IV — DAS PROVAS

Protesta provar o alegado por todos os meios de prova admitidos, especialmente [documental/testemunhal].

Dá-se à causa o valor de R$ [XXX].

Termos em que,
Pede deferimento.

[Cidade], [data].

[Nome do(a) advogado(a), se houver — dispensável até 20 salários mínimos]
OAB/[UF] nº [XXX]`,
  },
  {
    id: 'recurso-inominado',
    categoria: 'JEC',
    titulo: 'Recurso Inominado (JEC)',
    rito: 'JEC — Lei 9.099/95',
    descricao: 'Recurso contra sentença no Juizado Especial Cível, dirigido à Turma Recursal.',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [X] VARA DO JUIZADO ESPECIAL CÍVEL DA COMARCA DE [COMARCA/UF]

(para posterior remessa à Turma Recursal)

Processo nº [XXX]

[NOME DO RECORRENTE], já qualificado(a) nos autos, não se conformando com a r. sentença de fls. [XXX], vem, tempestivamente, interpor o presente

RECURSO INOMINADO

com fundamento no art. 41 da Lei nº 9.099/95, pelas razões a seguir expostas, requerendo o recebimento e processamento do recurso, com posterior remessa à Egrégia Turma Recursal.

## I — DA TEMPESTIVIDADE

[Demonstração do prazo de 10 dias contado da ciência da sentença.]

## II — DA SÍNTESE DA SENTENÇA RECORRIDA

[Resumo objetivo dos fundamentos da sentença que se recorre.]

## III — DAS RAZÕES DE REFORMA

[Fundamentação jurídica dos pontos de discordância. Utilize o Editor para inserir precedentes do Repositório.]

## IV — DO PEDIDO

Diante do exposto, requer-se o conhecimento e provimento do presente recurso, para o fim de [reformar/anular] a r. sentença recorrida, [especificar o resultado pretendido].

Termos em que,
Pede deferimento.

[Cidade], [data].

[Nome do(a) advogado(a)]
OAB/[UF] nº [XXX]`,
  },
  {
    id: 'apelacao-civel',
    categoria: 'Cível',
    titulo: 'Apelação Cível',
    rito: 'Rito Ordinário — CPC',
    descricao: 'Recurso de apelação contra sentença de primeiro grau, com preparo e razões recursais.',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [X] VARA CÍVEL DA COMARCA DE [COMARCA/UF]

Processo nº [XXX]

[NOME DO APELANTE], já qualificado(a) nos autos, não se conformando com a r. sentença de fls. [XXX], vem, tempestivamente, interpor o presente

RECURSO DE APELAÇÃO

com fundamento no art. 1.009 e seguintes do CPC, requerendo o recebimento e o encaminhamento ao Egrégio Tribunal de Justiça, pelas razões a seguir expostas.

## I — DA TEMPESTIVIDADE E DO PREPARO

[Demonstração do prazo de 15 dias úteis e comprovante de recolhimento das custas recursais.]

## II — DA SÍNTESE DO PROCESSO E DA SENTENÇA RECORRIDA

[Resumo objetivo da lide e dos fundamentos da sentença recorrida.]

## III — DAS RAZÕES DE REFORMA

[Fundamentação jurídica dos pontos de discordância. Utilize o Editor para inserir precedentes do Repositório.]

## IV — DO PEDIDO

Diante do exposto, requer-se o conhecimento e provimento do presente recurso, para o fim de [reformar/anular] a r. sentença recorrida, [especificar o resultado pretendido], com a consequente condenação do(a) apelado(a) ao pagamento das custas e honorários recursais.

Termos em que,
Pede deferimento.

[Cidade], [data].

[Nome do(a) advogado(a)]
OAB/[UF] nº [XXX]`,
  },
  {
    id: 'reclamacao-trabalhista',
    categoria: 'Trabalhista',
    titulo: 'Reclamação Trabalhista',
    rito: 'Rito Sumaríssimo — CLT',
    descricao: 'Petição inicial trabalhista, com pedidos e valor da causa conforme o rito sumaríssimo.',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA [X] VARA DO TRABALHO DE [CIDADE/UF]

[NOME DO(A) RECLAMANTE], [qualificação completa], por seu(sua) advogado(a) que esta subscreve, vem propor a presente

RECLAMAÇÃO TRABALHISTA

em face de [NOME DO(A) RECLAMADO(A)], [qualificação completa/razão social e CNPJ], pelos fatos e fundamentos a seguir expostos.

## I — DOS FATOS

[Narrativa do contrato de trabalho: admissão, função, jornada, remuneração, data e motivo da rescisão.]

## II — DO DIREITO

[Fundamentação jurídica de cada verba/pedido. Utilize o Editor para inserir precedentes e dispositivos legais do Repositório.]

## III — DOS PEDIDOS

Requer-se a citação do(a) reclamado(a) e, ao final, a procedência dos pedidos, condenando-o(a) ao pagamento de:

a) [verbas rescisórias em aberto];
b) [horas extras e reflexos];
c) [demais pedidos];
d) honorários advocatícios sucumbenciais.

Dá-se à causa o valor de R$ [XXX].

Termos em que,
Pede deferimento.

[Cidade], [data].

[Nome do(a) advogado(a)]
OAB/[UF] nº [XXX]`,
  },
  {
    id: 'resposta-acusacao',
    categoria: 'Penal',
    titulo: 'Resposta à Acusação',
    rito: 'Ação Penal Pública',
    descricao: 'Defesa técnica preliminar prevista no art. 396-A do CPP.',
    conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA [X] VARA CRIMINAL DA COMARCA DE [COMARCA/UF]

Processo nº [XXX]

[NOME DO(A) ACUSADO(A)], já qualificado(a) nos autos da ação penal em epígrafe, por seu(sua) advogado(a) que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, apresentar

RESPOSTA À ACUSAÇÃO

nos termos do art. 396-A do Código de Processo Penal, pelos fundamentos a seguir expostos.

## I — DAS PRELIMINARES (se houver)

[Ex: nulidades, questões processuais que devam ser decididas antes do mérito.]

## II — DA SÍNTESE DA ACUSAÇÃO

[Resumo objetivo dos fatos narrados na denúncia/queixa.]

## III — DAS RAZÕES DE DEFESA

[Fundamentação jurídica e fática da defesa. Utilize o Editor para inserir precedentes do Repositório.]

## IV — DAS PROVAS E TESTEMUNHAS

Requer-se a produção das seguintes provas: [especificar], arrolando desde já as seguintes testemunhas: [nomes e qualificação].

## V — DO PEDIDO

Diante do exposto, requer-se [a absolvição sumária, nos termos do art. 397 do CPP / o regular prosseguimento do feito com a produção das provas requeridas].

Termos em que,
Pede deferimento.

[Cidade], [data].

[Nome do(a) advogado(a)]
OAB/[UF] nº [XXX]`,
  },
]
