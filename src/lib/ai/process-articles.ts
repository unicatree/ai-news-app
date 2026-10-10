import "server-only";
import type { FeedArticle } from "@/lib/rss/fetch-feeds";
import { anthropic, NEWS_MODEL } from "./client";
import { NEWS_SYSTEM_PROMPT } from "./prompt";
import { NEWS_OUTPUT_SCHEMA, type ProcessedArticle } from "./schema";

const BATCH_SIZE = 8;
const DEFAULT_CATEGORY = "기타";
const RESERVED_CATEGORY = "전체";
const CATEGORY_MAX_LENGTH = 20;

// Claude에 보낼 기사. id는 요청 안에서만 쓰는 짧은 값("a1", "a2"…)이다.
export type ArticleToProcess = FeedArticle & { id: string };

export type ProcessArticlesResult = {
  processed: Map<string, ProcessedArticle>;
  failedCount: number; // 처리하지 못한 기사 수
};

// 기사를 배치로 나눠 동시에 처리한다. 일부 배치가 실패해도 나머지 결과는 돌려준다.
// 다른 배치에 있는 같은 사건도 찾을 수 있도록 모든 배치에 전체 기사의 제목 목록을 함께 보낸다.
export async function processArticles(
  items: ArticleToProcess[],
  categories: string[],
): Promise<ProcessArticlesResult> {
  const allArticles = items.map((a) => ({ id: a.id, source: a.source, title: a.originalTitle }));
  const batches = chunk(items, BATCH_SIZE);
  const results = await Promise.allSettled(
    batches.map((batch) => processBatch(batch, allArticles, categories)),
  );

  // 전부 실패하면 원인(인증·결제 오류 등)을 호출한 쪽에서 알 수 있게 첫 오류를 던진다.
  const firstFailure = results.find((r) => r.status === "rejected");
  if (firstFailure && results.every((r) => r.status === "rejected")) throw firstFailure.reason;

  const processed = new Map<string, ProcessedArticle>();
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[ai] 배치 ${i + 1}/${batches.length} 처리 실패`, result.reason);
      return;
    }
    for (const [id, article] of result.value) processed.set(id, article);
  });

  const ids = new Set(items.map((a) => a.id));
  for (const article of processed.values()) {
    // 없는 기사나 자기 자신을 가리키면 중복이 아닌 것으로 본다.
    if (article.duplicateOf && !ids.has(article.duplicateOf)) article.duplicateOf = null;
  }
  for (const [id, article] of processed) {
    if (article.duplicateOf === id) article.duplicateOf = null;
  }

  return { processed, failedCount: items.length - processed.size };
}

async function processBatch(
  batch: ArticleToProcess[],
  allArticles: { id: string; source: string; title: string }[],
  categories: string[],
): Promise<Map<string, ProcessedArticle>> {
  const input = {
    categories,
    allArticles,
    articles: batch.map((a) => ({ id: a.id, source: a.source, title: a.originalTitle, summary: a.summary })),
  };

  const response = await anthropic.messages.create({
    model: NEWS_MODEL,
    max_tokens: 16000,
    output_config: {
      format: { type: "json_schema", schema: NEWS_OUTPUT_SCHEMA },
    },
    system: NEWS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(input) }],
  });

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Claude 응답이 끝나지 않았습니다: ${response.stop_reason}`);
  }
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Claude 응답에 텍스트가 없습니다.");

  const parsed = JSON.parse(text) as { articles: Record<string, unknown>[] };
  const batchIds = new Set(batch.map((a) => a.id));
  const out = new Map<string, ProcessedArticle>();

  for (const item of parsed.articles) {
    const id = asText(item.id);
    const titleKo = asText(item.titleKo);
    const summaryKo = asText(item.summaryKo);
    if (!batchIds.has(id) || !titleKo || !summaryKo || out.has(id)) continue;
    out.set(id, {
      titleKo,
      summaryKo,
      category: toCategory(asText(item.category)),
      duplicateOf: asText(item.duplicateOf) || null,
    });
  }
  return out;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// 비어 있거나 너무 길거나 예약어인 카테고리는 "기타"로 둔다.
function toCategory(name: string): string {
  if (!name || name === RESERVED_CATEGORY || name.length > CATEGORY_MAX_LENGTH) return DEFAULT_CATEGORY;
  return name;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
