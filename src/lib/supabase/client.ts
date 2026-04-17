import { createBrowserClient } from '@supabase/ssr'

/** Placeholders allow `next build` without .env; set real values in Vercel / .env.local */
const FALLBACK_URL = 'https://project-ref.supabase.co'
const FALLBACK_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.build-placeholder'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY
  return createBrowserClient(url, key)
}
