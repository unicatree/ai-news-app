# AI 뉴스 수집기

해외 AI 뉴스를 버튼 한 번으로 모아 한국어로 읽고, 골라서 저장하고, 노션으로 내보내는 웹 앱입니다.

1. **뉴스 가져오기** — TechCrunch AI · The Verge AI의 RSS를 수집합니다.
2. **번역·요약·분류** — Claude(`claude-haiku-4-5`)가 한국어 제목, 3~4문장 요약, 카테고리를 만들고 다른 출처의 같은 사건은 카드 하나로 합칩니다.
3. **저장** — 마음에 드는 뉴스만 골라 DB에 저장합니다. 가져오기만 해서는 저장되지 않습니다.
4. **노션 내보내기** — 저장한 뉴스를 노션 데이터베이스("AI 뉴스 북마크")에 행으로 추가합니다.

> 자세한 요구사항은 [`PRD.md`](PRD.md), 화면 스타일은 [`ui.md`](ui.md)를 참고하세요.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| 스타일 | Tailwind CSS v4 |
| 로그인 | Clerk (`@clerk/nextjs` v7, 한국어 UI) |
| DB | Neon (Postgres) + Drizzle ORM |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| RSS | `rss-parser` |
| 노션 | Notion REST API (`Notion-Version: 2025-09-03`) |

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다.

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/

# Neon
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# Notion (1인용 고정 토큰)
NOTION_TOKEN=
NOTION_DATA_SOURCE_ID=
```

`NEXT_PUBLIC_*`가 아닌 키는 서버 코드에서만 사용됩니다. `.env.local`은 커밋하지 마세요.

### 3. DB 마이그레이션

```bash
npx drizzle-kit migrate
```

스키마(`src/db/schema.ts`)를 바꾼 뒤에는 `npx drizzle-kit generate`로 마이그레이션을 새로 만들고 다시 적용합니다.

### 4. 실행

```bash
npm run dev
```

http://localhost:3000 에 접속하면 Clerk 로그인 모달이 열립니다.

## 노션 설정

1. 노션에서 [내부 통합(Integration)](https://www.notion.so/profile/integrations)을 만들고 토큰을 `NOTION_TOKEN`에 넣습니다.
2. 아래 속성을 가진 데이터베이스를 만들고, 데이터베이스 메뉴의 **연결**에서 위 통합을 추가합니다.

   | 속성 | 유형 |
   |---|---|
   | 제목 | 제목(title) |
   | 요약 | 텍스트 |
   | 출처 | URL |
   | 카테고리 | 선택 |
   | 날짜 | 날짜 |

3. 데이터베이스의 데이터 소스 ID를 `NOTION_DATA_SOURCE_ID`에 넣습니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (타입 체크 포함) |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npx drizzle-kit generate` | 스키마 → 마이그레이션 생성 |
| `npx drizzle-kit migrate` | Neon에 마이그레이션 적용 |

## 프로젝트 구조

```
src/
├─ app/
│  ├─ page.tsx                 # 메인 (가져온 뉴스 / 저장한 뉴스)
│  ├─ dashboard/               # 대시보드 (저장한 뉴스, 페이지 나누기)
│  └─ api/
│     ├─ news/fetch/route.ts   # RSS 수집 → Claude 처리 → 결과 반환 (DB 저장 안 함)
│     └─ notion/save/route.ts  # 저장한 뉴스 1개를 노션에 저장
├─ components/                 # 헤더, 카테고리 칩, 뉴스 카드 등
├─ db/                         # Drizzle 클라이언트·스키마
├─ lib/
│  ├─ rss/                     # 피드 목록, 수집, URL 정규화
│  ├─ ai/                      # Claude 프롬프트·스키마·배치 처리
│  ├─ news/                    # 중복 뉴스 합치기
│  └─ notion/                  # 노션 페이지 생성
└─ proxy.ts                    # Clerk 미들웨어 (Next.js 16의 middleware 대체)
drizzle/                       # 마이그레이션 파일
```

## 개발 현황

- [x] Clerk 로그인 및 라우트 보호
- [x] Neon + Drizzle 스키마, 마이그레이션
- [x] RSS 수집 + 중복 처리 + Claude 번역·요약·카테고리 제안, 카드 UI
- [ ] 메인 화면의 저장하기 / 모두 저장 DB 연동 (현재는 화면 상태만 바뀜)
- [ ] 카테고리 관리 페이지 (`/settings/categories`)
- [x] 노션 데이터베이스 저장

범위 외: 자동(예약) 수집, RSS 소스 추가 UI, 저장 뉴스 재분류·삭제.
