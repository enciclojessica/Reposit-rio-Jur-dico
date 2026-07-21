// Backup semanal do banco: exporta as tabelas críticas para JSON e envia
// para o bucket privado "backups-db" no Supabase Storage.
//
// Executado pelo GitHub Action .github/workflows/backup.yml (schedule semanal)
// ou manualmente com: node scripts/backup-db.mjs
//
// Requer as variáveis de ambiente:
//   SUPABASE_URL              - URL do projeto (ex: https://wedfgqigtyrsrmmxsmuo.supabase.co)
//   SUPABASE_SERVICE_ROLE_KEY - chave service_role (NUNCA a anon key; precisa
//                                ignorar RLS pra ler tudo). Fica só em GitHub
//                                Secrets, nunca no código nem no navegador.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltam SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Tabelas com dados que não podem ser recriados (exclui logs/cache irrelevantes).
const TABELAS = [
  'entradas',
  'membros',
  'convites',
  'alertas',
  'notificacoes',
  'radar_resultados',
  'flashcards',
  'oab_questoes',
  'oab_respostas',
  'oab_sessoes',
  'oab_favoritas',
  'material_estudo',
]

async function exportarTabela(nome) {
  const linhas = []
  const PAGE = 1000
  let from = 0
  while (true) {
    const { data, error } = await supabase.from(nome).select('*').range(from, from + PAGE - 1)
    if (error) throw new Error(`Erro ao exportar ${nome}: ${error.message}`)
    linhas.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return linhas
}

async function main() {
  const dump = { gerado_em: new Date().toISOString(), tabelas: {} }
  let totalLinhas = 0

  for (const tabela of TABELAS) {
    const linhas = await exportarTabela(tabela)
    dump.tabelas[tabela] = linhas
    totalLinhas += linhas.length
    console.log(`  ${tabela}: ${linhas.length} linha(s)`)
  }

  const dataArquivo = dump.gerado_em.slice(0, 10) // YYYY-MM-DD
  const caminho = `${dataArquivo}/backup-${dump.gerado_em.replace(/[:.]/g, '-')}.json`
  const conteudo = JSON.stringify(dump, null, 2)

  const { error: uploadError } = await supabase.storage
    .from('backups-db')
    .upload(caminho, new Blob([conteudo], { type: 'application/json' }), {
      contentType: 'application/json',
      upsert: false,
    })

  if (uploadError) throw new Error(`Erro ao enviar backup: ${uploadError.message}`)

  console.log(`\nBackup enviado: backups-db/${caminho} (${totalLinhas} linhas no total)`)

  await limparBackupsAntigos()
}

// Mantém só os backups dos últimos 90 dias, pra não acumular indefinidamente.
async function limparBackupsAntigos() {
  const { data: pastas, error } = await supabase.storage.from('backups-db').list('', { limit: 1000 })
  if (error) { console.warn('Não consegui listar backups antigos para limpeza:', error.message); return }

  const limite = new Date()
  limite.setDate(limite.getDate() - 90)

  const antigas = (pastas || []).filter(p => {
    const data = new Date(p.name)
    return !isNaN(data) && data < limite
  })

  for (const pasta of antigas) {
    const { data: arquivos } = await supabase.storage.from('backups-db').list(pasta.name)
    const caminhos = (arquivos || []).map(a => `${pasta.name}/${a.name}`)
    if (caminhos.length) {
      await supabase.storage.from('backups-db').remove(caminhos)
      console.log(`Removidos backups antigos de ${pasta.name}`)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
