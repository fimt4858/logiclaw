import { notFound } from "next/navigation";
import Link from "next/link";
import PracticeEditor from "@/components/admin/PracticeEditor";
import { createClient } from "@/lib/supabase/server";
import type { PracticeArea } from "@/lib/types";

export default async function AdminPracticeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("practice_areas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <p className="admin-help">
        <Link href="/admin/practice">← 업무분야 목록으로</Link>
      </p>
      <h1 className="admin-page-title">업무분야 편집</h1>
      <PracticeEditor area={data as PracticeArea} />
    </div>
  );
}
