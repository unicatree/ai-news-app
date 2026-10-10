"use client";

import { NewsCard, NewsCardSkeleton } from "@/components/news-card";
import type { NewsItem } from "@/lib/news-types";

const gridClass = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

// 저장한 뉴스 카드 그리드. 카드 버튼 핸들러 때문에 클라이언트 컴포넌트로 둔다.
export function SavedNewsGrid({ items }: { items: NewsItem[] }) {
  return (
    <div className={gridClass}>
      {items.map((item) => (
        <NewsCard
          key={item.id}
          item={item}
          variant="saved"
          // TODO(PRD 6단계): POST /api/notion/save 연결
          onNotionSave={() => alert("Notion 저장은 6단계에서 연결합니다.")}
        />
      ))}
    </div>
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
