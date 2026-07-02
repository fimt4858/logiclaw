"use client";

import { useState, useTransition } from "react";
import ImageUploader from "./ImageUploader";
import IconSelect from "./IconSelect";
import SaveBar from "./SaveBar";
import {
  saveCoreValues,
  saveHomeBanner,
  type ActionResult,
} from "@/lib/actions/content";
import type { CoreValue } from "@/lib/types";

type Props = {
  heroTitle: string;
  bannerImagePath: string;
  coreValues: CoreValue[];
};

export default function HomeEditor(props: Props) {
  // ----- 배너 -----
  const [heroTitle, setHeroTitle] = useState(props.heroTitle);
  const [bannerPath, setBannerPath] = useState(props.bannerImagePath);
  const [savedBannerPath, setSavedBannerPath] = useState(props.bannerImagePath);
  const [bannerResult, setBannerResult] = useState<ActionResult | null>(null);
  const [bannerPending, startBanner] = useTransition();

  // ----- 핵심 가치 -----
  const [values, setValues] = useState(props.coreValues);
  const [valuesResult, setValuesResult] = useState<ActionResult | null>(null);
  const [valuesPending, startValues] = useTransition();

  function updateValue(index: number, patch: Partial<CoreValue>) {
    setValues(values.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function moveValue(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    setValues(next);
  }

  return (
    <>
      <form
        className="admin-section"
        onSubmit={(e) => {
          e.preventDefault();
          startBanner(async () => {
            const result = await saveHomeBanner({
              heroTitle,
              bannerImagePath: bannerPath,
              previousImagePath: savedBannerPath,
            });
            setBannerResult(result);
            if (result.ok) setSavedBannerPath(bannerPath);
          });
        }}
      >
        <h2>메인 배너</h2>
        <div className="admin-field">
          <label htmlFor="hero-title">배너 문구</label>
          <textarea
            id="hero-title"
            rows={3}
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
          />
          <p className="field-help">
            강조할 단어는 **단어** 처럼 별표 두 개로 감싸세요. 줄바꿈은 그대로
            반영됩니다.
          </p>
        </div>
        <div className="admin-field">
          <label>배너 배경 이미지</label>
          <ImageUploader
            folder="banner"
            value={bannerPath}
            onChange={setBannerPath}
            maxWidth={1920}
          />
        </div>
        <SaveBar pending={bannerPending} result={bannerResult} label="배너 저장" />
      </form>

      <form
        className="admin-section"
        onSubmit={(e) => {
          e.preventDefault();
          startValues(async () => {
            const result = await saveCoreValues(
              values.map(({ id, icon, title, description }) => ({
                id,
                icon,
                title,
                description,
              }))
            );
            setValuesResult(result);
          });
        }}
      >
        <h2>핵심 가치 카드</h2>
        {values.map((value, index) => (
          <div
            key={value.id}
            className="admin-field"
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: "1rem",
            }}
          >
            <div className="admin-row" style={{ alignItems: "center" }}>
              <IconSelect
                value={value.icon}
                onChange={(icon) => updateValue(index, { icon })}
              />
              <input
                type="text"
                value={value.title}
                placeholder="제목"
                onChange={(e) => updateValue(index, { title: e.target.value })}
              />
              <button
                type="button"
                className="admin-icon-btn"
                aria-label="위로"
                onClick={() => moveValue(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="admin-icon-btn"
                aria-label="아래로"
                onClick={() => moveValue(index, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="admin-icon-btn danger"
                aria-label="삭제"
                onClick={() => setValues(values.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={value.description}
              placeholder="설명"
              style={{ width: "100%" }}
              onChange={(e) =>
                updateValue(index, { description: e.target.value })
              }
            />
          </div>
        ))}
        <button
          type="button"
          className="admin-add-btn"
          onClick={() =>
            setValues([
              ...values,
              {
                id: crypto.randomUUID(),
                icon: "scale",
                title: "",
                description: "",
                sort_order: values.length,
                published: true,
              },
            ])
          }
        >
          + 카드 추가
        </button>
        <SaveBar
          pending={valuesPending}
          result={valuesResult}
          label="핵심 가치 저장"
        />
      </form>
    </>
  );
}
