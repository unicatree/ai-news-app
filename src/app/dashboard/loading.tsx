import { SavedNewsGridSkeleton } from "@/components/saved-news-grid";
import { DashboardHeading } from "./dashboard-heading";

// 처음 /dashboard에 들어올 때 보여주는 화면
export default function DashboardLoading() {
  return (
    <>
      <DashboardHeading />
      <div className="mt-8 border-b border-slate-200 dark:border-slate-800" />
      <div className="mt-4 flex gap-2 overflow-hidden" aria-hidden>
        {[14, 20, 16, 24, 12].map((w, i) => (
          <div
            key={i}
            style={{ width: `${w * 4}px` }}
            className="h-9 shrink-0 animate-pulse rounded-full bg-slate-200 sm:h-8 dark:bg-slate-800"
          />
        ))}
      </div>
      <SavedNewsGridSkeleton />
    </>
  );
}
