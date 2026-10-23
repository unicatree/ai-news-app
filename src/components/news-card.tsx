import type { NewsItem } from "@/lib/news-types";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

type Props = {
  item: NewsItem;
  // "fetched": 가져온 뉴스 탭(저장하기), "saved": 저장한 뉴스 탭(뉴스저장 → 노션 데이터베이스)
  variant: "fetched" | "saved";
  busy?: boolean;
  onSave?: () => void;
  onNotionSave?: () => void;
  // 있으면 오른쪽 위에 삭제(X) 버튼을 보여준다. (저장한 뉴스 탭)
  onDelete?: () => void;
};

export function NewsCard({ item, variant, busy, onSave, onNotionSave, onDelete }: Props) {
  const merged = item.sources.length > 1;

  return (
    <article
      aria-busy={busy || undefined}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-within:border-blue-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 dark:focus-within:border-blue-900"
    >
      {item.imageUrl && (
        <div className="aspect-[16/9] overflow-hidden border-b border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
          {/* 외부 RSS 이미지라 next/image 원격 패턴 설정 없이 그대로 표시한다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
        </div>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="뉴스 삭제"
          title="삭제"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 text-slate-500 ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 dark:bg-slate-900/90 dark:text-slate-400 dark:ring-slate-800 dark:hover:bg-red-950/50 dark:hover:text-red-300"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* 머리 줄: 무엇에 관한 뉴스인지(카테고리) + 언제(발행일) */}
        <div
          className={
            "flex items-start justify-between gap-3" + (onDelete && !item.imageUrl ? " pr-9" : "")
          }
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {item.category}
            </span>
            {item.isNewCategory && !item.saved && (
              <span className="rounded-full border border-dashed border-blue-300 px-2 py-0.5 text-xs text-blue-600 dark:border-blue-800 dark:text-blue-400">
                새 카테고리
              </span>
            )}
            {merged && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {item.sources.length}개 출처
              </span>
            )}
          </div>
          <time
            dateTime={item.publishedAt}
            className="shrink-0 pt-0.5 text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400"
          >
            {dateFormat.format(new Date(item.publishedAt))}
          </time>
        </div>

        {/* 제목이 대표 원문 링크다. 카드에서 가장 자주 누르는 곳이라 hover 반응도 여기에만 준다. */}
        <h2 className="mt-3.5 wrap-break-word text-pretty text-lg font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-50">
          <a
            href={item.sources[0]?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm decoration-blue-300 decoration-2 underline-offset-4 transition-colors hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:decoration-blue-800 dark:hover:text-blue-300"
          >
            {item.titleKo}
          </a>
        </h2>

        <p className="mt-2.5 wrap-break-word text-[15px] leading-7 text-slate-600 dark:text-slate-300">
          {item.summaryKo}
        </p>
      </div>

      {/* 하단 줄: 출처 이름이 곧 원문 링크다. 출처를 따로 한 번 더 쓰지 않는다. */}
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-1">
          {item.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-slate-700 transition-colors hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:text-blue-300"
            >
              {s.name}
              <span className="font-medium text-blue-600 dark:text-blue-400">원문</span>
              <ArrowUpRight />
            </a>
          ))}
        </div>

        {variant === "fetched" ? (
          item.saved ? (
            <StatusBadge>저장됨</StatusBadge>
          ) : (
            <PrimaryButton onClick={onSave} busy={busy}>
              {busy ? "저장 중…" : "저장하기"}
            </PrimaryButton>
          )
        ) : item.notionPageUrl ? (
          <a
            href={item.notionPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <StatusBadge>저장됨 ↗</StatusBadge>
          </a>
        ) : (
          <PrimaryButton onClick={onNotionSave} busy={busy} outline>
            {busy ? "저장 중…" : "뉴스저장"}
          </PrimaryButton>
        )}
      </div>
    </article>
  );
}

// busy면 버튼을 막고 글자 앞에 회전 아이콘을 보여준다.
function PrimaryButton({
  children,
  outline,
  busy,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { outline?: boolean; busy?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={busy || disabled}
      className={
        "inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition sm:h-9 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60 " +
        (outline
          ? "border border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950"
          : "bg-blue-600 text-white hover:bg-blue-700")
      }
    >
      {busy && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 animate-spin" aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 text-sm font-medium text-slate-500 sm:h-9 sm:w-auto dark:bg-slate-800 dark:text-slate-400">
      <svg viewBox="0 0 16 16" className="size-4 text-blue-600 dark:text-blue-400" aria-hidden>
        <path
          d="M3.5 8.5l3 3 6-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </span>
  );
}

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5 text-blue-600 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transition-none dark:text-blue-400"
      aria-hidden
    >
      <path
        d="M5 11L11 5M6 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 실제 카드와 같은 구조(본문 + 하단 액션 줄)로 둬서 카드로 바뀔 때 높이가 튀지 않게 한다.
export function NewsCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800/70" />
        </div>
        <div className="mt-3.5 space-y-2">
          <div className="h-6 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-4 rounded bg-slate-100 dark:bg-slate-800/70" />
          <div className="h-4 rounded bg-slate-100 dark:bg-slate-800/70" />
          <div className="h-4 rounded bg-slate-100 dark:bg-slate-800/70" />
          <div className="h-4 w-4/5 rounded bg-slate-100 dark:bg-slate-800/70" />
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-10 w-full rounded-lg bg-slate-200 sm:h-9 sm:w-24 dark:bg-slate-800" />
      </div>
    </div>
  );
}
