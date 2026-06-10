import { createClient } from '@supabase/supabase-js'

// v3 — novo projeto Supabase — wedfgqigtyrsrmmxsmuo — 202506100
export const supabase = createClient(
  'https://wedfgqigtyrsrmmxsmuo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZGZncWlndHlyc3JtbXhzbXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDcxNzEsImV4cCI6MjA5NTI4MzE3MX0.yojX35SIMb6X0QRWMhInbeE0GUy57uWqGF101LWVlGg'
)
