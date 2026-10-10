# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@ui.md

## 프로젝트 개요

해외 AI 뉴스를 버튼 한 번으로 RSS 수집 → Claude가 한국어 제목·요약(3~4문장)·카테고리 제안·중복 판별 → 사용자가 고른 뉴스만 DB 저장 → 노션으로 내보내는 앱. **요구사항의 단일 기준은 `PRD.md`**이며, 이 문서는 구현 시 지켜야 할 핵심만 요약한다. 충돌 시 `PRD.md`가 우선. **화면 스타일(색상·글꼴·컴포넌트·레이아웃)은 `ui.md`를 따른다** — UI를 만들거나 고칠 때 먼저 확인할 것.

현재 상태: Clerk 로그인, Neon + Drizzle 스키마, 메인·대시보드 UI, 메인의 `/api/news/fetch`(RSS 수집 → Claude 번역·요약·분류 → 중복 합치기, DB 저장 안 함), 대시보드의 RSS 가져오기(임시: 바로 `articles`에 저장, Claude 처리 없음)까지 구현. 메인의 저장하기/모두 저장은 아직 화면 상태만 바꾼다(4단계).

## 명령어

```bash
npm run dev      # 개발 서버 (Turbopack)
npm run build    # 프로덕션 빌드 (타입 체크 포함)
npm run lint     # ESLint
npx drizzle-kit generate   # 스키마 → 마이그레이션 생성 (drizzle.config.ts 작성 후)
npx drizzle-kit migrate    # Neon에 마이그레이션 적용
```

테스트 러너는 아직 설정되어 있지 않다. 검증은 PRD 9장의 완료 기준 시나리오(11개)로 한다.

## 스택과 버전 주의사항

- **Next.js 16** (App Router, TypeScript, `src/` 디렉터리, `@/*` → `src/*`). 학습 데이터와 다른 API가 많으므로 `node_modules/next/dist/docs/`를 먼저 확인할 것. 특히 `middleware.ts`는 **`proxy.ts`로 이름이 바뀌었고** Node.js 런타임에서만 동작한다 — Clerk 라우트 보호는 `src/proxy.ts`에 둔다.
- **Tailwind CSS v4**: `tailwind.config` 없이 `src/app/globals.css`의 `@import "tailwindcss"`와 `@theme`로 설정한다.
- **Clerk Core 3** (`@clerk/nextjs` v7): `SignedIn`/`SignedOut`/`Protect`는 제거됨 → `<Show when="signed-in">` 등을 사용. `<ClerkProvider>`는 `<body>` 안에 두고, 한국어 UI는 `@clerk/localizations`의 `koKR`.
- 로그인 Clerk(`@clerk/nextjs`), DB Neon(`@neondatabase/serverless`) + Drizzle ORM, AI `@anthropic-ai/sdk`, RSS `rss-parser`.

## 구현 단계 (PRD 8장 순서대로 진행)

1. Next.js 프로젝트 생성(완료), Clerk 로그인 및 라우트 보호
2. Neon + Drizzle 스키마, 마이그레이션
3. RSS 수집 + 중복 처리 + Claude 번역·요약·카테고리 제안, 카드 UI(원문보기) + 카테고리 필터
4. 저장하기 / 모두 저장 + "저장한 뉴스" 탭
5. 카테고리 관리 페이지
6. Notion MCP OAuth 연결 + Notion 저장

## 화면과 API

| 화면 | 경로 | 내용 |
|---|---|---|
| 로그인/회원가입 | `/` (모달) | 별도 페이지 없음. 미로그인 시 `/`에서 Clerk 로그인 모달이 자동으로 열림 (`NEXT_PUBLIC_CLERK_SIGN_IN_URL=/`) |
| 메인 | `/` | 뉴스 가져오기 버튼, 탭(가져온 뉴스 / 저장한 뉴스), 카테고리 필터 칩, 모두 저장, 카드 그리드 |
| 카테고리 관리 | `/settings/categories` | 추가/수정/삭제 |
| 노션 설정 | `/settings/notion` | 연결/해제, 저장 대상 페이지 지정 |

| 메서드 | 경로 | 역할 |
|---|---|---|
| POST | `/api/news/fetch` | RSS 수집 → 중복 처리 → Claude 처리 → 결과 반환 (**DB 저장 안 함**) |
| POST | `/api/news/save` | 1개 또는 여러 개 저장 + 새 카테고리 등록 |
| GET | `/api/news/saved` | 저장한 뉴스 목록(최신순, 카테고리 필터) |
| — | Server Actions | 카테고리 추가/수정/삭제 |
| GET | `/api/notion/oauth/start`, `/api/notion/oauth/callback` | Notion MCP OAuth |
| POST | `/api/notion/save` | 저장한 뉴스를 노션에 저장 |

RSS 소스는 두 개로 고정(소스 추가 UI는 범위 외):
- TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
- The Verge AI: `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml`

## 데이터 모델 (Drizzle)

- `articles` — 저장한 뉴스 (뉴스는 이 테이블 하나에만 저장): `id`(uuid PK), `userId`, `source`(합친 경우 대표 출처), `originalUrl`(정규화된 URL), `relatedUrls`(jsonb, 같은 사건 다른 출처 URL), `originalTitle`, `author?`(원문 작성자), `titleKo`, `summaryKo`, `category`(카테고리 **이름** 텍스트, FK 아님), `imageUrl?`, `publishedAt`, `notionPageUrl?`, `savedAt`. 유니크 `(userId, originalUrl)`.
- `categories`: `id`(uuid PK), `userId`, `name`, `createdAt`. 유니크 `(userId, name)`.
- `notion_connections`: `userId`(PK), `accessToken`/`refreshToken`(**암호화 저장**, `ENCRYPTION_KEY`), `expiresAt`, `targetPageId`.

## 핵심 규칙

- **인증 검사 위치**: `src/proxy.ts`는 `clerkMiddleware()`만 실행하고 경로 기반 검사는 하지 않는다(`createRouteMatcher`는 deprecated). 보호가 필요한 곳에서 직접 검사한다.
  - 페이지/레이아웃·Server Action: `const { userId } = await auth.protect();` (미로그인 페이지 요청은 `/`로 리다이렉트 → 로그인 모달)
  - Route Handler: `const { userId } = await auth(); if (!userId) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });`
  - `auth`는 `@clerk/nextjs/server`에서 import.
- **사용자 격리**: 모든 데이터(뉴스, 카테고리, 노션 연결)는 Clerk `userId`로 분리. 모든 API·Server Action은 로그인 사용자 본인 데이터만 읽고 쓴다.
- **가져오기 ≠ 저장**: 가져온 뉴스는 "가져온 뉴스" 탭에 카드로만 보여준다. DB 쓰기는 저장하기/모두 저장에서만. 가져오는 중 로딩 상태, 실패 시 오류 메시지 표시.
  - 예외(임시): `/dashboard`의 `fetchNews` Server Action(`src/app/dashboard/actions.ts`)은 지난 24시간 RSS 기사를 바로 `articles`에 저장한다(원제목·원문 요약·"기타"). PRD F2 메모 참고.
- **중복 처리 (F3)**
  1. URL 정규화(쿼리스트링·`utm_*`·끝 슬래시 제거) 후 같은 URL은 하나만 남김.
  2. DB에 이미 있는 URL은 카드에 "저장됨" 표시, 재저장하지 않음.
  3. 다른 출처의 같은 사건은 Claude의 `duplicateOf`로 판별해 카드 하나로 합치고 두 원문 링크를 모두 표시(`relatedUrls`).
  4. `(userId, originalUrl)` 유니크 제약으로 DB 레벨에서도 이중 저장 방지.
- **Claude 처리 (`/api/news/fetch`)**: 모델 `claude-haiku-4-5`. 입력은 사용자의 기존 카테고리 목록 + 기사(제목, RSS 본문/요약, URL, 출처). structured output(JSON 스키마)으로 기사별 `{ id, titleKo, summaryKo, category, isNewCategory, duplicateOf }`. 기사를 배치로 나눠 병렬 처리(30초 이내 목표). **이미 저장된 뉴스와 URL 중복 뉴스는 Claude에 보내지 않는다**(비용).
- **카테고리 (F4)**: 기본 목록 없음 — Claude가 기존 카테고리 중 선택하거나 새 이름 제안. 새 카테고리는 해당 뉴스 **저장 시** 목록에 자동 등록. "기타"는 항상 존재하며 삭제 불가. 이름 수정 시 저장된 뉴스의 `category`도 함께 변경, 삭제 시 해당 뉴스는 "기타"로 이동. 변경 사항은 이후 가져오는 뉴스부터 반영(기존 저장 뉴스 재분류는 범위 외). 필터 칩은 두 탭 모두에 적용.
- **뉴스 카드 (F5)**: 출처(합친 카드는 둘 다), 발행일(RSS 기준), 카테고리, 한국어 제목, 한국어 요약, 원문보기(새 탭), 저장하기("가져온 뉴스" 탭 → 저장 후 "저장됨"), Notion 저장("저장한 뉴스" 탭 → 저장 후 "Notion 저장됨" + 노션 페이지 링크). 모바일에서는 한 줄에 카드 하나.
- **모두 저장 (F6)**: 아직 저장 안 한 뉴스를 한 번에 저장. 카테고리 필터가 걸려 있으면 **현재 화면에 보이는 뉴스만** 저장. 완료 후 "N개 저장됨" 표시.
- **노션 (F7)**: 노션 REST API를 직접 호출하지 않고, 서버에서 Claude API의 **MCP 커넥터**로 Notion MCP 서버(`https://mcp.notion.com/mcp`)를 호출해 지정 페이지 아래에 뉴스 페이지(제목, 요약, 카테고리, 출처, 원문 URL)를 만든다. 생성된 페이지 URL을 `articles.notionPageUrl`에 기록. 미연결 상태에서 누르면 `/settings/notion`으로 안내.
- **범위 외**: 자동(예약) 수집, RSS 소스 추가 UI, 저장 뉴스 재분류, 저장 뉴스 삭제.

## 환경 변수 (`.env.local`)

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_OAUTH_*`, `ENCRYPTION_KEY`. `NEXT_PUBLIC_*` 외의 키·토큰은 서버 코드에서만 사용.
