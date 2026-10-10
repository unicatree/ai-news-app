import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  // 페이지 번호 → 주소 (카테고리 등 다른 쿼리는 호출하는 쪽에서 유지)
  hrefFor: (page: number) => string;
};

const itemBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition";
const itemIdle =
  "text-slate-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800";

// 카드 목록 아래 페이지 이동 줄: 이전 · 번호 · 다음
export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지 이동" className="mt-8 flex flex-wrap items-center justify-center gap-1">
      <StepLink href={page > 1 ? hrefFor(1) : null} label="처음" />
      <StepLink href={page > 1 ? hrefFor(page - 1) : null} label="이전" />
      {pageItems(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-slate-400" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${itemBase} ${p === page ? "bg-blue-600 text-white" : itemIdle}`}
          >
            {p}
          </Link>
        ),
      )}
      <StepLink href={page < totalPages ? hrefFor(page + 1) : null} label="다음" />
      <StepLink href={page < totalPages ? hrefFor(totalPages) : null} label="끝" />
    </nav>
  );
}

function StepLink({ href, label }: { href: string | null; label: string }) {
  if (!href) {
    return (
      <span aria-disabled className={`${itemBase} cursor-not-allowed text-slate-400 opacity-60`}>
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className={`${itemBase} ${itemIdle}`}>
      {label}
    </Link>
  );
}

const SIBLINGS = 2; // 현재 페이지 앞뒤로 보여줄 번호 수

// 첫 페이지 · 현재 페이지 앞뒤 2개 · 마지막 페이지를 번호로 보여준다.
// 번호가 이어지지 않는 자리는 …(null)로 표시한다. 예) 100페이지 중 50 → 1 … 48 49 50 51 52 … 100
function pageItems(page: number, totalPages: number): (number | null)[] {
  const start = Math.max(2, page - SIBLINGS);
  const end = Math.min(totalPages - 1, page + SIBLINGS);

  const items: (number | null)[] = [1];
  if (start > 2) items.push(null);
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push(null);
  items.push(totalPages);
  return items;
}
