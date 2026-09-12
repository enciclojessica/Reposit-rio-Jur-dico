// Rate limit simples baseado em Supabase — conta chamadas recentes por
// identificador (usuário autenticado, ou IP para rotas públicas) + endpoint
// numa tabela (api_rate_limit) e bloqueia acima do limite.
// Serverless functions não têm memória compartilhada entre invocações,
// então um contador em variável local não funcionaria; por isso o Supabase.
//
// Passe { userId } para rotas autenticadas, ou { ip } para rotas públicas
// (ex: legislacao.js) — pelo menos um dos dois é obrigatório.
export async function checarRateLimit(supabase, { userId, ip } = {}, endpoint, { limite = 20, janelaMs = 60_000 } = {}) {
  if (!userId && !ip) {
    console.error('[rateLimit] chamado sem userId nem ip — falha aberta.')
    return { permitido: true }
  }

  const desde = new Date(Date.now() - janelaMs).toISOString()

  let query = supabase
    .from('api_rate_limit')
    .select('*', { count: 'exact', head: true })
    .eq('endpoint', endpoint)
    .gte('criado_em', desde)
  query = userId ? query.eq('user_id', userId) : query.eq('ip', ip)

  const { count, error } = await query

  // Se a checagem falhar (ex: tabela indisponível), não bloqueia o usuário —
  // só loga o erro. Falha aberta é mais seguro para não travar o produto.
  if (error) {
    console.error('[rateLimit] erro ao checar:', error.message)
    return { permitido: true }
  }

  if (count >= limite) {
    return { permitido: false, restante: 0 }
  }

  // Registra esta chamada (não bloqueia a resposta se falhar)
  const registro = userId ? { user_id: userId, endpoint } : { ip, endpoint }
  supabase.from('api_rate_limit').insert(registro).then(({ error: insErr }) => {
    if (insErr) console.error('[rateLimit] erro ao registrar:', insErr.message)
  })

  return { permitido: true, restante: limite - count - 1 }
}
