import type { ArticleToProcess } from "@/lib/ai/process-articles";
import type { ProcessedArticle } from "@/lib/ai/schema";
import type { NewsItem } from "@/lib/news-types";

// Claude가 처리한 기사를 카드로 만든다. duplicateOf로 이어진 기사는 카드 하나로 합친다.
// 서로를 가리키거나(A→B, B→A) 사슬로 이어져도(A→B→C) 같은 묶음이 된다.
export function mergeDuplicates(
  items: ArticleToProcess[],
  processed: Map<string, ProcessedArticle>,
  existingCategories: string[],
): NewsItem[] {
  const done = items.filter((a) => processed.has(a.id));
  const parent = new Map(done.map((a) => [a.id, a.id]));

  function find(id: string): string {
    let root = id;
    while (parent.get(root) !== root) root = parent.get(root)!;
    parent.set(id, root);
    return root;
  }

  for (const a of done) {
    const target = processed.get(a.id)!.duplicateOf;
    // 처리에 실패해 결과가 없는 기사는 합치지 않는다.
    if (target && parent.has(target)) parent.set(find(a.id), find(target));
  }

  const groups = new Map<string, ArticleToProcess[]>();
  for (const a of done) {
    const root = find(a.id);
    groups.set(root, [...(groups.get(root) ?? []), a]);
  }

  return [...groups.values()].map((group) => {
    // 먼저 발행된 기사를 대표로 삼는다.
    const [lead, ...rest] = [...group].sort((x, y) => x.publishedAt.getTime() - y.publishedAt.getTime());
    const result = processed.get(lead.id)!;
    return {
      // 저장할 때 원문 URL로 찾을 수 있게 대표 URL을 id로 쓴다.
      id: lead.originalUrl,
      sources: [lead, ...rest].map((a) => ({ name: a.source, url: a.originalUrl })),
      originalTitle: lead.originalTitle,
      author: lead.author,
      titleKo: result.titleKo,
      summaryKo: result.summaryKo,
      category: result.category,
      isNewCategory: !existingCategories.includes(result.category),
      imageUrl: lead.imageUrl ?? rest.find((a) => a.imageUrl)?.imageUrl ?? null,
      publishedAt: lead.publishedAt.toISOString(),
      saved: false,
    };
  });
}
