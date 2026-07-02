// Storage 공개 이미지 URL 생성
export function publicImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !path) return "";
  return `${base}/storage/v1/object/public/site-images/${path}`;
}
