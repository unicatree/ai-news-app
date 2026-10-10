// Claude structured output 형식. 요청 한 번에 기사 여러 개를 처리한다.
export const NEWS_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    articles: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          titleKo: { type: "string" },
          summaryKo: { type: "string" },
          category: { type: "string" },
          isNewCategory: { type: "boolean" },
          // 같은 사건을 다룬 다른 기사의 id, 없으면 ""
          duplicateOf: { type: "string" },
        },
        required: ["id", "titleKo", "summaryKo", "category", "isNewCategory", "duplicateOf"],
        additionalProperties: false,
      },
    },
  },
  required: ["articles"],
  additionalProperties: false,
} as const;

export type ProcessedArticle = {
  titleKo: string;
  summaryKo: string;
  category: string;
  duplicateOf: string | null;
};
