import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient<any, any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
