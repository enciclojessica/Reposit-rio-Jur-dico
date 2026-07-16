// ── Exportação Google Calendar — API direta + fallback ICS ───────────────────
export async function exportarCalendarOuICS(sessions, dados) {
  const pendentes = sessions.filter(s => dados[s.id]?.status !== 'Concluído')

  // Tentar Google Calendar API via OAuth popup
  async function viaGoogleAPI() {
    if (!window.google?.accounts?.oauth2) {
      await new Promise((res, rej) => {
        if (document.querySelector('script[src*="gsi/client"]')) { res(); return }
        const sc = document.createElement('script')
        sc.src = 'https://accounts.google.com/gsi/client'
        sc.onload = res; sc.onerror = rej
        document.head.appendChild(sc)
      })
      await new Promise(r => setTimeout(r, 800))
    }
    const CLIENT_ID = '354005440019-9pn0fh5d6fh6bombnqk7di44gardcvfj.apps.googleusercontent.com'
    const token = await new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: r => r.error ? reject(new Error(r.error)) : resolve(r.access_token),
      })
      client.requestAccessToken()
    })
    let ok = 0
    for (const s of pendentes) {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: `[OAB 48º] ${s.disciplina}`,
          description: `${s.topico}\n\nMétodos: ${s.metodos.join(', ')}\n\nLex.IA`,
          start: { date: s.date }, end: { date: s.date }, colorId: '3',
        }),
      })
      if (res.ok) ok++
      await new Promise(r => setTimeout(r, 100))
    }
    return ok
  }

  try {
    const ok = await viaGoogleAPI()
    alert(ok + ' eventos adicionados diretamente no seu Google Calendar!')
    return
  } catch (e) {
    console.log('Google API indisponível, gerando .ics:', e.message)
  }

  // Fallback: download .ics
  const linhas = [
    'BEGIN:VCALENDAR','VERSION:2.0',
    'PRODID:-//LexIA//OAB Dashboard//PT',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'X-WR-CALNAME:Lex.IA — Estudos OAB 48° Exame',
    'X-WR-TIMEZONE:America/Sao_Paulo',
  ]
  sessions.forEach(s => {
    const [y,m,d] = s.date.split('-')
    const dtstart = `${y}${m}${d}`
    const status = dados[s.id]?.status || 'A Fazer'
    linhas.push('BEGIN:VEVENT',
      `UID:lexia-oab-${s.id}@lexiajur.com.br`,
      `DTSTART;VALUE=DATE:${dtstart}`,`DTEND;VALUE=DATE:${dtstart}`,
      `SUMMARY:[OAB ${s.fase}] ${s.disciplina}`,
      `DESCRIPTION:Tópico: ${s.topico}\\nMétodos: ${s.metodos.join(', ')}\\nStatus: ${status}\\n\\nLex.IA`,
      `CATEGORIES:OAB,${s.disciplina},${s.fase}`,
      `STATUS:${status === 'Concluído' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT')
  })
  linhas.push('END:VCALENDAR')
  const blob = new Blob([linhas.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'lexia_oab_cronograma.ics'; a.click()
  URL.revokeObjectURL(url)
}
