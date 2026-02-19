import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수 검증
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is undefined');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey) {
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key prefix:', supabaseAnonKey.substring(0, 20));

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
