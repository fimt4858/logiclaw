import { notFound } from "next/navigation";
import Link from "next/link";
import StaffEditor from "@/components/admin/StaffEditor";
import { createClient } from "@/lib/supabase/server";
import type { StaffMember } from "@/lib/types";

export default async function AdminStaffEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <p className="admin-help">
        <Link href="/admin/staff">← 구성원 목록으로</Link>
      </p>
      <h1 className="admin-page-title">구성원 편집</h1>
      <StaffEditor member={data as StaffMember} />
    </div>
  );
}
