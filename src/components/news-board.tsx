"use client";

import { useMemo, useState } from "react";
import { NewsCard, NewsCardSkeleton } from "@/components/news-card";
import type { NewsItem } from "@/lib/news-types";

type Tab = "fetched" | "saved";
const ALL = "전체";

type Props = {
  initialItems: NewsItem[];
  isSample?: boolean;
};

export function NewsBoard({ initialItems, isSample }: Props) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<Tab>("fetched");
  const [category, setCategory] = useState(ALL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // TODO(PRD 4단계): "저장한 뉴스"는 GET /api/news/saved로 불러온다. 지금은 화면 상태 기준.
  const tabItems = tab === "fetched" ? items : items.filter((i) => i.saved);
  const categories = useMemo(
    () => [ALL, ...new Set(tabItems.map((i) => i.category))],
    [tabItems],
  );
  const visible = category === ALL ? tabItems : tabItems.filter((i) => i.category === category);
  const unsavedVisible = visible.filter((i) => !i.saved);

  async function fetchNews() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "뉴스를 가져오지 못했습니다.");
      setItems(data.items);
      setCategory(ALL);
    } catch (e) {
      setError(e instanceof Error ? e.message : "뉴스를 가져오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // TODO(PRD 4단계): POST /api/news/save 연결. 지금은 화면 상태만 바꾼다.
  function markSaved(ids: string[]) {
    setItems((prev) => prev.map((i) => (ids.includes(i.id) ? { ...i, saved: true } : i)));
  }

  function saveAll() {
    markSaved(unsavedVisible.map((i) => i.id));
    setNotice(`${unsavedVisible.length}개 저장됨`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            오늘의 AI 뉴스
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            TechCrunch · The Verge의 AI 소식을 한국어로 요약해 보여드립니다.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchNews}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-70"
        >
          <svg viewBox="0 0 20 20" className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden>
            <path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5V6h-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {loading ? "가져오는 중…" : "뉴스 가져오기"}
        </button>
      </section>

      {isSample && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
          지금 보이는 카드는 화면 확인용 예시 데이터입니다.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-6" role="tablist">
          {(
            [
              ["fetched", "가져온 뉴스", items.length],
              ["saved", "저장한 뉴스", items.filter((i) => i.saved).length],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => {
                setTab(key);
                setCategory(ALL);
                setNotice(null);
              }}
              className={`-mb-px border-b-2 pb-3 text-[15px] font-semibold transition ${
                tab === key
                  ? "border-blue-600 text-blue-700 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {label}
              <span className="ml-1.5 text-sm font-medium text-slate-400">{count}</span>
            </button>
          ))}
        </div>

        {tab === "fetched" && (
          <div className="flex items-center gap-3 pb-3">
            {notice && <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{notice}</span>}
            <button
              type="button"
              onClick={saveAll}
              disabled={unsavedVisible.length === 0}
              className="h-9 rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-950"
            >
              모두 저장{unsavedVisible.length > 0 && ` (${unsavedVisible.length})`}
            </button>
          </div>
        )}
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`h-8 shrink-0 rounded-full px-3.5 text-sm font-medium transition ${
              category === c
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <NewsCardSkeleton key={i} />)
          : visible.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                variant={tab}
                onSave={() => markSaved([item.id])}
                // TODO(PRD 6단계): POST /api/notion/save 연결
                onNotionSave={() => alert("Notion 저장은 6단계에서 연결합니다.")}
              />
            ))}
      </div>

      {!loading && visible.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500 dark:border-slate-700">
          {tab === "fetched"
            ? "‘뉴스 가져오기’를 눌러 최신 AI 뉴스를 불러오세요."
            : "아직 저장한 뉴스가 없습니다."}
        </div>
      )}
    </div>
  );
}
