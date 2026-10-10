"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { fetchRecentArticles } from "@/lib/rss/fetch-feeds";

const RESERVED = ["전체", "기타"];
const DEFAULT_CATEGORY = "기타";
const MAX_LENGTH = 20;

export type AddCategoryResult = { error?: string };

export async function addCategory(formData: FormData): Promise<AddCategoryResult> {
  const { userId } = await auth.protect();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "카테고리 이름을 입력해 주세요." };
  if (name.length > MAX_LENGTH) return { error: `${MAX_LENGTH}자 이내로 입력해 주세요.` };
  if (RESERVED.includes(name)) return { error: "이미 있는 카테고리입니다." };

  const inserted = await db
    .insert(categories)
    .values({ userId, name })
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
    .returning({ id: categories.id });
  if (inserted.length === 0) return { error: "이미 있는 카테고리입니다." };

  revalidatePath("/dashboard");
  return {};
}

export type FetchNewsResult =
  | { ok: true; inserted: number; skipped: number; failedSources: string[] }
  | { ok: false; error: string };

// 최근 24시간 RSS 기사를 articles에 저장한다.
// TODO(PRD 3단계): Claude 번역·요약·카테고리 분류 전까지 원제목·원문 요약·"기타"를 임시로 넣는다.
export async function fetchNews(): Promise<FetchNewsResult> {
  const { userId } = await auth.protect();

  const { articles: items, failedSources } = await fetchRecentArticles();
  if (items.length === 0 && failedSources.length > 0) {
    return { ok: false, error: "뉴스를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  let inserted = 0;
  if (items.length > 0) {
    // 이미 저장한 URL은 (userId, originalUrl) 유니크 제약으로 건너뛴다.
    const rows = await db
      .insert(articles)
      .values(
        items.map((a) => ({
          userId,
          source: a.source,
          originalUrl: a.originalUrl,
          originalTitle: a.originalTitle,
          author: a.author,
          titleKo: a.originalTitle,
          summaryKo: a.summary,
          category: DEFAULT_CATEGORY,
          imageUrl: a.imageUrl,
          publishedAt: a.publishedAt,
        })),
      )
      .onConflictDoNothing({ target: [articles.userId, articles.originalUrl] })
      .returning({ id: articles.id });
    inserted = rows.length;
  }

  revalidatePath("/dashboard");
  return { ok: true, inserted, skipped: items.length - inserted, failedSources };
}
