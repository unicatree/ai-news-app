import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/", label: "뉴스 가져오기" },
  { href: "/dashboard", label: "대시보드" },
];

// 로그인 후 모든 화면 공통 헤더
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
          <span className="grid size-7 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white">
            AI
          </span>
          AI 뉴스 수집기
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {l.label}
            </Link>
          ))}
          <UserButton />
        </nav>
      </div>
    </header>
  );
}
