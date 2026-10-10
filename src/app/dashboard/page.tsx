import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { CategoryChips } from "@/components/category-chips";
import { SavedNewsGrid, SavedNewsGridSkeleton } from "@/components/saved-news-grid";
import { articleToNewsItem } from "@/lib/sources";
import { DashboardHeading } from "./dashboard-heading";

export const metadata: Metadata = {
  title: "대시보드 | AI 뉴스 수집기",
};

const ALL = "전체";
const DEFAULT_CATEGORY = "기타";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { userId } = await auth.protect();

  const categoryRows = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.createdAt));

  // "기타"는 항상 있고 맨 뒤에 둔다.
  const categoryNames = [
    ALL,
    ...categoryRows.map((c) => c.name).filter((n) => n !== DEFAULT_CATEGORY),
    DEFAULT_CATEGORY,
  ];

  // 목록에 없는 카테고리가 주소로 들어오면 전체로 본다.
  const param = (await searchParams).category;
  const selected = typeof param === "string" && categoryNames.includes(param) ? param : ALL;

  return (
    <>
      <DashboardHeading />
      <div className="mt-8 border-b border-slate-200 dark:border-slate-800" />
      <CategoryChips names={categoryNames} selected={selected} allLabel={ALL} />

      {/* 카테고리를 바꾸면 key가 바뀌어 칩 줄은 그대로 두고 카드 자리만 스켈레톤으로 바뀐다. */}
      <Suspense key={selected} fallback={<SavedNewsGridSkeleton />}>
        <ArticleList userId={userId} selected={selected} />
      </Suspense>
    </>
  );
}

async function ArticleList({ userId, selected }: { userId: string; selected: string }) {
  const rows = await db
    .select()
    .from(articles)
    .where(
      selected === ALL
        ? eq(articles.userId, userId)
        : and(eq(articles.userId, userId), eq(articles.category, selected)),
    )
    .orderBy(desc(articles.savedAt));

  if (rows.length === 0) {
    return selected === ALL ? <NoArticles /> : <EmptyCategory name={selected} />;
  }

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        {selected === ALL ? "저장한 뉴스" : selected}
        <span className="ml-1.5 font-semibold text-slate-900 dark:text-slate-100">{rows.length}개</span>
      </p>
      <SavedNewsGrid items={rows.map(articleToNewsItem)} />
    </div>
  );
}

// 저장한 뉴스가 하나도 없을 때
function NoArticles() {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
          <path
            d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5ZM13.5 3.5V8H18M9 12.5h6M9 16h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">아직 저장한 뉴스가 없어요</h2>
      <p className="mt-1 max-w-sm text-[15px] leading-7 text-slate-500 dark:text-slate-400">
        뉴스를 가져와서 마음에 드는 기사를 저장하면 여기에 모입니다.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
      >
        뉴스 가져오러 가기
      </Link>
    </div>
  );
}

// 고른 카테고리에 저장한 뉴스가 없을 때
function EmptyCategory({ name }: { name: string }) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
      <p className="text-[15px] text-slate-500 dark:text-slate-400">
        ‘{name}’ 카테고리에 저장한 뉴스가 없습니다.
      </p>
      <Link
        href="/dashboard"
        scroll={false}
        className="mt-4 inline-flex h-9 items-center rounded-lg border border-blue-200 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
      >
        전체 보기
      </Link>
    </div>
  );
}
