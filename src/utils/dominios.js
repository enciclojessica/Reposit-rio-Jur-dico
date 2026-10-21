// Normaliza o que a administradora digita no campo "Domínios com aprovação automática".
// Aceita "unisantos.br", "@unisantos.br", "fulano@unisantos.br" e "https://unisantos.br/"; devolve o domínio em
// minúsculas ou null se não parecer um domínio. A correspondência no banco é exata (sem subdomínio nem sufixo),
// então "alunos.unisantos.br" é um domínio à parte de "unisantos.br".
const DOMINIO = /^(?=.{3,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/

export function normalizarDominio(entrada) {
  if (typeof entrada !== 'string') return null
  let s = entrada.trim().toLowerCase()
  s = s.replace(/^[a-z]+:\/\//, '')
  s = s.split(/[/?#]/)[0]
  if (s.includes('@')) s = s.slice(s.lastIndexOf('@') + 1)
  s = s.replace(/\.+$/, '')
  return DOMINIO.test(s) ? s : null
}
