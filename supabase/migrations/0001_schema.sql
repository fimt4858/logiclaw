-- 법률사무소 신뢰 사이트 스키마
-- 콘텐츠 테이블: 공개 읽기 / 운영자(authenticated)만 쓰기
-- consultation_requests: 방문자(anon) 접수만 / 운영자만 조회·수정

create extension if not exists moddatetime schema extensions;

-- ===== 전역 상수 (key-value) =====
create table site_settings (
  key         text primary key,
  value       text not null default '',
  label       text not null,
  updated_at  timestamptz not null default now()
);
create trigger set_updated_at before update on site_settings
  for each row execute procedure extensions.moddatetime(updated_at);

-- ===== 페이지 히어로 =====
create table pages (
  slug           text primary key,
  hero_title     text not null,
  hero_subtitle  text not null default '',
  updated_at     timestamptz not null default now()
);
create trigger set_updated_at before update on pages
  for each row execute procedure extensions.moddatetime(updated_at);

-- ===== 핵심 가치 (홈) =====
create table core_values (
  id          uuid primary key default gen_random_uuid(),
  icon        text not null default 'scale',
  title       text not null,
  description text not null default '',
  sort_order  int  not null default 0,
  published   boolean not null default true
);

-- ===== 업무분야 =====
create table practice_areas (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  image_path  text not null default '',
  body        text not null default '',
  sort_order  int  not null default 0,
  published   boolean not null default true
);

-- ===== 구성원 =====
create table staff_members (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  title          text not null default '변호사',
  photo_path     text not null default '',
  education      jsonb not null default '[]',
  career         jsonb not null default '[]',
  certifications jsonb not null default '[]',
  introduction   text not null default '',
  sort_order     int  not null default 0,
  published      boolean not null default true
);

-- ===== 상담 안내 카드 =====
create table contact_methods (
  id           uuid primary key default gen_random_uuid(),
  icon         text not null default 'phone',
  title        text not null,
  description  text not null default '',
  button_label text not null default '',
  button_url   text not null default '',
  sort_order   int  not null default 0,
  published    boolean not null default true
);

-- ===== 상담예약 접수 =====
create table consultation_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 50),
  phone      text not null check (char_length(phone) between 5 and 30),
  message    text not null default '' check (char_length(message) <= 2000),
  status     text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  memo       text not null default '',
  created_at timestamptz not null default now()
);
create index consultation_requests_created_at_idx on consultation_requests (created_at desc);
create index consultation_requests_status_idx on consultation_requests (status);

-- ===== RLS =====
alter table site_settings         enable row level security;
alter table pages                 enable row level security;
alter table core_values           enable row level security;
alter table practice_areas        enable row level security;
alter table staff_members         enable row level security;
alter table contact_methods       enable row level security;
alter table consultation_requests enable row level security;

-- 콘텐츠 테이블: 공개 읽기
create policy "public read" on site_settings   for select using (true);
create policy "public read" on pages           for select using (true);
create policy "public read" on core_values     for select using (true);
create policy "public read" on practice_areas  for select using (true);
create policy "public read" on staff_members   for select using (true);
create policy "public read" on contact_methods for select using (true);

-- 콘텐츠 테이블: 운영자만 쓰기
create policy "authenticated insert" on site_settings   for insert to authenticated with check (true);
create policy "authenticated update" on site_settings   for update to authenticated using (true);
create policy "authenticated delete" on site_settings   for delete to authenticated using (true);

create policy "authenticated insert" on pages           for insert to authenticated with check (true);
create policy "authenticated update" on pages           for update to authenticated using (true);
create policy "authenticated delete" on pages           for delete to authenticated using (true);

create policy "authenticated insert" on core_values     for insert to authenticated with check (true);
create policy "authenticated update" on core_values     for update to authenticated using (true);
create policy "authenticated delete" on core_values     for delete to authenticated using (true);

create policy "authenticated insert" on practice_areas  for insert to authenticated with check (true);
create policy "authenticated update" on practice_areas  for update to authenticated using (true);
create policy "authenticated delete" on practice_areas  for delete to authenticated using (true);

create policy "authenticated insert" on staff_members   for insert to authenticated with check (true);
create policy "authenticated update" on staff_members   for update to authenticated using (true);
create policy "authenticated delete" on staff_members   for delete to authenticated using (true);

create policy "authenticated insert" on contact_methods for insert to authenticated with check (true);
create policy "authenticated update" on contact_methods for update to authenticated using (true);
create policy "authenticated delete" on contact_methods for delete to authenticated using (true);

-- 상담예약: 방문자 접수 / 운영자 조회·수정
create policy "anyone can submit" on consultation_requests
  for insert to anon, authenticated with check (true);
create policy "authenticated read" on consultation_requests
  for select to authenticated using (true);
create policy "authenticated update" on consultation_requests
  for update to authenticated using (true);
create policy "authenticated delete" on consultation_requests
  for delete to authenticated using (true);
