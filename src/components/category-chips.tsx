"use client";

import Link, { useLinkStatus } from "next/link";
import { AddCategoryButton } from "@/components/add-category-button";

type Props = {
  names: string[];
  selected: string;
  allLabel: string;
};

// 카드 목록 위 카테고리 칩 줄.
// 모바일: 칩은 가로 스크롤, "카테고리 추가"는 스크롤 밖 오른쪽에 고정.
// sm 이상: 스크롤 래퍼를 display: contents로 풀어 추가 버튼이 칩 맨 끝에 이어 붙는다.
export function CategoryChips({ names, selected, allLabel }: Props) {
  return (
    <div className="mt-4 flex items-start gap-2 sm:flex-wrap">
      <div className="-ml-4 flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 pl-4 sm:contents">
        {names.map((name) => (
          <Link
            key={name}
            href={name === allLabel ? "/dashboard" : `/dashboard?category=${encodeURIComponent(name)}`}
            scroll={false}
            aria-current={selected === name ? "page" : undefined}
            className="shrink-0 rounded-full"
          >
            <Chip label={name} active={selected === name} />
          </Link>
        ))}
      </div>
      <AddCategoryButton />
    </div>
  );
}

// useLinkStatus는 Link의 자식에서만 쓸 수 있어 칩 모양을 따로 뺀다.
function Chip({ label, active }: { label: string; active: boolean }) {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition sm:h-8 ${
        active
          ? "bg-blue-600 text-white"
          : pending
            ? "bg-blue-600/70 text-white"
            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </span>
  );
}
