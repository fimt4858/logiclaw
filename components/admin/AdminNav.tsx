"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";

const MENU = [
  { href: "/admin", label: "상담 접수함", exact: true },
  { href: "/admin/home", label: "홈 화면" },
  { href: "/admin/practice", label: "업무분야" },
  { href: "/admin/staff", label: "구성원" },
  { href: "/admin/contact", label: "상담 안내" },
  { href: "/admin/settings", label: "사이트 설정" },
];

export default function AdminNav({ newCount }: { newCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="admin-nav">
      <p className="admin-nav-title">사이트 관리</p>
      <ul>
        {MENU.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link href={item.href} className={active ? "active" : ""}>
                {item.label}
                {item.exact && newCount > 0 && (
                  <span className="admin-badge">{newCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="admin-nav-footer">
        <a href="/" target="_blank" rel="noopener noreferrer">
          사이트 보기
        </a>
        <button type="button" onClick={() => signOut()}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
