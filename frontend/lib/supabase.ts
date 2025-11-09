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
/**
 * Supabase Client for Frontend
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Chat Message Interface
 */
export interface ChatMessage {
  id?: string;
  claim_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at?: string;
}

/**
 * Save chat message to database
 */
export async function saveChatMessage(message: ChatMessage) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([
      {
        claim_id: message.claim_id,
        role: message.role,
        content: message.content,
        metadata: message.metadata || {},
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    console.error('Error saving chat message:', error);
    return null;
  }

  return data?.[0];
}

/**
 * Load chat history for a claim
 */
export async function loadChatHistory(claimId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('claim_id', claimId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading chat history:', error);
    return [];
  }

  return data || [];
}

/**
 * Clear chat history for a claim
 */
export async function clearChatHistory(claimId: string) {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('claim_id', claimId);

  if (error) {
    console.error('Error clearing chat history:', error);
    return false;
  }

  return true;
}
