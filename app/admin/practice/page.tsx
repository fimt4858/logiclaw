import SortableList from "@/components/admin/SortableList";
import { createPracticeArea } from "@/lib/actions/content";
import { createClient } from "@/lib/supabase/server";
import type { PracticeArea } from "@/lib/types";

export default async function AdminPracticePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("practice_areas")
    .select("*")
    .order("sort_order", { ascending: true });

  const areas = (data ?? []) as PracticeArea[];

  return (
    <div>
      <h1 className="admin-page-title">업무분야</h1>
      <p className="admin-help">
        카드를 편집하거나 순서를 바꿀 수 있습니다. 숨김 상태인 카드는 사이트에
        표시되지 않습니다.
      </p>
      <div className="admin-section">
        <SortableList
          table="practice_areas"
          basePath="/admin/practice"
          rows={areas.map((area) => ({
            id: area.id,
            title: area.title,
            imagePath: area.image_path,
            published: area.published,
          }))}
        />
        <form action={createPracticeArea} style={{ marginTop: "1rem" }}>
          <button type="submit" className="admin-add-btn">
            + 업무분야 추가
          </button>
        </form>
      </div>
    </div>
  );
}
