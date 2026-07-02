import SettingsEditor from "@/components/admin/SettingsEditor";
import { createClient } from "@/lib/supabase/server";
import type { PageHero, SiteSetting } from "@/lib/types";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [settingsResult, pagesResult] = await Promise.all([
    supabase.from("site_settings").select("*").order("key"),
    supabase.from("pages").select("*"),
  ]);

  const pageOrder = ["practice-areas", "staff", "location", "contact"];
  const pages = ((pagesResult.data ?? []) as PageHero[]).sort(
    (a, b) => pageOrder.indexOf(a.slug) - pageOrder.indexOf(b.slug)
  );

  return (
    <div>
      <h1 className="admin-page-title">사이트 설정</h1>
      <p className="admin-help">
        전화번호·주소 등 공통 정보와 각 페이지 상단 문구를 수정합니다. 푸터와
        오시는 길에 함께 반영됩니다.
      </p>
      <SettingsEditor
        settings={(settingsResult.data ?? []) as SiteSetting[]}
        pages={pages}
      />
    </div>
  );
}
