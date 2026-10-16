import { FetchNewsButton } from "./fetch-news-button";

// total이 없으면(loading.tsx) 배지를 그리지 않는다.
export function DashboardHeading({ total }: { total?: number }) {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            대시보드
          </h1>
          {total !== undefined && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
              총 {total.toLocaleString("ko-KR")}개의 뉴스
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          저장한 AI 뉴스를 최신순으로 모아 보여드립니다.
        </p>
      </div>
      <FetchNewsButton />
    </section>
  );
}
