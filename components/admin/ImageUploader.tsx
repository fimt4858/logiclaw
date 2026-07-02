"use client";

import imageCompression from "browser-image-compression";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { publicImageUrl } from "@/lib/storage";

type Props = {
  folder: "banner" | "practice" | "staff";
  value: string; // Storage 경로 (예: practice/civil.webp)
  onChange: (path: string) => void;
  maxWidth?: number;
  label?: string;
};

// 파일 선택 → 클라이언트에서 webp 압축 → Storage 직접 업로드 → 경로 반환.
// 같은 경로 덮어쓰기 대신 새 uuid 경로를 발급해 캐시 문제를 피한다.
// 이전 파일 삭제는 저장 action에서 처리된다.
export default function ImageUploader({
  folder,
  value,
  onChange,
  maxWidth = 1600,
  label = "이미지 변경",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: maxWidth,
        maxSizeMB: 1.5,
        fileType: "image/webp",
        initialQuality: 0.8,
      });

      const path = `${folder}/${crypto.randomUUID()}.webp`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(path, compressed, { contentType: "image/webp" });

      if (uploadError) throw uploadError;
      onChange(path);
    } catch {
      setError("업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="admin-uploader">
      {value ? (
        // 미리보기는 업로드 직후 즉시 보여야 하므로 next/image 대신 img 사용
        // eslint-disable-next-line @next/next/no-img-element
        <img src={publicImageUrl(value)} alt="미리보기" />
      ) : (
        <div className="admin-thumb" style={{ width: 120, height: 80 }} />
      )}
      <div className="uploader-actions">
        <button
          type="button"
          className="admin-add-btn"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "업로드 중..." : label}
        </button>
        <span>JPG/PNG 파일을 선택하면 자동으로 최적화됩니다.</span>
        {error && <span style={{ color: "#c62828" }}>{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
