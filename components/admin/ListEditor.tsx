"use client";

import type { ProfileItem } from "@/lib/types";

type Props = {
  items: ProfileItem[];
  onChange: (items: ProfileItem[]) => void;
  withPeriod?: boolean;
  textPlaceholder?: string;
  periodPlaceholder?: string;
};

// 학력/경력/자격 등 행 목록 편집기: 행 추가/삭제/위아래 이동
export default function ListEditor({
  items,
  onChange,
  withPeriod = false,
  textPlaceholder = "내용",
  periodPlaceholder = "기간 (예: 2020.3.~2023.2.)",
}: Props) {
  function update(index: number, patch: Partial<ProfileItem>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="admin-row">
          {withPeriod && (
            <input
              className="row-period"
              type="text"
              value={item.period ?? ""}
              placeholder={periodPlaceholder}
              onChange={(e) => update(index, { period: e.target.value })}
            />
          )}
          <input
            type="text"
            value={item.text}
            placeholder={textPlaceholder}
            onChange={(e) => update(index, { text: e.target.value })}
          />
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="위로"
            onClick={() => move(index, -1)}
          >
            ↑
          </button>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="아래로"
            onClick={() => move(index, 1)}
          >
            ↓
          </button>
          <button
            type="button"
            className="admin-icon-btn danger"
            aria-label="삭제"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-add-btn"
        onClick={() => onChange([...items, { text: "" }])}
      >
        + 항목 추가
      </button>
    </div>
  );
}
