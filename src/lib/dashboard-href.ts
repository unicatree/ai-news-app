// 대시보드 주소. 기본값(전체 카테고리, 검색어 없음, 1페이지)은 주소에서 뺀다.
export function dashboardHref({
  category,
  query,
  page,
}: {
  category?: string | null;
  query?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/dashboard?${search}` : "/dashboard";
}
