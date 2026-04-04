import { createClient } from '@supabase/supabase-js'

// This client bypasses RLS — only use in server components/actions
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}