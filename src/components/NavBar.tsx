"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "홈", icon: "🏠" },
  { href: "/places", label: "가보고 싶은 곳", icon: "📍" },
  { href: "/events", label: "가족 일정", icon: "📅" },
  { href: "/news", label: "관심 뉴스", icon: "📰" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* 상단 바 (데스크탑/모바일 공통) */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className="text-lg font-bold text-brand-600">
          우리 가족 홈
        </Link>
        <nav className="hidden gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
      </header>

      {/* 하단 탭바 (모바일 전용) */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-neutral-200 bg-white sm:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                active ? "text-brand-600" : "text-neutral-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
