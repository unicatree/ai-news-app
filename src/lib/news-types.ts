// 화면에 보여주는 뉴스 카드 한 장의 데이터.
// "가져온 뉴스"(/api/news/fetch 결과)와 "저장한 뉴스"(articles 행) 모두 이 형태로 맞춘다.
export type NewsSource = {
  name: string; // "TechCrunch" | "The Verge"
  url: string; // 정규화된 원문 URL
};

export type NewsItem = {
  id: string;
  // 첫 번째가 대표 출처. 같은 사건을 합친 카드는 출처가 여러 개다.
  sources: NewsSource[];
  originalTitle: string;
  author?: string | null;
  titleKo: string;
  summaryKo: string;
  category: string;
  isNewCategory?: boolean;
  imageUrl?: string | null;
  publishedAt: string; // ISO 8601
  saved: boolean;
  notionPageUrl?: string | null;
};

// POST /api/news/fetch 응답
export type FetchNewsResponse =
  | {
      items: NewsItem[];
      failedSources: string[]; // 가져오지 못한 RSS 출처
      failedCount: number; // Claude 처리에 실패해 빠진 기사 수
    }
  | { error: string };
