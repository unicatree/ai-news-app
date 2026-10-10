"use client";

import { useState, useTransition } from "react";
import { fetchNews } from "./actions";

type Status = { kind: "notice" | "error"; message: string } | null;

export function FetchNewsButton() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>(null);

  function handleClick() {
    setStatus(null);
    startTransition(async () => {
      try {
        const result = await fetchNews();
        if (!result.ok) {
          setStatus({ kind: "error", message: result.error });
          return;
        }
        const parts = [result.inserted > 0 ? `${result.inserted}개 저장됨` : "새 뉴스가 없습니다."];
        if (result.failedSources.length > 0) {
          parts.push(`${result.failedSources.join(" · ")} 피드를 가져오지 못했습니다.`);
        }
        setStatus({ kind: "notice", message: parts.join(" ") });
      } catch {
        setStatus({ kind: "error", message: "뉴스를 가져오지 못했습니다." });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg viewBox="0 0 20 20" className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden>
          <path
            d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5V6h-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {pending ? "가져오는 중…" : "뉴스 가져오기"}
      </button>

      {status?.kind === "notice" && (
        <p role="status" className="text-sm font-medium text-blue-700 dark:text-blue-400">
          {status.message}
        </p>
      )}
      {status?.kind === "error" && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
