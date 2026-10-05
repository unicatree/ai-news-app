import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// 저장한 뉴스. 뉴스는 이 테이블 하나에만 저장한다.
export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    // 같은 사건을 합친 경우 대표 출처
    source: text("source").notNull(),
    // 정규화된 원문 URL
    originalUrl: text("original_url").notNull(),
    // 같은 사건을 다룬 다른 출처 URL 목록
    relatedUrls: jsonb("related_urls").$type<string[]>().notNull().default([]),
    originalTitle: text("original_title").notNull(),
    // 원문 기사 작성자 (RSS에 없으면 null)
    author: text("author"),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    // 카테고리 이름 (categories FK 아님)
    category: text("category").notNull(),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    notionPageUrl: text("notion_page_url"),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("articles_user_id_original_url_unique").on(
      table.userId,
      table.originalUrl,
    ),
    index("articles_user_id_saved_at_idx").on(table.userId, table.savedAt),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("categories_user_id_name_unique").on(table.userId, table.name),
  ],
);

// 토큰은 ENCRYPTION_KEY로 암호화한 문자열을 저장한다.
export const notionConnections = pgTable("notion_connections", {
  userId: text("user_id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  // 뉴스 페이지를 만들 노션 상위 페이지 ID (연결 후 설정 페이지에서 지정)
  targetPageId: text("target_page_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NotionConnection = typeof notionConnections.$inferSelect;
