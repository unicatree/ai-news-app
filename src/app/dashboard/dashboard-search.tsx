"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeywordSearch } from "@/components/keyword-search";
import { dashboardHref } from "@/lib/dashboard-href";

// 검색하면 카테고리는 유지하고 1페이지로 돌아간다.
export function DashboardSearch({ category, query }: { category: string | null; query: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <KeywordSearch
      key={query}
      query={query}
      pending={pending}
      onSearch={(q) =>
        startTransition(() => router.push(dashboardHref({ category, query: q }), { scroll: false }))
      }
    />
  );
}
