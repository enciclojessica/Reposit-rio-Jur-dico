import { createClient } from '@supabase/supabase-js'

// v2 — anon JWT key — 202606081017
export const supabase = createClient(
  'https://qfoxgipvhudpbsyijtaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmb3hnaXB2aHVkcGJzeWlqdGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDk5NTQsImV4cCI6MjA5NTI4NTk1NH0.OqtJdybi5lgwoU6jPL48QXb1BSl2Tq8rySvHw_qnHy8'
)
