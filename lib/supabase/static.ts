import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

// 공개 페이지 전용: 쿠키를 전혀 읽지 않는 anon 클라이언트.
// cookies()를 사용하지 않으므로 페이지가 static(ISR)으로 유지된다.
export function createStaticClient() {
  const { url, key } = getSupabaseEnv();
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
