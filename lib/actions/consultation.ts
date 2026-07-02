"use server";

import { revalidatePath } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import { createClient } from "@/lib/supabase/server";
import type { ConsultationStatus } from "@/lib/types";

export type FormState = {
  ok: boolean;
  message: string;
} | null;

export async function submitConsultation(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // honeypot: 사람에게는 보이지 않는 필드가 채워져 있으면 봇으로 간주
  if (formData.get("website")) {
    return { ok: true, message: "상담 신청이 접수되었습니다." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length > 50) {
    return { ok: false, message: "성함을 입력해 주세요. (50자 이내)" };
  }
  if (phone.length < 5 || phone.length > 30 || !/^[0-9+\-() ]+$/.test(phone)) {
    return { ok: false, message: "연락처를 정확히 입력해 주세요." };
  }
  if (message.length > 2000) {
    return { ok: false, message: "상담 내용은 2000자 이내로 입력해 주세요." };
  }

  const supabase = createStaticClient();
  const { error } = await supabase
    .from("consultation_requests")
    .insert({ name, phone, message });

  if (error) {
    return {
      ok: false,
      message: "접수 중 오류가 발생했습니다. 전화로 문의해 주세요.",
    };
  }

  return {
    ok: true,
    message: "상담 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.",
  };
}

// ----- 어드민 전용 -----

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return supabase;
}

export async function updateConsultationStatus(
  id: string,
  status: ConsultationStatus
): Promise<FormState> {
  if (!["new", "in_progress", "done"].includes(status)) {
    return { ok: false, message: "잘못된 상태값입니다." };
  }
  const supabase = await requireUser();
  const { error } = await supabase
    .from("consultation_requests")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, message: "상태 변경에 실패했습니다." };
  revalidatePath("/admin");
  return { ok: true, message: "상태가 변경되었습니다." };
}

export async function updateConsultationMemo(
  id: string,
  memo: string
): Promise<FormState> {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("consultation_requests")
    .update({ memo: memo.slice(0, 2000) })
    .eq("id", id);
  if (error) return { ok: false, message: "메모 저장에 실패했습니다." };
  revalidatePath("/admin");
  return { ok: true, message: "메모가 저장되었습니다." };
}
