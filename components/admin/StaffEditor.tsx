"use client";

import { useState, useTransition } from "react";
import ImageUploader from "./ImageUploader";
import ListEditor from "./ListEditor";
import SaveBar from "./SaveBar";
import {
  deleteStaffMember,
  saveStaffMember,
  type ActionResult,
} from "@/lib/actions/content";
import type { ProfileItem, StaffMember } from "@/lib/types";

export default function StaffEditor({ member }: { member: StaffMember }) {
  const [name, setName] = useState(member.name);
  const [title, setTitle] = useState(member.title);
  const [photoPath, setPhotoPath] = useState(member.photo_path);
  const [savedPhotoPath, setSavedPhotoPath] = useState(member.photo_path);
  const [education, setEducation] = useState<ProfileItem[]>(member.education);
  const [career, setCareer] = useState<ProfileItem[]>(member.career);
  const [certifications, setCertifications] = useState<ProfileItem[]>(
    member.certifications
  );
  const [introduction, setIntroduction] = useState(member.introduction);
  const [published, setPublished] = useState(member.published);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="admin-section"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const saved = await saveStaffMember({
            id: member.id,
            name,
            title,
            photo_path: photoPath,
            previousPhotoPath: savedPhotoPath,
            education,
            career,
            certifications,
            introduction,
            published,
          });
          setResult(saved);
          if (saved.ok) setSavedPhotoPath(photoPath);
        });
      }}
    >
      <div className="admin-row">
        <div className="admin-field" style={{ flex: 1 }}>
          <label htmlFor="name">이름</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 신영규"
          />
        </div>
        <div className="admin-field" style={{ flex: 1 }}>
          <label htmlFor="title">직함</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 변호사"
          />
        </div>
      </div>
      <div className="admin-field">
        <label>사진</label>
        <ImageUploader
          folder="staff"
          value={photoPath}
          onChange={setPhotoPath}
          maxWidth={800}
        />
      </div>
      <div className="admin-field">
        <label>학력</label>
        <ListEditor
          items={education}
          onChange={setEducation}
          withPeriod
          textPlaceholder="예: 고려대 법학전문대학원 졸업"
        />
      </div>
      <div className="admin-field">
        <label>주요 경력</label>
        <ListEditor
          items={career}
          onChange={setCareer}
          textPlaceholder="예: (현)법률사무소 신뢰 대표 변호사"
        />
      </div>
      <div className="admin-field">
        <label>자격</label>
        <ListEditor
          items={certifications}
          onChange={setCertifications}
          textPlaceholder="예: 변호사"
        />
      </div>
      <div className="admin-field">
        <label htmlFor="introduction">소개</label>
        <textarea
          id="introduction"
          rows={8}
          value={introduction}
          onChange={(e) => setIntroduction(e.target.value)}
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
          if (confirm(`"${name}" 구성원을 삭제할까요? 되돌릴 수 없습니다.`)) {
            startTransition(() => deleteStaffMember(member.id));
          }
        }}
      >
        이 구성원 삭제
      </button>
    </form>
  );
}
