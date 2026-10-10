import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { AppHeader } from "@/components/app-header";
import { AddCategoryButton } from "@/components/add-category-button";
import { SavedNewsGrid } from "@/components/saved-news-grid";
import { articleToNewsItem } from "@/lib/sources";

export const metadata: Metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

const ALL = "전체";
const DEFAULT_CATEGORY = "기타";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { userId } = await auth.protect();

  const param = (await searchParams).category;
  const selected = typeof param === "string" && param ? param : ALL;

  const [categoryRows, articleRows] = await Promise.all([
    db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.createdAt)),
    db
      .select()
      .from(articles)
      .where(
        selected === ALL
          ? eq(articles.userId, userId)
          : and(eq(articles.userId, userId), eq(articles.category, selected)),
      )
      .orderBy(desc(articles.savedAt)),
  ]);

  // "기타"는 항상 있고 맨 뒤에 둔다.
  const categoryNames = [
    ALL,
    ...categoryRows.map((c) => c.name).filter((n) => n !== DEFAULT_CATEGORY),
    DEFAULT_CATEGORY,
  ];
  const items = articleRows.map(articleToNewsItem);

  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                대시보드
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                저장한 AI 뉴스를 최신순으로 모아 보여드립니다.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {selected === ALL ? "저장한 뉴스" : selected}
              <span className="ml-1.5 font-semibold text-slate-900 dark:text-slate-100">{items.length}개</span>
            </p>
          </section>

          <div className="mt-8 border-b border-slate-200 dark:border-slate-800" />

          {/* pb-6: 카드 목록과의 간격 + 카테고리 추가 오류 문구가 들어갈 자리 */}
          <div className="-mx-4 mt-4 flex items-start gap-2 overflow-x-auto px-4 pb-6 sm:mx-0 sm:flex-wrap sm:px-0">
            {categoryNames.map((c) => (
              <Link
                key={c}
                href={c === ALL ? "/dashboard" : `/dashboard?category=${encodeURIComponent(c)}`}
                aria-current={selected === c ? "page" : undefined}
                className={`inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-sm font-medium transition ${
                  selected === c
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
                }`}
              >
                {c}
              </Link>
            ))}
            <AddCategoryButton />
          </div>

          {items.length > 0 ? (
            <SavedNewsGrid items={items} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {selected === ALL ? (
                <>
                  아직 저장한 뉴스가 없습니다.{" "}
                  <Link href="/" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                    뉴스를 가져와 저장해 보세요.
                  </Link>
                </>
              ) : (
                "이 카테고리에 저장한 뉴스가 없습니다."
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
