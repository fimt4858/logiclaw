"use client";

import Link from "next/link";
import { useTransition } from "react";
import { moveItem } from "@/lib/actions/content";
import { publicImageUrl } from "@/lib/storage";

type Row = {
  id: string;
  title: string;
  imagePath: string;
  published: boolean;
};

type Props = {
  rows: Row[];
  table: "practice_areas" | "staff_members";
  basePath: string;
};

export default function SortableList({ rows, table, basePath }: Props) {
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return <p className="admin-help">등록된 항목이 없습니다.</p>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th style={{ width: "70px" }}>사진</th>
          <th>이름</th>
          <th style={{ width: "80px" }}>상태</th>
          <th style={{ width: "130px" }}>순서</th>
          <th style={{ width: "70px" }}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id}>
            <td>
              {row.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="admin-thumb"
                  src={publicImageUrl(row.imagePath)}
                  alt=""
                />
              ) : (
                <span className="admin-thumb" style={{ display: "inline-block" }} />
              )}
            </td>
            <td>{row.title}</td>
            <td>
              <span className={`admin-pill${row.published ? " on" : ""}`}>
                {row.published ? "게시중" : "숨김"}
              </span>
            </td>
            <td>
              <button
                type="button"
                className="admin-icon-btn"
                aria-label="위로"
                disabled={pending || index === 0}
                onClick={() =>
                  startTransition(() =>
                    moveItem(table, row.id, "up").then(() => undefined)
                  )
                }
              >
                ↑
              </button>{" "}
              <button
                type="button"
                className="admin-icon-btn"
                aria-label="아래로"
                disabled={pending || index === rows.length - 1}
                onClick={() =>
                  startTransition(() =>
                    moveItem(table, row.id, "down").then(() => undefined)
                  )
                }
              >
                ↓
              </button>
            </td>
            <td>
              <Link href={`${basePath}/${row.id}`}>편집</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
