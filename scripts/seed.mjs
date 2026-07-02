// 초기 데이터 시드 스크립트 (로컬 1회 실행)
//
// 사용법:
//   node scripts/seed.mjs
//
// .env.local에 다음 값이 필요하다:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (이 스크립트가 유일한 사용처)
//
// 하는 일:
//   1. scripts/seed-assets/ 의 이미지를 sharp로 webp 변환·축소 후 Storage에 업로드
//   2. 기존 사이트의 실제 문구를 각 테이블에 upsert
//   재실행해도 안전하다(자연키 upsert, 목록형 테이블은 비어있을 때만 insert).

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "scripts", "seed-assets");

// ----- .env.local 로드 -----
function loadEnv() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 .env.local에 설정하세요.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ----- 1. 이미지 최적화 + 업로드 -----
const IMAGES = [
  { src: "banner/banner.png", dest: "banner/banner.webp", width: 1920 },
  { src: "practice/civil.png", dest: "practice/civil.webp", width: 1200 },
  { src: "practice/criminal.png", dest: "practice/criminal.webp", width: 1200 },
  { src: "practice/family.png", dest: "practice/family.webp", width: 1200 },
  { src: "practice/real-estate.png", dest: "practice/real-estate.webp", width: 1200 },
  { src: "practice/rehabilitation.png", dest: "practice/rehabilitation.webp", width: 1200 },
  { src: "practice/corporate.jpg", dest: "practice/corporate.webp", width: 1200 },
  { src: "staff/representative.jpg", dest: "staff/representative.webp", width: 800 },
];

async function uploadImages() {
  for (const { src, dest, width } of IMAGES) {
    const file = join(ASSETS, src);
    if (!existsSync(file)) {
      console.warn(`건너뜀(파일 없음): ${src}`);
      continue;
    }
    const buf = await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const { error } = await supabase.storage
      .from("site-images")
      .upload(dest, buf, { contentType: "image/webp", upsert: true });
    if (error) throw new Error(`업로드 실패 ${dest}: ${error.message}`);
    console.log(`업로드: ${dest} (${Math.round(buf.length / 1024)}KB)`);
  }
}

// ----- 2. 콘텐츠 -----

const SITE_SETTINGS = [
  { key: "phone", label: "대표 전화", value: "050-7725-7223" },
  { key: "address", label: "주소", value: "서울특별시 강남구 테헤란로79길 6 (삼성동) JS타워 3층 브이418" },
  { key: "subway", label: "지하철 안내", value: "지하철: 삼성중앙역 3번 출구 도보 5분" },
  { key: "bus", label: "버스 안내", value: "버스: JS타워 앞 하차" },
  { key: "naver_map_url", label: "네이버 지도 링크", value: "https://map.naver.com/v5/search/서울특별시 강남구 테헤란로79길 6" },
  { key: "copyright", label: "저작권 문구", value: "© 2026 신뢰 법률사무소. All rights reserved." },
  { key: "banner_image_path", label: "홈 배너 이미지", value: "banner/banner.webp" },
];

const PAGES = [
  { slug: "home", hero_title: "법은 어렵고 복잡하지만,\n해결은 **신뢰**에서 시작됩니다.", hero_subtitle: "" },
  { slug: "practice-areas", hero_title: "업무분야", hero_subtitle: "전문성과 경험을 바탕으로 최상의 법률 서비스를 제공합니다" },
  { slug: "staff", hero_title: "구성원", hero_subtitle: "전문성과 경험을 갖춘 최고의 법률 전문가들이 함께합니다" },
  { slug: "location", hero_title: "오시는 길", hero_subtitle: "법률사무소를 방문하시는 방법을 안내해 드립니다" },
  { slug: "contact", hero_title: "상담예약", hero_subtitle: "언제든지 편하게 상담을 예약해 주세요" },
];

const CORE_VALUES = [
  { icon: "brain", title: "논리적 접근", description: "복잡한 법적 문제를 논리적으로 분석하고 체계적으로 해결합니다", sort_order: 0 },
  { icon: "zap", title: "신속한 대응", description: "24시간 상담과 신속한 사건 처리로 고객의 시간을 아껴드립니다", sort_order: 1 },
  { icon: "handshake", title: "신뢰 중심", description: "투명한 소통과 정직한 자세로 신뢰를 쌓아갑니다", sort_order: 2 },
];

// 원문의 "법률사무소 신뢰은"은 조사 오류라 "신뢰는"으로 교정해 시드한다.
const PRACTICE_AREAS = [
  {
    title: "민사",
    image_path: "practice/civil.webp",
    sort_order: 0,
    published: true,
    body: [
      "대여금 청구, 손해배상, 계약위반, 임대차 종료 등 민사 사건은 겉보기엔 단순해 보여도, 실제 해결에는 섬세한 법률 판단과 전략이 필요합니다.",
      "법률사무소 신뢰는 사안의 핵심을 정확히 짚고, 법리적 근거와 증거의 구조를 체계적으로 정리해 신속하고 실질적인 해결을 이끌어냅니다.",
      "소송 전 단계부터 판결 이후 집행에 이르기까지, 전 과정에 걸쳐 실무 경험을 바탕으로 촘촘하게 대응합니다.",
    ].join("\n\n"),
  },
  {
    title: "형사",
    image_path: "practice/criminal.webp",
    sort_order: 1,
    published: true,
    body: [
      "형사 사건은 단 한 번의 실수나 오해로도 일상의 큰 균열을 불러올 수 있습니다.",
      "경찰 조사, 검찰 송치, 공판 절차 등 단계마다 전략과 대응이 달라지므로, 초기부터 정확한 조력이 필요합니다.",
      "법률사무소 신뢰는 체포·구속 이후부터 불기소처분(혐의없음, 기소유예) 또는 무죄 입증까지, 의뢰인의 입장을 가장 유리하게 이끌어낼 수 있는 방향을 모색합니다.",
      "피해자 사건의 경우에도 신속한 고소와 강력한 대응으로 법적 보호를 실현합니다.",
    ].join("\n\n"),
  },
  {
    title: "가사",
    image_path: "practice/family.webp",
    sort_order: 2,
    published: true,
    body: [
      "이혼, 양육권, 친권, 재산분할, 상속 분쟁은 단순한 권리 다툼을 넘어 복잡한 감정과 인간관계가 얽혀 있습니다.",
      "법률사무소 신뢰는 감정에 휘둘리지 않되, 감정을 배제하지 않고 의뢰인의 입장을 가장 공정하게 대변합니다.",
      "자녀의 복리, 재산의 정당한 분배, 상속인의 권리까지 세심하게 살피며, 필요시 조정·심판·소송 등 절차별로 유연하게 접근합니다.",
    ].join("\n\n"),
  },
  {
    title: "부동산",
    image_path: "practice/real-estate.webp",
    sort_order: 3,
    published: true,
    body: [
      "부동산은 삶의 터전이자 가장 큰 자산입니다. 매매계약 해제, 임대차 분쟁, 명도소송, 근저당·유치권 다툼, 재개발·재건축 조합 내 갈등 등 부동산 분쟁은 사실관계가 복잡하고 법률관계도 다층적입니다.",
      "법률사무소 신뢰는 권리관계 분석, 사실 조사, 판례 정리를 바탕으로 불확실한 이해관계를 정리하고, 필요시 신속한 가처분, 가압류, 본안소송까지 이어지는 실질적 대응을 제공합니다.",
      "부동산 문제는 '먼저 움직이는 쪽'이 유리합니다.",
    ].join("\n\n"),
  },
  {
    title: "회생",
    image_path: "practice/rehabilitation.webp",
    sort_order: 4,
    published: true,
    body: [
      "소득은 있지만 채무가 감당할 수 없을 만큼 늘어난 경우, 개인회생은 합리적이고 제도적인 해법입니다.",
      "법률사무소 신뢰는 수입·지출 분석, 채무 및 재산 파악, 생계비 기준 등을 철저히 반영해 실현 가능한 변제계획안을 설계하고, 인가까지 책임지고 진행합니다.",
      "특히 변제 부담을 최소화하고 면책 가능성을 최대한 끌어내는 것이 핵심입니다.",
      "개시 전 추심 대응 및 강제집행 정지신청, 인가 후 관리까지, 회생 전 과정에서 함께합니다.",
    ].join("\n\n"),
  },
  // 추가 예정 카드: 본문을 채우고 어드민에서 게시로 전환하면 노출된다.
  {
    title: "기업 자문",
    image_path: "practice/corporate.webp",
    sort_order: 5,
    published: false,
    body: "",
  },
];

const STAFF_MEMBERS = [
  {
    name: "신영규",
    title: "변호사",
    photo_path: "staff/representative.webp",
    sort_order: 0,
    published: true,
    education: [
      { period: "2020.3.~2023.2.", text: "고려대 법학전문대학원 졸업" },
      { period: "2016.3.~2020.2.", text: "경희대 철학과 졸업" },
    ],
    career: [
      { text: "(현)법률사무소 신뢰 대표 변호사" },
      { text: "(현)서울특별시 공익변호사" },
      { text: "(현)대한변호사협회 미래전략센터 정책자문단" },
      { text: "(현)대한변호사협회 이민출입국변호사회 이사" },
      { text: "(현)사단법인 한국엔젤투자협회 협력 변호사" },
      { text: "(현)글로벌 스타트업 센터 자문변호사" },
      { text: "(현)주식회사 다름과 이음 고문변호사" },
      { text: "(현)근로자이음센터 법률상담 및 교육프로그램 전문가" },
      { text: "(현)서울지방변호사회 형사당직변호사" },
      { text: "(현)신한라이프 파트너 변호사" },
      { text: "(전)경기스타트업협의회 법률 전문가 멘토" },
    ],
    certifications: [
      { text: "서울출입국외국인청 출입국민원 대행기관" },
      { text: "변호사" },
    ],
    introduction: [
      "신영규 변호사는 다양한 송무와 자문 업무를 수행하며 폭넓은 실무 경험을 쌓아왔습니다. 가사 사건부터 대형 인프라 건설 계약 분쟁, 고난이도의 금융 가처분, 공갈ㆍ입찰방해ㆍ사기ㆍ뇌물ㆍ명예훼손ㆍ의료법 위반 등 형사 사건, 부당이득반환ㆍ공사대금청구ㆍ계약서 검토ㆍ보험금 청구 등 민사 사건, 지방자치단체 상대 행정 자문에 이르기까지, 신영규 변호사는 분야와 규모를 막론하며 빈틈없는 대응을 자랑하고 있습니다.",
      "신영규 변호사의 역량은 넓은 폭에만 그치지 않고, 탁월한 깊이까지 갖추고 있습니다. 신영규 변호사는 경희대학교를 단과대 차석 및 학과 수석으로 졸업하고, 매년 2만여 명이 응시하는 법학적성시험(LEET)에서는 전국 상위 약 0.5% 내외(언어 영역 전국 0.1%, 추리 영역 약 9%)를 달성했으며, 고려대학교 법학전문대학원에서는 우등 졸업까지 성취하였습니다.",
      "이처럼 신영규 변호사는 폭과 깊이를 고루 갖춘 전문성을 바탕으로, 의뢰인이 직면하는 어떠한 분쟁 상황에서도 정확하고 믿을 수 있는 법률 서비스를 제공하고 있습니다.",
    ].join("\n\n"),
  },
];

const CONTACT_METHODS = [
  {
    icon: "phone",
    title: "전화 상담",
    description: "050-7725-7223",
    button_label: "전화 예약하기",
    button_url: "tel:05077257223",
    sort_order: 0,
    published: true,
  },
  {
    icon: "laptop",
    title: "온라인 예약",
    description: "로톡을 통한 편리한 온라인 상담 예약",
    button_label: "로톡에서 예약하기",
    button_url:
      "https://www.lawtalk.co.kr/directory/profile/7223-%EC%8B%A0%EC%98%81%EA%B7%9C?source=total_n&position=0&sc=normal&scq=%EC%8B%A0%EC%98%81%EA%B7%9C",
    sort_order: 1,
    published: true,
  },
  {
    icon: "message-circle",
    title: "카카오톡 예약",
    description: "24시간 실시간 상담 예약",
    button_label: "카카오톡으로 예약하기",
    button_url: "", // 빈 값 = "준비중" 표시
    sort_order: 2,
    published: true,
  },
];

async function upsertContent() {
  {
    const { error } = await supabase.from("site_settings").upsert(SITE_SETTINGS);
    if (error) throw new Error(`site_settings: ${error.message}`);
    console.log(`site_settings: ${SITE_SETTINGS.length}행 upsert`);
  }
  {
    const { error } = await supabase.from("pages").upsert(PAGES);
    if (error) throw new Error(`pages: ${error.message}`);
    console.log(`pages: ${PAGES.length}행 upsert`);
  }
  // 목록형 테이블은 비어있을 때만 넣는다 (운영자 수정 내용 보호)
  const listTables = [
    ["core_values", CORE_VALUES],
    ["practice_areas", PRACTICE_AREAS],
    ["staff_members", STAFF_MEMBERS],
    ["contact_methods", CONTACT_METHODS],
  ];
  for (const [table, rows] of listTables) {
    const { count, error: countError } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (countError) throw new Error(`${table} count: ${countError.message}`);
    if (count > 0) {
      console.log(`${table}: 기존 ${count}행 존재, 건너뜀`);
      continue;
    }
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`${table}: ${rows.length}행 insert`);
  }
}

console.log("=== 이미지 업로드 ===");
await uploadImages();
console.log("=== 콘텐츠 시드 ===");
await upsertContent();
console.log("완료");
