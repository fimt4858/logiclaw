-- 사이트 이미지 버킷: 공개 읽기 / 운영자만 업로드·수정·삭제
-- 파일 크기 5MB 제한 (어드민 클라이언트 압축 실패 대비 방어선)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/*'])
on conflict (id) do nothing;

create policy "site-images public read" on storage.objects
  for select using (bucket_id = 'site-images');

create policy "site-images authenticated insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images');

create policy "site-images authenticated update" on storage.objects
  for update to authenticated using (bucket_id = 'site-images');

create policy "site-images authenticated delete" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images');
