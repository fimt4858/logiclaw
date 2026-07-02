import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// 어드민 전용: 쿠키 세션 기반 서버 클라이언트.
// cookies()를 읽는 순간 해당 라우트는 dynamic 렌더링이 되므로
// 공개 페이지에서는 static.ts의 클라이언트를 사용할 것.
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component에서 호출된 경우 무시 가능 (proxy가 세션을 갱신함)
        }
      },
    },
  });
}
