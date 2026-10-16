import type { NewsItem } from "@/lib/news-types";

// 서버(대시보드 검색)와 클라이언트(검색 입력·메인 필터)가 함께 쓴다.
export const MAX_QUERY_LENGTH = 100;

// 한국어 제목·요약과 원제목에서 대소문자 구분 없이 찾는다.
export function matchesQuery(item: NewsItem, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return [item.titleKo, item.summaryKo, item.originalTitle].some((t) => t.toLowerCase().includes(q));
}
