import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import type { NotionSaveResponse } from "@/lib/news-types";
import { getNotionConfig, NotionApiError, saveArticleToNotion } from "@/lib/notion/save-to-notion";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 저장한 뉴스 1개를 노션 데이터베이스에 추가하고 그 페이지 URL을 articles.notionPageUrl에 기록한다.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return json({ error: "로그인이 필요합니다." }, 401);

  const body: unknown = await request.json().catch(() => null);
  const articleId = (body as { articleId?: unknown } | null)?.articleId;
  if (typeof articleId !== "string" || !UUID.test(articleId)) {
    return json({ error: "잘못된 요청입니다." }, 400);
  }

  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));
  if (!article) return json({ error: "저장한 뉴스를 찾을 수 없습니다." }, 404);
  // 이미 노션에 저장했으면 다시 만들지 않는다.
  if (article.notionPageUrl) return json({ notionPageUrl: article.notionPageUrl });

  const config = getNotionConfig();
  if (!config) return json({ error: "노션 설정이 없습니다. .env.local의 NOTION_* 값을 확인해 주세요." }, 503);

  let notionPageUrl: string;
  try {
    notionPageUrl = await saveArticleToNotion(article, config);
  } catch (error) {
    console.error("[api/notion/save] 노션 저장 실패", error);
    return json({ error: notionErrorMessage(error) }, 502);
  }

  await db
    .update(articles)
    .set({ notionPageUrl })
    .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));

  return json({ notionPageUrl });
}

function json(body: NotionSaveResponse, status = 200) {
  return Response.json(body, { status });
}

function notionErrorMessage(error: unknown): string {
  if (error instanceof NotionApiError) {
    if (error.status === 401) return "노션 토큰이 올바르지 않습니다. .env.local의 NOTION_TOKEN을 확인해 주세요.";
    if (error.status === 403 || error.status === 404) {
      return "노션 데이터베이스에 접근할 수 없습니다. 데이터베이스 연결(Connections)에 Integration이 추가되어 있는지 확인해 주세요.";
    }
    if (error.status === 400) {
      return "노션 데이터베이스 속성이 맞지 않습니다. 제목·요약·출처·카테고리·날짜 속성을 확인해 주세요.";
    }
    if (error.status === 429) return "요청이 많아 지금은 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }
  return "노션에 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
