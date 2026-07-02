import InboxTable from "@/components/admin/InboxTable";
import { createClient } from "@/lib/supabase/server";
import type { ConsultationRequest } from "@/lib/types";

export default async function AdminInboxPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("consultation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const requests = (data ?? []) as ConsultationRequest[];

  return (
    <div>
      <h1 className="admin-page-title">상담 접수함</h1>
      <p className="admin-help">
        행을 클릭하면 전체 내용과 메모를 볼 수 있습니다. 상태를 바꾸면 바로
        저장됩니다.
      </p>
      <div className="admin-section">
        <InboxTable requests={requests} />
      </div>
    </div>
  );
}
