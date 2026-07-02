import { createStaticClient } from "./supabase/static";
import { DEFAULT_SETTINGS } from "./constants";
import type {
  ContactMethod,
  CoreValue,
  PageHero,
  PracticeArea,
  StaffMember,
} from "./types";

// 공개 페이지용 조회 함수 모음.
// DB 조회 실패(프로젝트 미생성, 일시정지 등) 시에도 페이지가 빌드되도록
// 기본값/빈 배열로 폴백한다. ISR 캐시가 있으면 Next가 stale 페이지를 계속 서빙한다.

const PAGE_DEFAULTS: Record<string, PageHero> = {
  home: {
    slug: "home",
    hero_title: "법은 어렵고 복잡하지만,\n해결은 **신뢰**에서 시작됩니다.",
    hero_subtitle: "",
  },
  "practice-areas": {
    slug: "practice-areas",
    hero_title: "업무분야",
    hero_subtitle: "전문성과 경험을 바탕으로 최상의 법률 서비스를 제공합니다",
  },
  staff: {
    slug: "staff",
    hero_title: "구성원",
    hero_subtitle: "전문성과 경험을 갖춘 최고의 법률 전문가들이 함께합니다",
  },
  location: {
    slug: "location",
    hero_title: "오시는 길",
    hero_subtitle: "법률사무소를 방문하시는 방법을 안내해 드립니다",
  },
  contact: {
    slug: "contact",
    hero_title: "상담예약",
    hero_subtitle: "언제든지 편하게 상담을 예약해 주세요",
  },
};

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("site_settings").select("key, value");
    const merged = { ...DEFAULT_SETTINGS };
    for (const row of data ?? []) merged[row.key] = row.value;
    return merged;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getPage(slug: string): Promise<PageHero> {
  const fallback = PAGE_DEFAULTS[slug] ?? {
    slug,
    hero_title: "",
    hero_subtitle: "",
  };
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

async function getPublishedList<T>(table: string): Promise<T[]> {
  try {
    const supabase = createStaticClient();
    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    return (data ?? []) as T[];
  } catch {
    return [];
  }
}

export const getCoreValues = () => getPublishedList<CoreValue>("core_values");
export const getPracticeAreas = () =>
  getPublishedList<PracticeArea>("practice_areas");
export const getStaffMembers = () =>
  getPublishedList<StaffMember>("staff_members");
export const getContactMethods = () =>
  getPublishedList<ContactMethod>("contact_methods");
