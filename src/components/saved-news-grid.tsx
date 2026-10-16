"use client";

import { useState } from "react";
import { deleteArticle } from "@/app/dashboard/actions";
import { NewsCard, NewsCardSkeleton } from "@/components/news-card";
import type { NewsItem, NotionSaveResponse } from "@/lib/news-types";

const gridClass = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

// 저장한 뉴스 카드 그리드. 카드 버튼 핸들러 때문에 클라이언트 컴포넌트로 둔다.
export function SavedNewsGrid({ items }: { items: NewsItem[] }) {
  // 이번 화면에서 노션에 저장한 뉴스의 페이지 URL (id → URL)
  const [notionUrls, setNotionUrls] = useState<Record<string, string>>({});
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // 삭제를 누른 뉴스는 서버 응답을 기다리지 않고 바로 숨긴다. 실패하면 다시 보여준다.
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  async function removeArticle(id: string) {
    setRemovedIds((prev) => [...prev, id]);
    setError(null);
    try {
      const result = await deleteArticle(id);
      if (result.error) throw new Error(result.error);
    } catch (e) {
      setRemovedIds((prev) => prev.filter((r) => r !== id));
      setError(e instanceof Error ? e.message : "뉴스를 삭제하지 못했습니다.");
    }
  }

  async function saveToNotion(id: string) {
    setBusyIds((prev) => [...prev, id]);
    setError(null);
    try {
      const res = await fetch("/api/notion/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id }),
      });
      const data: NotionSaveResponse | null = await res.json().catch(() => null);
      if (!res.ok || !data || "error" in data) {
        throw new Error(data && "error" in data ? data.error : "노션에 저장하지 못했습니다.");
      }
      setNotionUrls((prev) => ({ ...prev, [id]: data.notionPageUrl }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "노션에 저장하지 못했습니다.");
    } finally {
      setBusyIds((prev) => prev.filter((b) => b !== id));
    }
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}
      <div className={gridClass}>
        {items
          .filter((item) => !removedIds.includes(item.id))
          .map((item) => (
            <NewsCard
              key={item.id}
              item={notionUrls[item.id] ? { ...item, notionPageUrl: notionUrls[item.id] } : item}
              variant="saved"
              busy={busyIds.includes(item.id)}
              onNotionSave={() => saveToNotion(item.id)}
              onDelete={() => removeArticle(item.id)}
            />
          ))}
      </div>
    </>
  );
}

// 개수 줄 + 카드 6장 자리
export function SavedNewsGridSkeleton() {
  return (
    <div className="mt-6" role="status" aria-label="뉴스를 불러오는 중">
      <div className="mb-4 h-5 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className={gridClass}>
        {Array.from({ length: 6 }, (_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
