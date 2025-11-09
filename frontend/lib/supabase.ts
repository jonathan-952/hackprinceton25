import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using fallback mode.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database types
export type Database = {
  public: {
    Tables: {
      claims: {
        Row: {
          id: string
          user_id: string | null
          claim_id: string
          status: string
          incident_data: any
          vehicle_data: any
          insurance_data: any
          damage_data: any
          police_report: any | null
          orchestrator_state: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          claim_id: string
          status: string
          incident_data: any
          vehicle_data: any
          insurance_data: any
          damage_data: any
          police_report?: any | null
          orchestrator_state?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          claim_id?: string
          status?: string
          incident_data?: any
          vehicle_data?: any
          insurance_data?: any
          damage_data?: any
          police_report?: any | null
          orchestrator_state?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          claim_id: string
          role: string
          content: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          role: string
          content: string
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          role?: string
          content?: string
          metadata?: any | null
          created_at?: string
        }
      }
    }
  }
}
