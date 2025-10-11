import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ensure the variables are provided
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// You can keep your interface here or move it to a types file
export interface UserProfile {
  id: string;
  email: string;
  location?: string;
  crop_planted?: string;
  created_at: string;
  updated_at: string;
}