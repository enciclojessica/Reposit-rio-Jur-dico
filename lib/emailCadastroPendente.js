// Monta o e-mail enviado à curadoria quando alguém se cadastra e fica aguardando aprovação.
// Os dados vêm do cadastro feito pela própria pessoa, então tudo é escapado antes de entrar no HTML.
export function escaparHtml(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function montarEmailCadastroPendente({ nome, email, telefone }, url = 'https://themisjur.com.br') {
  const linha = (rotulo, valor) =>
    `<tr><td style="padding:4px 14px 4px 0;color:#736b62;font-size:13px">${rotulo}</td><td style="padding:4px 0;color:#2a2118;font-size:14px">${escaparHtml(valor) || 'Não informado'}</td></tr>`
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#fdfbf7;font-family:Inter,Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4ddd0;border-radius:10px;padding:28px">
<div style="font-family:Georgia,serif;font-size:22px;color:#800020;margin-bottom:14px">Novo cadastro aguardando aprovação</div>
<table style="border-collapse:collapse;margin-bottom:18px">${linha('Nome', nome)}${linha('E-mail', email)}${linha('Telefone', telefone)}</table>
<div style="font-size:13px;color:#736b62;line-height:1.6;margin-bottom:18px">Cadastros com e-mail de domínio aprovado são liberados sozinhos. Este ficou pendente: abra a tela Membros, em "Aguardando aprovação", e escolha Aprovar ou Recusar.</div>
<a href="${escaparHtml(url)}" style="display:inline-block;background:#8f6d27;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:11px 24px;border-radius:6px">Abrir o Themis Jur</a>
</div></body></html>`
}
