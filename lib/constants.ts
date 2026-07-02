// site_settings 테이블의 key 목록과 기본값.
// DB에 값이 없거나 조회에 실패해도 사이트가 빈 화면이 되지 않도록
// 현재 사이트의 실제 값을 기본값으로 유지한다.
export const DEFAULT_SETTINGS: Record<string, string> = {
  phone: "050-7725-7223",
  address: "서울특별시 강남구 테헤란로79길 6 (삼성동) JS타워 3층 브이418",
  subway: "지하철: 삼성중앙역 3번 출구 도보 5분",
  bus: "버스: JS타워 앞 하차",
  naver_map_url:
    "https://map.naver.com/v5/search/서울특별시 강남구 테헤란로79길 6",
  copyright: "© 신뢰 법률사무소. All rights reserved.",
  banner_image_path: "",
};

export const SITE_NAME = "법률사무소 신뢰";

export const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/practice-areas", label: "업무분야" },
  { href: "/staff", label: "구성원" },
  { href: "/location", label: "오시는 길" },
  { href: "/contact", label: "상담예약" },
] as const;
