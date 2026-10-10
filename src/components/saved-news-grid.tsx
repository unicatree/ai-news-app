"use client";

import { NewsCard } from "@/components/news-card";
import type { NewsItem } from "@/lib/news-types";

// 저장한 뉴스 카드 그리드. 카드 버튼 핸들러 때문에 클라이언트 컴포넌트로 둔다.
export function SavedNewsGrid({ items }: { items: NewsItem[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
