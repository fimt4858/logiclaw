import { createStaticClient } from "@/lib/supabase/static";

// Vercel Cron이 매일 호출해 Supabase 무료 프로젝트의
// 비활성 일시정지(pause)를 방지한다. vercel.json 참고.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createStaticClient();
    const { error } = await supabase
      .from("site_settings")
      .select("key")
      .limit(1);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
