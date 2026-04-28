import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL=https://uisckkfnveuufpebaxxt.supabase.co!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__k4RHvU3RcSc74UFPSqMaA_tl3JiySh!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
