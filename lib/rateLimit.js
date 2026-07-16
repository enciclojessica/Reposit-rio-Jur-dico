// Rate limit simples baseado em Supabase — conta chamadas recentes por
// usuário + endpoint numa tabela (api_rate_limit) e bloqueia acima do limite.
// Serverless functions não têm memória compartilhada entre invocações,
// então um contador em variável local não funcionaria; por isso o Supabase.
export async function checarRateLimit(supabase, userId, endpoint, { limite = 20, janelaMs = 60_000 } = {}) {
  const desde = new Date(Date.now() - janelaMs).toISOString()

  const { count, error } = await supabase
    .from('api_rate_limit')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('criado_em', desde)

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
  supabase.from('api_rate_limit').insert({ user_id: userId, endpoint }).then(({ error: insErr }) => {
    if (insErr) console.error('[rateLimit] erro ao registrar:', insErr.message)
  })

  return { permitido: true, restante: limite - count - 1 }
}
