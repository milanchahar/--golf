import { createClient } from './server'
import { Profile } from '@/types'
import { type User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<{ user: User | null, profile: Profile | null }> {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { user: null, profile: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  return { user, profile }
}

export const getUser = getCurrentUser;
