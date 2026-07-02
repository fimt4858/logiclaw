import { Fragment } from "react";

// "**단어**" 강조와 줄바꿈(\n)을 React 노드로 변환
export function renderEmphasis(text: string) {
  return text.split("\n").map((line, lineIdx, lines) => (
    <Fragment key={lineIdx}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
      {lineIdx < lines.length - 1 && <br />}
    </Fragment>
  ));
}

// 빈 줄 기준으로 문단 분리
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
