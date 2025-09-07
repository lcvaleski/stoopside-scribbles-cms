import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SiteSettings {
  id?: string
  title: string
  subtitle: string
  created_at?: string
  updated_at?: string
}

export interface Post {
  id: string
  title: string
  content: string
  date: string
  published: boolean
  created_at?: string
  updated_at?: string
}