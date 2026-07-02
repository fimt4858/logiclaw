"use client";

import { Fragment, useState, useTransition } from "react";
import {
  updateConsultationMemo,
  updateConsultationStatus,
} from "@/lib/actions/consultation";
import type { ConsultationRequest, ConsultationStatus } from "@/lib/types";

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  new: "신규",
  in_progress: "진행중",
  done: "완료",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Row({ request }: { request: ConsultationRequest }) {
  const [open, setOpen] = useState(false);
  const [memo, setMemo] = useState(request.memo);
  const [memoSaved, setMemoSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Fragment>
      <tr onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        <td className="muted">{formatDate(request.created_at)}</td>
        <td>{request.name}</td>
        <td>
          <a href={`tel:${request.phone}`} onClick={(e) => e.stopPropagation()}>
            {request.phone}
          </a>
        </td>
        <td className="muted">
          {request.message.length > 30
            ? `${request.message.slice(0, 30)}…`
            : request.message || "-"}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <select
            className={`admin-status ${request.status}`}
            value={request.status}
            disabled={pending}
            onChange={(e) =>
              startTransition(() =>
                updateConsultationStatus(
                  request.id,
                  e.target.value as ConsultationStatus
                ).then(() => undefined)
              )
            }
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ background: "#fafafa" }}>
            <div className="admin-field">
              <label>상담 내용</label>
              <p style={{ whiteSpace: "pre-wrap", color: "#444" }}>
                {request.message || "(내용 없음)"}
              </p>
            </div>
            <div className="admin-field">
              <label htmlFor={`memo-${request.id}`}>운영자 메모</label>
              <textarea
                id={`memo-${request.id}`}
                rows={3}
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                  setMemoSaved(false);
                }}
                placeholder="통화 내용, 처리 상황 등을 기록해 두세요."
              />
            </div>
            <button
              type="button"
              className="admin-add-btn"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await updateConsultationMemo(request.id, memo);
                  setMemoSaved(result?.ok ?? false);
                })
              }
            >
              {pending ? "저장 중..." : memoSaved ? "저장됨" : "메모 저장"}
            </button>
          </td>
        </tr>
      )}
    </Fragment>
  );
}

export default function InboxTable({
  requests,
}: {
  requests: ConsultationRequest[];
}) {
  if (requests.length === 0) {
    return <p className="admin-help">아직 접수된 상담 신청이 없습니다.</p>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th style={{ width: "130px" }}>접수일</th>
          <th style={{ width: "90px" }}>성함</th>
          <th style={{ width: "140px" }}>연락처</th>
          <th>내용</th>
          <th style={{ width: "100px" }}>상태</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <Row key={request.id} request={request} />
        ))}
      </tbody>
    </table>
  );
}
