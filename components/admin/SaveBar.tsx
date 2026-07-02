"use client";

import type { ActionResult } from "@/lib/actions/content";

type Props = {
  pending: boolean;
  result: ActionResult | null;
  label?: string;
};

export default function SaveBar({ pending, result, label = "저장" }: Props) {
  return (
    <div className="admin-save-bar">
      <button type="submit" disabled={pending}>
        {pending ? "저장 중..." : label}
      </button>
      {result && result.message && (
        <span
          className={`admin-save-message ${result.ok ? "success" : "error"}`}
        >
          {result.message}
        </span>
      )}
    </div>
  );
}
