"use client";

import { useState, useTransition } from "react";
import IconSelect from "./IconSelect";
import SaveBar from "./SaveBar";
import {
  saveContactMethods,
  type ActionResult,
} from "@/lib/actions/content";
import type { ContactMethod } from "@/lib/types";

export default function ContactMethodsEditor({
  methods,
}: {
  methods: ContactMethod[];
}) {
  const [items, setItems] = useState(methods);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function update(index: number, patch: Partial<ContactMethod>) {
    setItems(items.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const saved = await saveContactMethods(
            items.map(({ sort_order: _sortOrder, ...rest }) => rest)
          );
          setResult(saved);
        });
      }}
    >
      {items.map((method, index) => (
        <div key={method.id} className="admin-section">
          <div className="admin-row" style={{ alignItems: "center" }}>
            <IconSelect
              value={method.icon}
              onChange={(icon) => update(index, { icon })}
            />
            <input
              type="text"
              value={method.title}
              placeholder="카드 제목 (예: 전화 상담)"
              onChange={(e) => update(index, { title: e.target.value })}
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
              onClick={() => setItems(items.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </div>
          <div className="admin-field">
            <label>설명</label>
            <input
              type="text"
              value={method.description}
              onChange={(e) => update(index, { description: e.target.value })}
            />
          </div>
          <div className="admin-row">
            <div className="admin-field" style={{ flex: 1 }}>
              <label>버튼 문구</label>
              <input
                type="text"
                value={method.button_label}
                placeholder="예: 전화 예약하기"
                onChange={(e) => update(index, { button_label: e.target.value })}
              />
            </div>
            <div className="admin-field" style={{ flex: 2 }}>
              <label>버튼 링크</label>
              <input
                type="text"
                value={method.button_url}
                placeholder="예: tel:05077257223 또는 https://..."
                onChange={(e) => update(index, { button_url: e.target.value })}
              />
              <p className="field-help">
                비워 두면 버튼이 &quot;(준비중)&quot;으로 표시됩니다.
              </p>
            </div>
          </div>
          <label>
            <input
              type="checkbox"
              checked={method.published}
              onChange={(e) => update(index, { published: e.target.checked })}
              style={{ width: "auto", marginRight: "0.5rem" }}
            />
            사이트에 게시
          </label>
        </div>
      ))}
      <button
        type="button"
        className="admin-add-btn"
        onClick={() =>
          setItems([
            ...items,
            {
              id: crypto.randomUUID(),
              icon: "phone",
              title: "",
              description: "",
              button_label: "",
              button_url: "",
              sort_order: items.length,
              published: true,
            },
          ])
        }
      >
        + 카드 추가
      </button>
      <SaveBar pending={pending} result={result} />
    </form>
  );
}
