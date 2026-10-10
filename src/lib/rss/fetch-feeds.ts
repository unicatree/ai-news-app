import "server-only";
import Parser from "rss-parser";
import { RSS_FEEDS } from "./feeds";
import { normalizeUrl } from "./normalize-url";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const SUMMARY_MAX_LENGTH = 500;

export type FeedArticle = {
  source: string;
  originalUrl: string; // 정규화된 URL
  originalTitle: string;
  author: string | null;
  summary: string; // RSS 원문 요약 (HTML 제거)
  imageUrl: string | null;
  publishedAt: Date;
};

export type FetchFeedsResult = {
  articles: FeedArticle[];
  failedSources: string[];
};

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; ai-news-collector)" },
});

// 두 피드를 동시에 읽어 최근 24시간 기사만 URL 기준으로 중복 없이 돌려준다.
// 한 피드가 실패해도 나머지 결과는 돌려주고, 실패한 출처 이름을 함께 알려준다.
export async function fetchRecentArticles(now = new Date()): Promise<FetchFeedsResult> {
  const since = now.getTime() - WINDOW_MS;
  const results = await Promise.allSettled(RSS_FEEDS.map((feed) => parser.parseURL(feed.url)));

  const byUrl = new Map<string, FeedArticle>();
  const failedSources: string[] = [];

  results.forEach((result, i) => {
    const source = RSS_FEEDS[i].name;
    if (result.status === "rejected") {
      console.error(`[rss] ${source} 피드를 가져오지 못했습니다.`, result.reason);
      failedSources.push(source);
      return;
    }

    for (const item of result.value.items) {
      const originalUrl = item.link ? normalizeUrl(item.link) : null;
      const title = item.title ? decodeEntities(item.title).trim() : "";
      const dateStr = item.isoDate ?? item.pubDate;
      const publishedAt = dateStr ? new Date(dateStr) : null;
      if (!originalUrl || !title || !publishedAt || Number.isNaN(publishedAt.getTime())) continue;
      if (publishedAt.getTime() < since || byUrl.has(originalUrl)) continue;

      byUrl.set(originalUrl, {
        source,
        originalUrl,
        originalTitle: title,
        author: item.creator ?? (item as { author?: string }).author ?? null,
        summary: toSummary(item.summary ?? item.contentSnippet ?? ""),
        imageUrl: item.enclosure?.url ?? firstImageUrl(item.content),
        publishedAt,
      });
    }
  });

  return { articles: [...byUrl.values()], failedSources };
}

function toSummary(html: string): string {
  const text = decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s*\[…\]\s*$/, "…")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > SUMMARY_MAX_LENGTH ? `${text.slice(0, SUMMARY_MAX_LENGTH).trimEnd()}…` : text;
}

function firstImageUrl(html?: string): string | null {
  const src = html?.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  return src ? decodeEntities(src) : null;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isNaN(n) ? match : String.fromCodePoint(n);
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}
