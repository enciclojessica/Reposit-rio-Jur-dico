import handler from '../radar-informativos.js'

// Wrapper do cron — injeta o CRON_SECRET automaticamente
export default async function cronRadar(req, res) {
  req.headers['authorization'] = `Bearer ${process.env.CRON_SECRET}`
  return handler(req, res)
}
