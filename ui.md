# UI 가이드 — AI 뉴스 수집기

이 문서는 화면을 만들 때 따르는 스타일 기준이다. 요구사항은 `PRD.md`가 기준이고, 이 문서는 **어떻게 보이게 할지**만 다룬다.

- 스타일: Tailwind CSS v4 유틸리티 클래스만 사용 (`tailwind.config` 없음, 설정은 `src/app/globals.css`의 `@theme`)
- 방향: **깔끔하고 읽기 편하게.** 장식보다 여백과 글자 위계로 정리하고, 색은 파란색 하나만 강조색으로 쓴다.
- 다크 모드: 시스템 설정(`prefers-color-scheme`)을 따른다. 모든 색 클래스에는 `dark:` 짝을 함께 쓴다.

---

## 1. 디자인 토큰

### 색상

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-background` (slate-50) | slate-950 |
| 카드·입력 배경 | `bg-white` | `dark:bg-slate-900` |
| 테두리 | `border-slate-200` | `dark:border-slate-800` |
| 카드 안 구분선 | `border-slate-100` | `dark:border-slate-800` |
| 제목 글자 | `text-slate-900` | `dark:text-slate-50` |
| 본문 글자 | `text-slate-600` | `dark:text-slate-300` |
| 보조 글자(날짜, 설명) | `text-slate-500` | `dark:text-slate-400` |
| 강조(버튼, 링크, 선택 상태) | `bg-blue-600` / `text-blue-600`·`text-blue-700` | `dark:text-blue-400` |
| 강조 옅은 배경 | `bg-blue-50` | `dark:bg-blue-950` |
| 오류 | `bg-red-50 text-red-700` | `dark:bg-red-950/50 dark:text-red-300` |
| 안내(예시 데이터 등) | `bg-amber-50 text-amber-800` | `dark:bg-amber-950/50 dark:text-amber-300` |

- 회색 계열은 **slate로 통일**한다. zinc·gray·neutral을 섞지 않는다.
- 강조색은 blue 하나만. 카테고리마다 다른 색을 주지 않는다(카테고리는 사용자가 만들기 때문에 색이 끝없이 늘어난다).

### 글꼴

- `font-sans` = Geist(영문) + Noto Sans KR(한글). `layout.tsx`에서 로드한다.
- `body`에 `word-break: keep-all`이 걸려 있어 한글이 단어 중간에서 끊기지 않는다.

| 요소 | 클래스 |
|---|---|
| 페이지 제목 | `text-2xl font-bold tracking-tight` |
| 카드 제목 | `text-lg font-bold leading-snug tracking-tight wrap-break-word` (긴 영어 단어가 넘치지 않게) |
| 카드 요약(본문) | `text-[15px] leading-7` — 줄 간격을 넉넉히 둬서 3~4문장 요약이 편하게 읽히게 한다 |
| 탭 | `text-[15px] font-semibold` |
| 버튼·칩·메타 정보 | `text-sm font-medium` 또는 `font-semibold` |
| 배지 | `text-xs font-semibold` |

### 모서리·그림자·간격

- 모서리: 카드·빈 상태 박스 `rounded-2xl`, 버튼·알림 `rounded-lg`~`rounded-xl`, 칩·배지 `rounded-full`
- 그림자: 카드 `shadow-sm` → hover 시 `shadow-md`. 그 외에는 그림자를 쓰지 않는다.
- 페이지 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 세로 간격: 섹션 사이 `mt-8`, 섹션 안 요소 사이 `mt-4`~`mt-6`, 카드 사이 `gap-5`

---

## 2. 레이아웃

### 헤더 (로그인 후 모든 화면 공통)

```
┌──────────────────────────────────────────────────────┐
│ [AI] AI 뉴스 수집기              카테고리  노션  (👤) │
└──────────────────────────────────────────────────────┘
```

- `sticky top-0 z-10 h-14 border-b border-slate-200 bg-white/80 backdrop-blur`
- 왼쪽: 파란 사각 로고(`size-7 rounded-lg bg-blue-600`, 흰 글자 "AI") + 앱 이름 `font-bold`. 누르면 `/`로 이동. 모바일에서는 앱 이름을 숨기고 로고만 보여준다(`hidden sm:inline`).
- 오른쪽: 설정 링크(카테고리 관리, 노션 설정)는 `text-sm font-medium text-slate-600 hover:text-slate-900`, 맨 끝에 Clerk `<UserButton />`.

### 메인 대시보드 (`/`)

```
오늘의 AI 뉴스                                  [⟳ 뉴스 가져오기]
TechCrunch · The Verge의 AI 소식을 한국어로…

가져온 뉴스 12   저장한 뉴스 4                     N개 저장됨 [모두 저장 (8)]
─────────────────────────────────────────────────────────────────
(전체) (모델) (규제) (투자) (기타) (+ 카테고리 추가)

┌────────┐ ┌────────┐ ┌────────┐
│ 카드   │ │ 카드   │ │ 카드   │
└────────┘ └────────┘ └────────┘
```

위에서 아래 순서:

1. **페이지 머리** — 제목·설명(왼쪽) + "뉴스 가져오기" 기본 버튼(오른쪽). 모바일에서는 세로로 쌓는다(`flex-col sm:flex-row`).
2. **탭 줄** — "가져온 뉴스 / 저장한 뉴스" 탭 + 각 탭의 개수. 오른쪽에 "모두 저장"(가져온 뉴스 탭에서만). 아래에 `border-b`.
3. **카테고리 칩 줄** — 카드 목록 바로 위. 마지막 칩은 **카테고리 추가 버튼**. (3장 참고)
4. **알림 영역** — 오류·안내 메시지(있을 때만).
5. **카드 그리드** — `grid gap-5 sm:grid-cols-2 lg:grid-cols-3`. 모바일은 한 줄에 카드 하나.

### 설정 화면 (`/settings/categories`, `/settings/notion`)

- 같은 헤더 + 컨테이너를 쓰되 폭은 `max-w-2xl`로 좁혀 읽기 편하게 한다.
- 내용은 흰 카드(`rounded-2xl border bg-white p-6`) 하나에 담는다.
- 카테고리 목록은 한 줄에 하나(`divide-y divide-slate-100`), 각 줄 오른쪽에 "수정"·"삭제" 텍스트 버튼. "기타" 줄에는 삭제 버튼 대신 `text-xs text-slate-400` "기본 카테고리" 표시.

---

## 3. 카테고리 칩 줄

카드 목록 위에서 카테고리를 고르고, 새 카테고리를 추가하는 곳이다.

```
(전체) (모델) (규제) (투자) (기타) ( + 카테고리 추가 )
 ^선택                                 ^점선 테두리
```

### 칩 구성

- 순서: `전체` → 카테고리들 → `기타` → **`+ 카테고리 추가`**(항상 맨 끝)
- 카테고리 목록 = 사용자의 저장된 카테고리 + 가져온 뉴스에서 Claude가 제안한 새 카테고리
- 필터는 두 탭 모두에 적용된다. 탭을 바꾸면 `전체`로 되돌린다.

### 칩 스타일

| 상태 | 클래스 |
|---|---|
| 공통 | `h-9 sm:h-8 shrink-0 rounded-full px-3.5 text-sm font-medium transition` (모바일은 터치하기 쉽게 36px) |
| 기본 | `bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700` / `dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800` |
| 선택됨 | `bg-blue-600 text-white` |

| 이동 중(누른 직후) | `bg-blue-600/70 text-white` — `useLinkStatus`로 누르는 즉시 표시 |

- 줄 컨테이너: 모바일은 칩만 가로 스크롤하고 **카테고리 추가 버튼은 스크롤 밖 오른쪽에 고정**한다. `sm` 이상은 스크롤 래퍼를 `sm:contents`로 풀어 줄바꿈하고, 추가 버튼이 칩 맨 끝에 이어진다.
- 칩은 `<Link scroll={false}>`로 `?category=` 주소를 바꾼다. 목록에 없는 카테고리가 주소로 들어오면 `전체`로 처리한다.

### 카테고리 추가 버튼

일반 칩과 같은 크기지만 **점선 테두리**로 "필터가 아니라 동작"임을 구분한다.

```tsx
<button
  type="button"
  className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-300"
>
  <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
    <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
  카테고리 추가
</button>
```

동작:

1. 누르면 버튼 자리가 **같은 크기의 입력 칩**으로 바뀐다 (페이지 이동·모달 없음).
   - `h-9 sm:h-8 w-36 rounded-full border border-blue-400 bg-white pl-3.5 pr-8 text-sm outline-none ring-2 ring-blue-100 dark:bg-slate-900 dark:ring-blue-950`, `placeholder="새 카테고리"`, 자동 포커스
2. `Enter` → 카테고리 추가 Server Action 호출 → 성공하면 새 칩이 `기타` 앞에 생기고 입력 칩은 다시 버튼으로 돌아간다.
3. `Esc` 또는 입력이 빈 채로 포커스가 빠지면 취소.
4. 이미 있는 이름이면 입력 칩 아래에 `text-xs text-red-600` "이미 있는 카테고리입니다." 표시.
5. 수정·삭제는 칩 줄에서 하지 않고 `/settings/categories`에서 한다.

---

## 4. 뉴스 카드

```
┌────────────────────────────────────┐
│ [이미지 16:9]   (있을 때만)          │
│ (모델) (새 카테고리)   2026년 10월 10일 │  ← 머리 줄: 무엇 + 언제
│ 한국어 제목 (굵게, 2~3줄)             │  ← 가장 강한 위계
│ 한국어 요약 3~4문장 …                │
├────────────────────────────────────┤  ← 옅은 회색 바탕
│ TechCrunch 원문 ↗       [저장하기]   │  ← 출처 = 원문 링크
└────────────────────────────────────┘
```

- 카드: `group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-within:border-blue-200`
- 이미지: `aspect-[16/9] overflow-hidden` 래퍼 안에 `size-full object-cover`. 움직임은 주지 않는다.
- 제목은 대표 출처(첫 번째) 원문 링크다(`text-pretty`로 마지막 줄 외톨이 단어 방지).
- 본문 영역: `flex flex-1 flex-col p-5 sm:p-6`. 요소 사이 간격은 위계에 맞춰 다르게 준다 — 머리 줄 → 제목 `mt-3.5`, 제목 → 요약 `mt-2.5`(제목과 요약을 한 덩어리로 묶는다).
- 머리 줄: 왼쪽 배지들, 오른쪽 발행일(`text-xs font-medium tabular-nums text-slate-500`). 삭제(X) 버튼이 있고 이미지가 없으면 `pr-9`로 자리를 비운다.
- 하단 액션 줄: `border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6` (다크 `dark:bg-slate-900`). `sm` 이상은 왼쪽 링크 / 오른쪽 버튼, **모바일은 링크 아래에 버튼을 전체 폭(`w-full h-10`)으로** 쌓는다.
- 출처는 하단 줄에서 **한 번만** 보여준다. 출처 이름이 곧 원문 링크다(본문에 출처 메타 줄을 따로 두지 않는다).

### hover 인터랙션

hover 반응은 **누를 수 있는 곳에서만** 준다. 카드 자체는 링크가 아니므로 카드 hover는 "지금 이 카드를 보고 있다"는 정도로만 약하게 하고, 색 변화는 실제 링크에만 준다. 장식용 움직임(이미지 확대 등)은 쓰지 않는다.

| 대상 | 변화 |
|---|---|
| 카드 | 살짝 떠오름(`-translate-y-0.5`) + 테두리 `blue-200` + `shadow-md`, `duration-200 ease-out` |
| 제목 링크 | 자기 hover 때만 `text-blue-700` + 밑줄(`decoration-blue-300 decoration-2 underline-offset-4`) |
| 원문 링크 화살표 | `group-hover/link:` 오른쪽 위로 0.5만큼 이동 — "새 탭으로 나간다"를 보여준다 |

- 모든 움직임에 `motion-reduce:` 짝을 둬서 동작 줄이기 설정을 존중한다.
- 카드 안 링크는 `focus-visible:outline-2 outline-offset-2 outline-blue-600`로 키보드 포커스를 보여주고, 카드 테두리도 `focus-within`으로 같이 바뀐다.
- hover 효과는 Tailwind v4에서 마우스가 있는 기기에만 적용되므로 터치 기기용 처리는 따로 하지 않는다.

### 배지

| 배지 | 클래스 | 언제 |
|---|---|---|
| 카테고리 | `rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700` | 항상 |
| 새 카테고리 | `rounded-full border border-dashed border-blue-300 px-2 py-0.5 text-xs text-blue-600` | Claude가 새 카테고리를 제안했고 아직 저장 전 |
| N개 출처 | `rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600` | 다른 출처 기사를 합친 카드 |

### 링크·버튼

- 원문 링크: 출처 이름 `text-sm font-semibold text-slate-700 hover:text-blue-700` + "원문" `text-blue-600` + ↗ 아이콘(blue), `target="_blank" rel="noopener noreferrer"`. 모든 카드가 "TechCrunch 원문 ↗" 형식이고, 합친 카드는 "TechCrunch 원문", "The Verge 원문"처럼 출처별로 모두 표시.
- 가져온 뉴스 탭: `저장하기`(채운 파란 버튼) → 저장 후 `✓ 저장됨` 상태 표시
- 저장한 뉴스 탭: `뉴스저장`(테두리 버튼, 노션 데이터베이스에 저장) → 저장 후 `✓ 저장됨 ↗`(노션 페이지 링크)

---

## 5. 공통 컴포넌트

### 버튼

| 종류 | 클래스 | 쓰는 곳 |
|---|---|---|
| 큰 기본 | `h-11 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700` | 뉴스 가져오기 (화면당 하나) |
| 기본 | `h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700` | 저장하기 |
| 테두리 | `h-9 rounded-lg border border-blue-200 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50` | 모두 저장, 뉴스저장 |
| 텍스트 | `text-sm font-medium text-slate-500 hover:text-slate-900` | 수정, 취소 |
| 위험 텍스트 | `text-sm font-medium text-red-600 hover:text-red-700` | 삭제, 노션 연결 해제 |

- 모든 버튼: `transition disabled:cursor-not-allowed disabled:opacity-60`
- 진행 중에는 문구를 바꾼다: "가져오는 중…", "저장 중…". 아이콘이 있으면 `animate-spin`.

### 상태 표시

| 상태 | 표시 |
|---|---|
| 로딩(첫 진입) | 라우트의 `loading.tsx` — 헤더는 레이아웃에 두어 유지하고, 제목 + 칩 자리 + 스켈레톤 카드 6개 |
| 로딩(필터 변경) | 칩 줄은 그대로 두고 카드 목록만 `<Suspense key={필터}>`의 스켈레톤으로 바꾼다 |
| 로딩(폼 제출) | 입력 칸 안 오른쪽에 회전 아이콘(`animate-spin`) |
| 오류 | 칩 줄 아래 `role="alert"` 빨간 알림 박스 `rounded-lg px-4 py-3 text-sm` |
| 완료 알림 | "모두 저장" 왼쪽에 `text-sm font-medium text-blue-700` "N개 저장됨" |
| 빈 목록(데이터 없음) | 점선 박스(`rounded-2xl border border-dashed py-16 text-center`) 안에 아이콘(`size-12 rounded-2xl bg-blue-50`) + 제목 `text-lg font-bold` + 설명 + **큰 기본 버튼**으로 다음 행동 안내 |
| 빈 목록(필터 결과 없음) | 점선 박스 + 한 줄 설명 + 테두리 버튼 "전체 보기". 개수 표시는 숨긴다 |

---

## 6. 반응형

| 폭 | 카드 열 | 그 밖 |
|---|---|---|
| 기본(모바일) | 1열 | 헤더는 로고만, 칩 줄 가로 스크롤 + 추가 버튼 고정, 칩 36px, 카드 버튼 전체 폭 |
| `sm` (≥640px) | 2열 | 칩 줄 줄바꿈 |
| `lg` (≥1024px) | 3열 | — |

---

## 7. 문구 규칙

- 존댓말(-습니다/-세요), 짧게. 예: "뉴스를 가져오지 못했습니다.", "‘뉴스 가져오기’를 눌러 최신 AI 뉴스를 불러오세요."
- 버튼 문구는 동사형: "뉴스 가져오기", "저장하기", "모두 저장", "카테고리 추가"
- 날짜: `Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Seoul" })` → "2026년 10월 10일"
- 출처 구분은 가운뎃점 `·`

## 8. 접근성

- 탭은 `role="tablist"` / `role="tab"` + `aria-selected`
- 장식용 SVG에는 `aria-hidden`
- 새 탭으로 여는 링크는 모두 `rel="noopener noreferrer"`
- 아이콘만 있는 버튼에는 `aria-label`
- 글자 대비: 본문에 slate-400보다 옅은 색을 쓰지 않는다(개수 같은 보조 숫자만 예외).
