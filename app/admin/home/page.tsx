import HomeEditor from "@/components/admin/HomeEditor";
import { createClient } from "@/lib/supabase/server";
import type { CoreValue } from "@/lib/types";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [pageResult, settingResult, valuesResult] = await Promise.all([
    supabase.from("pages").select("*").eq("slug", "home").maybeSingle(),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "banner_image_path")
      .maybeSingle(),
    supabase
      .from("core_values")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">홈 화면</h1>
      <p className="admin-help">
        홈 화면의 배너 문구·이미지와 핵심 가치 카드를 수정합니다.
      </p>
      <HomeEditor
        heroTitle={pageResult.data?.hero_title ?? ""}
        bannerImagePath={settingResult.data?.value ?? ""}
        coreValues={(valuesResult.data ?? []) as CoreValue[]}
      />
    </div>
  );
}
