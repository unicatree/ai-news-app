import "server-only";
import type { Article } from "@/db/schema";
import { sourceNameFromUrl } from "@/lib/sources";

const NOTION_API = "https://api.notion.com/v1";
// 데이터 소스(data_source_id) 부모를 쓰려면 2025-09-03 이상이 필요하다.
const NOTION_VERSION = "2025-09-03";
// 노션 rich_text 한 덩어리의 최대 길이
const MAX_TEXT = 2000;

export type NotionConfig = {
  token: string;
  dataSourceId: string;
};

// .env.local의 노션 설정. 하나라도 비어 있으면 null.
export function getNotionConfig(): NotionConfig | null {
  const token = process.env.NOTION_TOKEN;
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  if (!token || !dataSourceId) return null;
  return { token, dataSourceId };
}

// 노션 API 오류 응답. status로 원인(토큰·권한·속성)을 구분한다.
export class NotionApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

// 노션 데이터베이스에 뉴스 행(페이지)을 추가하고 그 페이지 URL을 돌려준다.
// 데이터베이스 속성: 제목(title), 요약(text), 출처(url), 카테고리(select), 날짜(date)
export async function saveArticleToNotion(article: Article, config: NotionConfig): Promise<string> {
  // 출처 속성에는 URL 하나만 들어가므로, 같은 사건을 합친 뉴스는 다른 출처 원문을 요약 아래에 덧붙인다.
  const summary = [
    article.summaryKo,
    ...article.relatedUrls.map((url) => `${sourceNameFromUrl(url)} 원문: ${url}`),
  ].join("\n");

  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: config.dataSourceId },
      properties: {
        제목: { title: [{ text: { content: article.titleKo.slice(0, MAX_TEXT) } }] },
        요약: { rich_text: [{ text: { content: summary.slice(0, MAX_TEXT) } }] },
        출처: { url: article.originalUrl },
        카테고리: { select: { name: article.category } },
        날짜: { date: { start: seoulDate(article.publishedAt) } },
      },
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as
    | { object?: string; url?: string; code?: string; message?: string }
    | null;
  if (!res.ok || data?.object !== "page" || typeof data.url !== "string") {
    throw new NotionApiError(res.status, data?.code ?? "unknown", data?.message ?? res.statusText);
  }
  return data.url;
}

// 발행일을 한국 시간 기준 YYYY-MM-DD로
function seoulDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date);
}
