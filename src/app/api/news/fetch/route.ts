import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, type Article } from "@/db/schema";
import { processArticles, type ArticleToProcess } from "@/lib/ai/process-articles";
import { mergeDuplicates } from "@/lib/news/merge-duplicates";
import type { FetchNewsResponse, NewsItem } from "@/lib/news-types";
import { fetchRecentArticles } from "@/lib/rss/fetch-feeds";
import { articleToNewsItem } from "@/lib/sources";

const DEFAULT_CATEGORY = "기타";

// RSS 수집 → 이미 저장한 뉴스 빼기 → Claude 번역·요약·분류 → 같은 사건 합치기.
// 결과는 화면에만 보여주고 DB에는 저장하지 않는다(저장은 /api/news/save).
export async function POST() {
  const { userId } = await auth();
  if (!userId) return json({ error: "로그인이 필요합니다." }, 401);

  const { articles: feedItems, failedSources } = await fetchRecentArticles();
  if (feedItems.length === 0) {
    if (failedSources.length > 0) {
      return json({ error: "뉴스를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 502);
    }
    return json({ items: [], failedSources, failedCount: 0 });
  }

  // 이번에 가져온 기사는 모두 이 시각 이후에 발행됐으므로 그 이후 저장분만 비교하면 된다.
  const since = new Date(Math.min(...feedItems.map((a) => a.publishedAt.getTime())));
  const [savedRows, categoryRows] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(and(eq(articles.userId, userId), gte(articles.publishedAt, since))),
    db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.createdAt)),
  ]);

  // 합쳐 저장한 뉴스의 다른 출처 URL도 "저장됨"으로 본다.
  const savedByUrl = new Map<string, Article>();
  for (const row of savedRows) {
    savedByUrl.set(row.originalUrl, row);
    for (const url of row.relatedUrls) savedByUrl.set(url, row);
  }
  const savedItems = new Map<string, NewsItem>();
  for (const a of feedItems) {
    const row = savedByUrl.get(a.originalUrl);
    if (row && !savedItems.has(row.id)) savedItems.set(row.id, articleToNewsItem(row));
  }

  const categoryNames = [
    ...categoryRows.map((c) => c.name).filter((n) => n !== DEFAULT_CATEGORY),
    DEFAULT_CATEGORY,
  ];

  // 이미 저장한 뉴스는 Claude에 보내지 않는다.
  const toProcess: ArticleToProcess[] = feedItems
    .filter((a) => !savedByUrl.has(a.originalUrl))
    .map((a, i) => ({ ...a, id: `a${i + 1}` }));

  let newItems: NewsItem[] = [];
  let failedCount = 0;
  if (toProcess.length > 0) {
    try {
      const result = await processArticles(toProcess, categoryNames);
      newItems = mergeDuplicates(toProcess, result.processed, categoryNames);
      failedCount = result.failedCount;
    } catch (error) {
      console.error("[api/news/fetch] Claude 처리 실패", error);
      return json({ error: claudeErrorMessage(error) }, 502);
    }
  }

  const items = [...newItems, ...savedItems.values()].sort(
    (x, y) => Date.parse(y.publishedAt) - Date.parse(x.publishedAt),
  );
  return json({ items, failedSources, failedCount });
}

function json(body: FetchNewsResponse, status = 200) {
  return Response.json(body, { status });
}

function claudeErrorMessage(error: unknown): string {
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError ||
    error instanceof Anthropic.BadRequestError
  ) {
    return "Claude API를 사용할 수 없습니다. API 키와 결제(크레딧) 상태를 확인해 주세요.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "요청이 많아 지금은 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }
  return "뉴스를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
