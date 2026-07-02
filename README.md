# 법률사무소 신뢰 (logiclaw.co.kr)

Next.js 16 + Supabase + Vercel 기반 사이트.
운영자는 `/admin`에서 로그인 후 사이트의 문구·이미지·상담 접수를 직접 관리한다.

- `main` 브랜치: 구 정적 사이트 (GitHub Pages, 도메인 전환 전까지 서비스 유지)
- `renewal` 브랜치: 현재 사이트 (Vercel 배포)

## 구조

| 경로 | 내용 |
|---|---|
| `app/(public)/` | 공개 페이지 5종 (정적 + 어드민 저장 시 즉시 재검증) |
| `app/admin/` | 어드민 (접수함, 홈/업무분야/구성원/상담카드/설정 편집) |
| `app/login/` | 운영자 로그인 |
| `app/api/keepalive/` | Vercel Cron 일 1회 호출 → Supabase 무료 프로젝트 일시정지 방지 |
| `lib/supabase/` | Supabase 클라이언트 (server/client/static/proxy) |
| `lib/actions/` | server actions (저장 + revalidatePath) |
| `supabase/migrations/` | DB 스키마 + RLS + Storage 정책 |
| `scripts/seed.mjs` | 초기 콘텐츠·이미지 시드 (1회 실행) |

## 최초 설정 체크리스트

1. **Supabase 프로젝트 생성** — https://supabase.com, 리전 `Northeast Asia (Seoul)`.
   Project Settings → API에서 `Project URL`, `Publishable(anon) key`, `Secret(service_role) key` 확보.
2. **마이그레이션 적용** — 대시보드 SQL Editor에서
   `supabase/migrations/0001_schema.sql` → `0002_storage.sql` 순서로 실행.
3. **회원가입 차단** — Authentication → Sign In / Providers에서
   "Allow new users to sign up" **OFF**.
4. **운영자 계정 생성** — Authentication → Users → Add user
   (이메일+비밀번호, Auto Confirm 체크).
5. **환경변수** — `.env.example`을 복사해 `.env.local` 작성.
   `SUPABASE_SERVICE_ROLE_KEY`는 시드 전용이며 절대 커밋·Vercel 등록 금지.
6. **시드 실행** — `npm install && node scripts/seed.mjs`
   → Table Editor와 Storage(site-images)에서 데이터 확인.
7. **로컬 확인** — `npm run dev` → http://localhost:3000 (공개), /login → /admin (어드민).
8. **Vercel 연결** — 새 프로젝트로 이 repo import,
   Settings → Git → Production Branch를 `renewal`로 변경,
   환경변수는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 2개만 등록.
9. **QA** — `*.vercel.app` URL에서 5개 페이지, 상담 폼 제출→접수함,
   어드민 수정→공개 페이지 즉시 반영 확인.
10. **도메인 전환** — Vercel Domains에 `logiclaw.co.kr` 추가 → 안내되는 DNS 값으로 변경
    (루트 A `76.76.21.21`, www CNAME `cname.vercel-dns.com`) → 인증서 발급 확인 후
    GitHub repo Settings → Pages에서 custom domain 제거.

## 운영 메모

- 운영자 비밀번호 분실 시: Supabase 대시보드 → Authentication → Users에서 리셋.
- 이미지는 어드민 업로드 시 자동으로 webp 압축(배너 1920px, 카드 1200px, 프로필 800px).
- 콘텐츠 저장 시 해당 공개 페이지가 즉시 재검증되며, 안전망으로 1시간마다 자동 갱신.
- Supabase 무료 플랜: keepalive cron이 매일 DB를 호출해 일시정지를 방지한다.
  그래도 정지되면 대시보드에서 Restore (공개 페이지는 캐시로 유지, 폼·어드민만 중단).
- Vercel Hobby 플랜은 약관상 비상업 용도 한정. 트래픽 증가나 정책 이슈 시 Pro 전환 권장.
