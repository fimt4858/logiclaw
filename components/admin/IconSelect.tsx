"use client";

import { Icon, ICON_LABELS } from "@/lib/icons";

type Props = {
  value: string;
  onChange: (icon: string) => void;
};

export default function IconSelect({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span
        style={{
          display: "inline-flex",
          width: 34,
          height: 34,
          alignItems: "center",
          justifyContent: "center",
          background: "var(--primary-color)",
          borderRadius: "50%",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <Icon name={value} className="icon-preview" />
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(ICON_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
