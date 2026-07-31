import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser client for use in Client Components ("use client").
 * Shares the auth session via cookies with the server client.
 */
export const createClientSupabase = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);
