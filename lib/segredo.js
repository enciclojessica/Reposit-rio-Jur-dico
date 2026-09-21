// Comparação de segredos em tempo constante (evita ataque de temporização).
import { timingSafeEqual, createHash } from 'node:crypto'

export function segredoConfere(recebido, esperado) {
  if (!recebido || !esperado) return false
  const a = createHash('sha256').update(String(recebido)).digest()
  const b = createHash('sha256').update(String(esperado)).digest()
  return timingSafeEqual(a, b)
}
