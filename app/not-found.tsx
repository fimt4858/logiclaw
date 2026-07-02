import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 500, color: "#333" }}>
        페이지를 찾을 수 없습니다
      </h1>
      <p style={{ color: "#666" }}>
        주소가 바뀌었거나 삭제된 페이지입니다.
      </p>
      <Link href="/" className="map-link">
        홈으로 이동
      </Link>
    </main>
  );
}
