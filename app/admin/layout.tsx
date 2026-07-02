import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "사이트 관리",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { count } = await supabase
    .from("consultation_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="admin-shell">
      <AdminNav newCount={count ?? 0} />
      <div className="admin-content">{children}</div>
    </div>
  );
}
