"use client";

import { useActionState, useState } from "react";
import { addCategory, type AddCategoryResult } from "@/app/dashboard/actions";

// 카테고리 칩 줄 맨 끝의 "+ 카테고리 추가". 누르면 그 자리에서 입력 칩으로 바뀐다.
export function AddCategoryButton() {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<AddCategoryResult, FormData>(
    async (_prev, formData) => {
      const result = await addCategory(formData);
      if (!result.error) setEditing(false);
      return result;
    },
    {},
  );

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-700 sm:h-8 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-300"
      >
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        카테고리 추가
      </button>
    );
  }

  return (
    <form action={formAction} className="relative shrink-0">
      <input
        name="name"
        autoFocus
        required
        maxLength={20}
        readOnly={pending}
        placeholder="새 카테고리"
        aria-label="새 카테고리 이름"
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
        }}
        onBlur={(e) => {
          if (!pending && !e.currentTarget.value.trim()) setEditing(false);
        }}
        className="h-9 w-36 rounded-full border border-blue-400 bg-white pl-3.5 pr-8 text-sm text-slate-900 outline-none ring-2 ring-blue-100 placeholder:text-slate-400 sm:h-8 dark:bg-slate-900 dark:text-slate-100 dark:ring-blue-950"
      />
      {pending && (
        <svg
          viewBox="0 0 20 20"
          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-blue-600 dark:text-blue-400"
          aria-label="추가하는 중"
        >
          <path d="M16 10a6 6 0 1 1-1.8-4.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
      {state.error && (
        <p
          role="alert"
          className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap text-xs text-red-600 sm:left-3.5 sm:right-auto dark:text-red-400"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
