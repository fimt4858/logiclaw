"use client";

import { ChevronDown } from "lucide-react";

export default function ScrollArrow() {
  return (
    <button
      type="button"
      className="scroll-arrow"
      aria-label="아래로 스크롤"
      onClick={() =>
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
      }
    >
      <ChevronDown />
    </button>
  );
}
