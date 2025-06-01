import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  user_number: string
  name: string
  age: number
  gender: string
  address: string
  phone?: string
  email?: string
  status: "pending" | "approved" | "rejected"
  registration_date: string
  last_updated: string
  created_at: string
}
