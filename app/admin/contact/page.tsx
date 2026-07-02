import ContactMethodsEditor from "@/components/admin/ContactMethodsEditor";
import { createClient } from "@/lib/supabase/server";
import type { ContactMethod } from "@/lib/types";

export default async function AdminContactPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_methods")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="admin-page-title">상담 안내 카드</h1>
      <p className="admin-help">
        홈 화면과 상담예약 페이지에 표시되는 안내 카드를 수정합니다.
      </p>
      <ContactMethodsEditor methods={(data ?? []) as ContactMethod[]} />
    </div>
  );
}
