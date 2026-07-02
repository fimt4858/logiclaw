"use client";

import { useState, useTransition } from "react";
import ImageUploader from "./ImageUploader";
import SaveBar from "./SaveBar";
import {
  deletePracticeArea,
  savePracticeArea,
  type ActionResult,
} from "@/lib/actions/content";
import type { PracticeArea } from "@/lib/types";

export default function PracticeEditor({ area }: { area: PracticeArea }) {
  const [title, setTitle] = useState(area.title);
  const [body, setBody] = useState(area.body);
  const [imagePath, setImagePath] = useState(area.image_path);
  const [savedImagePath, setSavedImagePath] = useState(area.image_path);
  const [published, setPublished] = useState(area.published);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin-section"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const saved = await savePracticeArea({
            id: area.id,
            title,
            body,
            image_path: imagePath,
            previousImagePath: savedImagePath,
            published,
          });
          setResult(saved);
          if (saved.ok) setSavedImagePath(imagePath);
        });
      }}
    >
      <div className="admin-field">
        <label htmlFor="title">분야 이름</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 민사"
        />
      </div>
      <div className="admin-field">
        <label>대표 이미지</label>
        <ImageUploader
          folder="practice"
          value={imagePath}
          onChange={setImagePath}
          maxWidth={1200}
        />
      </div>
      <div className="admin-field">
        <label htmlFor="body">소개 내용</label>
        <textarea
          id="body"
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="분야 소개를 입력하세요."
        />
        <p className="field-help">빈 줄로 문단을 나누면 사이트에 문단으로 표시됩니다.</p>
      </div>
      <div className="admin-field">
        <label>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            style={{ width: "auto", marginRight: "0.5rem" }}
          />
          사이트에 게시
        </label>
      </div>
      <SaveBar pending={pending} result={result} />
      <button
        type="button"
        className="admin-add-btn"
        style={{ borderColor: "#c62828", color: "#c62828" }}
        onClick={() => {
          if (confirm(`"${title}" 업무분야를 삭제할까요? 되돌릴 수 없습니다.`)) {
            startTransition(() => deletePracticeArea(area.id));
          }
        }}
      >
        이 업무분야 삭제
      </button>
    </form>
  );
}
