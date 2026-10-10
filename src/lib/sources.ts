import type { Article } from "@/db/schema";
import type { NewsItem } from "@/lib/news-types";

// relatedUrls에는 URL만 저장되므로 도메인으로 출처 이름을 정한다.
export function sourceNameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.endsWith("techcrunch.com")) return "TechCrunch";
    if (host.endsWith("theverge.com")) return "The Verge";
    return host;
  } catch {
    return url;
  }
}

// articles 행 → 뉴스 카드 데이터
export function articleToNewsItem(a: Article): NewsItem {
  return {
    id: a.id,
    sources: [
      { name: a.source, url: a.originalUrl },
      ...a.relatedUrls.map((url) => ({ name: sourceNameFromUrl(url), url })),
    ],
    originalTitle: a.originalTitle,
    author: a.author,
    titleKo: a.titleKo,
    summaryKo: a.summaryKo,
    category: a.category,
    imageUrl: a.imageUrl,
    publishedAt: a.publishedAt.toISOString(),
    saved: true,
    notionPageUrl: a.notionPageUrl,
  };
}
