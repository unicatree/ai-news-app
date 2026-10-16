"use client";

import { useState } from "react";
import { MAX_QUERY_LENGTH } from "@/lib/keyword-search";

type Props = {
  // 지금 적용된 검색어. 바뀌면 부모에서 key로 다시 마운트해 입력 칸을 맞춘다.
  query: string;
  onSearch: (query: string) => void;
  pending?: boolean;
};

// 카드 목록 위 키워드 검색 줄. '검색' 버튼이나 Enter로 검색하고, 빈 칸으로 검색하면 검색을 푼다.
export function KeywordSearch({ query, onSearch, pending = false }: Props) {
  const [value, setValue] = useState(query);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
      className="mt-4 flex items-center gap-2 sm:justify-end"
    >
      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        >
          <path
            d="M9 15A6 6 0 1 0 9 3a6 6 0 0 0 0 12ZM13.5 13.5 17 17"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX_QUERY_LENGTH}
          placeholder="제목·요약에서 키워드 검색"
          aria-label="뉴스 키워드 검색"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-9 pl-9 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-blue-700 dark:focus:ring-blue-950"
        />
        {pending && (
          <svg
            viewBox="0 0 20 20"
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-blue-600 dark:text-blue-400"
            aria-hidden
          >
            <path d="M16 10a6 6 0 1 1-6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-10 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        검색
      </button>
      {query && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
          disabled={pending}
          className="shrink-0 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-400 dark:hover:text-slate-100"
        >
          지우기
        </button>
      )}
    </form>
  );
}
