// Conteúdo dos Termos de Uso e da Política de Privacidade, estruturado em
// seções pra renderização em PaginaLegal.jsx. São minutas de trabalho —
// campos como e-mail de contato e foro ainda precisam ser preenchidos
// pela usuária antes de considerar o texto definitivo.

export const TERMOS_DE_USO = {
  titulo: 'Termos de Uso',
  atualizadoEm: null, // preencher na publicação
  secoes: [
    {
      titulo: '1. O que é o Themis Jur',
      corpo: `O Themis Jur é um repositório curado de jurisprudência, doutrina e legislação, organizado por área do direito, com ferramentas de busca, anotação pessoal, geração de fichamentos e apoio à elaboração de peças processuais.

O conteúdo disponibilizado tem finalidade de apoio à pesquisa e ao estudo jurídico. Não constitui parecer jurídico, aconselhamento legal ou substituto da análise técnica de um profissional habilitado sobre o caso concreto do usuário. A responsabilidade pela adequação de qualquer tese, citação ou peça ao caso concreto é exclusivamente do usuário.`,
    },
    {
      titulo: '2. Cadastro e acesso',
      corpo: `O acesso à plataforma hoje é restrito e ocorre por convite, enviado por um administrador. Não há cadastro público aberto no momento.

Ao aceitar um convite, o usuário cria uma conta vinculada a e-mail e senha (ou login via provedor externo, como Google), e passa a integrar a plataforma com um dos seguintes papéis: leitor, editor ou administrador, conforme definido no convite.

O usuário é responsável por manter a confidencialidade de suas credenciais de acesso e por toda atividade realizada em sua conta.

O Themis Jur pode revogar o acesso de qualquer usuário a seu exclusivo critério, especialmente em caso de violação destes Termos.`,
    },
    {
      titulo: '3. Uso permitido',
      corpo: `O usuário pode consultar, anotar, favoritar, exportar (fichamento, citação ABNT, documentos Word) e utilizar o conteúdo do repositório para sua prática profissional ou estudo pessoal.

É vedado: redistribuir, revender ou disponibilizar publicamente, no todo ou em parte, o conteúdo curado da plataforma sem autorização; utilizar scraping, automação ou qualquer meio técnico para extração massiva do conteúdo; utilizar o conteúdo para treinar, alimentar ou desenvolver outros sistemas de inteligência artificial; compartilhar credenciais de acesso com terceiros não convidados; utilizar a plataforma para fins ilícitos ou que violem direitos de terceiros.`,
    },
    {
      titulo: '4. Propriedade intelectual',
      corpo: `Textos de lei, jurisprudência e ementas oficiais são de domínio público ou de titularidade dos respectivos tribunais e órgãos — o Themis Jur não reivindica propriedade sobre esse conteúdo bruto.

A curadoria, organização, comentários didáticos, aplicações práticas e a estrutura do repositório são de titularidade do Themis Jur e protegidos como obra intelectual.

Conteúdo inserido pelo próprio usuário (anotações pessoais, rascunhos de peças) permanece de sua titularidade; o Themis Jur apenas o armazena para viabilizar o serviço.`,
    },
    {
      titulo: '5. Recursos com inteligência artificial',
      corpo: `Alguns recursos (busca assistida, sugestão de conteúdo, extração de dados de petições) utilizam modelos de inteligência artificial de terceiros para processar o texto submetido pelo usuário. Esses recursos são auxiliares e sujeitos a erro — o usuário deve sempre revisar e confirmar qualquer sugestão gerada por IA antes de utilizá-la. O acesso a alguns desses recursos pode ser condicionado a plano pago, conforme indicado na plataforma.`,
    },
    {
      titulo: '6. Planos e cobrança',
      corpo: `O acesso à plataforma pode ser gratuito ou pago, conforme definido para cada usuário. Eventuais condições de cobrança, quando aplicáveis, serão informadas previamente ao usuário.`,
    },
    {
      titulo: '7. Limitação de responsabilidade',
      corpo: `O Themis Jur envida esforços para manter a acurácia e atualização do conteúdo, mas não garante que o repositório está livre de erros, desatualizações ou omissões. O usuário deve sempre confirmar a redação vigente de leis e o estado atual de precedentes junto às fontes oficiais antes de utilizá-los em peça processual.

O Themis Jur não se responsabiliza por decisões tomadas com base no conteúdo da plataforma, nem por indisponibilidades temporárias do serviço.`,
    },
    {
      titulo: '8. Alterações destes Termos',
      corpo: `Estes Termos podem ser atualizados. Alterações relevantes serão comunicadas aos usuários com antecedência razoável.`,
    },
    {
      titulo: '9. Foro e lei aplicável',
      corpo: `Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de [a definir] para dirimir eventuais controvérsias, ressalvada disposição legal em contrário.`,
    },
    {
      titulo: '10. Contato',
      corpo: `Dúvidas sobre estes Termos podem ser enviadas para [e-mail de contato a definir].`,
    },
  ],
}

export const POLITICA_PRIVACIDADE = {
  titulo: 'Política de Privacidade',
  atualizadoEm: null,
  secoes: [
    {
      titulo: '1. Controladora',
      corpo: `Jessica Farias Fusquiani, na qualidade de titular e curadora do Themis Jur, é a controladora dos dados pessoais tratados na plataforma.`,
    },
    {
      titulo: '2. Quais dados coletamos',
      corpo: `Dados de cadastro: nome e e-mail (fornecidos no cadastro ou obtidos via login social, quando utilizado); foto de perfil (se fornecida via login social); número e UF de inscrição na OAB (opcional, fornecido pelo próprio usuário para inserção automática em documentos exportados).

Dados de uso da plataforma: anotações pessoais feitas em entradas do repositório; entradas marcadas como favoritas; rascunhos de peças processuais elaborados no Editor; alertas de monitoramento configurados; histórico de entradas cadastradas ou editadas por membros com permissão de edição.

Dados técnicos: registros de acesso (data, hora, endereço IP), coletados automaticamente pela infraestrutura de hospedagem; cookies de sessão, necessários para manter o usuário autenticado.

O Themis Jur não coleta dados sensíveis (saúde, origem racial, convicção religiosa etc.) para fins próprios da plataforma. Caso o usuário insira esse tipo de informação em peças processuais ou anotações — o que pode ser necessário no exercício da advocacia —, ela é tratada com a mesma confidencialidade dos demais dados do usuário, sob sua exclusiva responsabilidade quanto ao conteúdo inserido.`,
    },
    {
      titulo: '3. Para que usamos esses dados',
      corpo: `Autenticar o usuário e controlar seu nível de acesso (leitor, editor, administrador); viabilizar funcionalidades pessoais (anotações, favoritos, rascunhos, alertas); inserir automaticamente dados de OAB em documentos exportados, quando o usuário preencher essa informação; enviar e-mails de alerta sobre novidades nos temas monitorados pelo usuário, quando habilitado; melhorar a plataforma e diagnosticar problemas técnicos.

Não utilizamos os dados pessoais do usuário para publicidade ou para venda a terceiros.`,
    },
    {
      titulo: '4. Com quem compartilhamos dados',
      corpo: `Para operar a plataforma, utilizamos os seguintes prestadores de serviço (operadores, nos termos da LGPD), que têm acesso aos dados estritamente na medida necessária à prestação do serviço contratado:

Supabase — hospedagem do banco de dados e autenticação. Vercel — hospedagem da aplicação web. Resend — envio de e-mails transacionais e de alerta. Anthropic — processamento de texto nos recursos que usam inteligência artificial (busca assistida, extração de petições).

Não compartilhamos dados pessoais com terceiros para finalidades próprias desses terceiros.`,
    },
    {
      titulo: '5. Por quanto tempo guardamos os dados',
      corpo: `Os dados são mantidos enquanto a conta do usuário estiver ativa. Após a exclusão de uma conta ou a revogação de acesso, os dados pessoais associados podem ser mantidos por período adicional quando exigido por obrigação legal, ou removidos mediante solicitação do titular, nos termos do art. 18 da LGPD.`,
    },
    {
      titulo: '6. Direitos do titular',
      corpo: `Nos termos da LGPD, o usuário pode, a qualquer momento: confirmar a existência de tratamento e acessar seus dados; corrigir dados incompletos, inexatos ou desatualizados; solicitar a exclusão de seus dados pessoais, ressalvadas hipóteses de guarda obrigatória por lei; solicitar a portabilidade de seus dados a outro fornecedor de serviço; revogar consentimento, quando aplicável.

A plataforma já oferece, na tela de Configurações, exportação dos próprios dados (entradas, anotações, rascunhos e demais dados vinculados à conta) em formato aberto (JSON). Solicitações adicionais podem ser feitas para [e-mail de contato a definir].`,
    },
    {
      titulo: '7. Segurança',
      corpo: `Os dados são protegidos por controle de acesso por linha (Row Level Security) no banco de dados, de modo que cada usuário só acessa os dados pessoais que lhe pertencem (anotações, favoritos, rascunhos). O tráfego entre o navegador e os servidores é criptografado (HTTPS).`,
    },
    {
      titulo: '8. Alterações desta Política',
      corpo: `Esta Política pode ser atualizada para refletir mudanças na plataforma ou na legislação aplicável. Alterações relevantes serão comunicadas aos usuários.`,
    },
    {
      titulo: '9. Contato',
      corpo: `Para exercer os direitos descritos nesta Política ou esclarecer dúvidas sobre o tratamento de dados, entre em contato pelo e-mail [a definir].`,
    },
  ],
}
