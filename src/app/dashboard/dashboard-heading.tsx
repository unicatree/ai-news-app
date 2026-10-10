import { FetchNewsButton } from "./fetch-news-button";

export function DashboardHeading() {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">대시보드</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          저장한 AI 뉴스를 최신순으로 모아 보여드립니다.
        </p>
      </div>
      <FetchNewsButton />
    </section>
  );
}
