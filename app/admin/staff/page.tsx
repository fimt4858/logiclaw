import SortableList from "@/components/admin/SortableList";
import { createStaffMember } from "@/lib/actions/content";
import { createClient } from "@/lib/supabase/server";
import type { StaffMember } from "@/lib/types";

export default async function AdminStaffPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_members")
    .select("*")
    .order("sort_order", { ascending: true });

  const members = (data ?? []) as StaffMember[];

  return (
    <div>
      <h1 className="admin-page-title">구성원</h1>
      <p className="admin-help">
        구성원 프로필을 편집하거나 순서를 바꿀 수 있습니다.
      </p>
      <div className="admin-section">
        <SortableList
          table="staff_members"
          basePath="/admin/staff"
          rows={members.map((member) => ({
            id: member.id,
            title: `${member.name} ${member.title}`,
            imagePath: member.photo_path,
            published: member.published,
          }))}
        />
        <form action={createStaffMember} style={{ marginTop: "1rem" }}>
          <button type="submit" className="admin-add-btn">
            + 구성원 추가
          </button>
        </form>
      </div>
    </div>
  );
}
