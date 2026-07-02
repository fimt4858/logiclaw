"use server";

import { createStaticClient } from "@/lib/supabase/static";

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
