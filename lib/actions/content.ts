"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ContactMethod, CoreValue, PageHero, ProfileItem } from "@/lib/types";

export type ActionResult = { ok: boolean; message: string };

const OK: ActionResult = { ok: true, message: "저장되었습니다. 사이트에 바로 반영됩니다." };
const FAIL = (detail?: string): ActionResult => ({
  ok: false,
  message: `저장에 실패했습니다.${detail ? ` (${detail})` : ""}`,
});

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return supabase;
}

// 테이블별 공개 페이지 revalidate 경로
const REVALIDATE_PATHS: Record<string, string[]> = {
  practice_areas: ["/practice-areas"],
  staff_members: ["/staff"],
  core_values: ["/"],
  contact_methods: ["/", "/contact"],
};

function revalidateTable(table: string) {
  for (const path of REVALIDATE_PATHS[table] ?? ["/"]) revalidatePath(path);
}

async function deleteOldImage(
  supabase: Awaited<ReturnType<typeof requireUser>>,
  oldPath: string,
  newPath: string
) {
  if (oldPath && oldPath !== newPath) {
    await supabase.storage.from("site-images").remove([oldPath]);
  }
}

// ----- 사이트 설정 + 페이지 히어로 -----

export async function saveSettings(
  entries: { key: string; value: string }[]
): Promise<ActionResult> {
  const supabase = await requireUser();
  for (const { key, value } of entries) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("key", key);
    if (error) return FAIL(error.message);
  }
  // 푸터 등 전역 요소에 쓰이므로 전체 무효화
  revalidatePath("/", "layout");
  return OK;
}

export async function savePages(pages: PageHero[]): Promise<ActionResult> {
  const supabase = await requireUser();
  const { error } = await supabase.from("pages").upsert(pages);
  if (error) return FAIL(error.message);
  revalidatePath("/", "layout");
  return OK;
}

// ----- 홈: 배너 -----

export async function saveHomeBanner(input: {
  heroTitle: string;
  bannerImagePath: string;
  previousImagePath: string;
}): Promise<ActionResult> {
  const supabase = await requireUser();

  const { error: pageError } = await supabase
    .from("pages")
    .update({ hero_title: input.heroTitle })
    .eq("slug", "home");
  if (pageError) return FAIL(pageError.message);

  const { error: settingError } = await supabase
    .from("site_settings")
    .update({ value: input.bannerImagePath })
    .eq("key", "banner_image_path");
  if (settingError) return FAIL(settingError.message);

  await deleteOldImage(supabase, input.previousImagePath, input.bannerImagePath);
  // 배너 이미지는 모든 페이지 히어로에 쓰인다
  revalidatePath("/", "layout");
  return OK;
}

// ----- 핵심 가치 (전체 상태 저장) -----

export async function saveCoreValues(
  items: Omit<CoreValue, "sort_order" | "published">[]
): Promise<ActionResult> {
  const supabase = await requireUser();

  const { data: existing, error: readError } = await supabase
    .from("core_values")
    .select("id");
  if (readError) return FAIL(readError.message);

  const keepIds = new Set(items.map((item) => item.id));
  const removed = (existing ?? []).filter((row) => !keepIds.has(row.id));
  if (removed.length > 0) {
    const { error } = await supabase
      .from("core_values")
      .delete()
      .in("id", removed.map((row) => row.id));
    if (error) return FAIL(error.message);
  }

  const rows = items.map((item, index) => ({
    ...item,
    sort_order: index,
    published: true,
  }));
  const { error } = await supabase.from("core_values").upsert(rows);
  if (error) return FAIL(error.message);

  revalidateTable("core_values");
  return OK;
}

// ----- 상담 안내 카드 (전체 상태 저장) -----

export async function saveContactMethods(
  items: Omit<ContactMethod, "sort_order">[]
): Promise<ActionResult> {
  const supabase = await requireUser();

  const { data: existing, error: readError } = await supabase
    .from("contact_methods")
    .select("id");
  if (readError) return FAIL(readError.message);

  const keepIds = new Set(items.map((item) => item.id));
  const removed = (existing ?? []).filter((row) => !keepIds.has(row.id));
  if (removed.length > 0) {
    const { error } = await supabase
      .from("contact_methods")
      .delete()
      .in("id", removed.map((row) => row.id));
    if (error) return FAIL(error.message);
  }

  const rows = items.map((item, index) => ({ ...item, sort_order: index }));
  const { error } = await supabase.from("contact_methods").upsert(rows);
  if (error) return FAIL(error.message);

  revalidateTable("contact_methods");
  return OK;
}

// ----- 업무분야 -----

export async function createPracticeArea(): Promise<void> {
  const supabase = await requireUser();
  const { data: rows } = await supabase
    .from("practice_areas")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("practice_areas")
    .insert({ title: "새 업무분야", published: false, sort_order: nextOrder })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "생성 실패");

  revalidateTable("practice_areas");
  redirect(`/admin/practice/${data.id}`);
}

export async function savePracticeArea(input: {
  id: string;
  title: string;
  body: string;
  image_path: string;
  previousImagePath: string;
  published: boolean;
}): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!input.title.trim()) return { ok: false, message: "제목을 입력해 주세요." };

  const { error } = await supabase
    .from("practice_areas")
    .update({
      title: input.title.trim(),
      body: input.body,
      image_path: input.image_path,
      published: input.published,
    })
    .eq("id", input.id);
  if (error) return FAIL(error.message);

  await deleteOldImage(supabase, input.previousImagePath, input.image_path);
  revalidateTable("practice_areas");
  return OK;
}

export async function deletePracticeArea(id: string): Promise<void> {
  const supabase = await requireUser();
  const { data } = await supabase
    .from("practice_areas")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("practice_areas").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (data?.image_path) {
    await supabase.storage.from("site-images").remove([data.image_path]);
  }
  revalidateTable("practice_areas");
  redirect("/admin/practice");
}

// ----- 구성원 -----

export async function createStaffMember(): Promise<void> {
  const supabase = await requireUser();
  const { data: rows } = await supabase
    .from("staff_members")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (rows?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("staff_members")
    .insert({ name: "새 구성원", published: false, sort_order: nextOrder })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "생성 실패");

  revalidateTable("staff_members");
  redirect(`/admin/staff/${data.id}`);
}

export async function saveStaffMember(input: {
  id: string;
  name: string;
  title: string;
  photo_path: string;
  previousPhotoPath: string;
  education: ProfileItem[];
  career: ProfileItem[];
  certifications: ProfileItem[];
  introduction: string;
  published: boolean;
}): Promise<ActionResult> {
  const supabase = await requireUser();
  if (!input.name.trim()) return { ok: false, message: "이름을 입력해 주세요." };

  const cleanList = (items: ProfileItem[]) =>
    items
      .map((item) => ({
        ...(item.period?.trim() ? { period: item.period.trim() } : {}),
        text: item.text.trim(),
      }))
      .filter((item) => item.text);

  const { error } = await supabase
    .from("staff_members")
    .update({
      name: input.name.trim(),
      title: input.title.trim(),
      photo_path: input.photo_path,
      education: cleanList(input.education),
      career: cleanList(input.career),
      certifications: cleanList(input.certifications),
      introduction: input.introduction,
      published: input.published,
    })
    .eq("id", input.id);
  if (error) return FAIL(error.message);

  await deleteOldImage(supabase, input.previousPhotoPath, input.photo_path);
  revalidateTable("staff_members");
  return OK;
}

export async function deleteStaffMember(id: string): Promise<void> {
  const supabase = await requireUser();
  const { data } = await supabase
    .from("staff_members")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("staff_members").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (data?.photo_path) {
    await supabase.storage.from("site-images").remove([data.photo_path]);
  }
  revalidateTable("staff_members");
  redirect("/admin/staff");
}

// ----- 목록 순서 변경 (위/아래 스왑) -----

const SORTABLE_TABLES = ["practice_areas", "staff_members"] as const;

export async function moveItem(
  table: (typeof SORTABLE_TABLES)[number],
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  if (!SORTABLE_TABLES.includes(table)) return FAIL("허용되지 않는 대상");
  const supabase = await requireUser();

  const { data: rows, error } = await supabase
    .from(table)
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (error || !rows) return FAIL(error?.message);

  const index = rows.findIndex((row) => row.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || neighborIndex < 0 || neighborIndex >= rows.length) {
    return { ok: true, message: "" };
  }

  const a = rows[index];
  const b = rows[neighborIndex];
  const updates = [
    supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id),
    supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id),
  ];
  for (const update of updates) {
    const { error: updateError } = await update;
    if (updateError) return FAIL(updateError.message);
  }

  revalidateTable(table);
  revalidatePath(`/admin/${table === "practice_areas" ? "practice" : "staff"}`);
  return { ok: true, message: "순서가 변경되었습니다." };
}
