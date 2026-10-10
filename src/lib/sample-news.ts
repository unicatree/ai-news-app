import type { NewsItem } from "@/lib/news-types";

// 화면 확인용 예시 데이터. /api/news/fetch 구현(PRD 3단계) 후 제거한다.
export const sampleNews: NewsItem[] = [
  {
    id: "sample-1",
    sources: [
      { name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/" },
      { name: "The Verge", url: "https://www.theverge.com/ai-artificial-intelligence" },
    ],
    originalTitle: "OpenAI announces new reasoning model for enterprise customers",
    titleKo: "OpenAI, 기업 고객용 새 추론 모델 공개",
    summaryKo:
      "OpenAI가 기업 고객을 겨냥한 새로운 추론 모델을 발표했다. 이 모델은 복잡한 업무 문서를 분석하고 다단계 계획을 세우는 데 특화되어 있다. 회사는 기존 모델 대비 응답 정확도가 크게 높아졌다고 밝혔다. 우선 일부 파트너사에 제공한 뒤 순차적으로 확대할 예정이다.",
    category: "AI 모델",
    publishedAt: "2026-10-09T14:30:00Z",
    saved: false,
  },
  {
    id: "sample-2",
    sources: [{ name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/" }],
    originalTitle: "AI startup raises $200M Series C to build robotics foundation models",
    titleKo: "로봇 파운데이션 모델 스타트업, 2억 달러 시리즈 C 유치",
    summaryKo:
      "범용 로봇을 위한 파운데이션 모델을 개발하는 스타트업이 2억 달러 규모의 시리즈 C 투자를 받았다. 이번 투자로 기업 가치는 20억 달러를 넘어섰다. 회사는 자금을 데이터 수집과 연구 인력 확충에 쓸 계획이다.",
    category: "투자·스타트업",
    publishedAt: "2026-10-09T09:10:00Z",
    saved: true,
  },
  {
    id: "sample-3",
    sources: [{ name: "The Verge", url: "https://www.theverge.com/ai-artificial-intelligence" }],
    originalTitle: "EU regulators open investigation into AI training data practices",
    titleKo: "EU 규제 당국, AI 학습 데이터 수집 관행 조사 착수",
    summaryKo:
      "유럽연합 규제 당국이 주요 AI 기업들의 학습 데이터 수집 방식에 대한 조사를 시작했다. 조사는 저작권 보호 콘텐츠와 개인정보 사용 여부에 초점을 맞춘다. 위반이 확인되면 AI 법에 따라 상당한 과징금이 부과될 수 있다. 업계는 명확한 가이드라인이 필요하다는 입장이다.",
    category: "정책·규제",
    isNewCategory: true,
    publishedAt: "2026-10-08T18:45:00Z",
    saved: false,
  },
  {
    id: "sample-4",
    sources: [{ name: "The Verge", url: "https://www.theverge.com/ai-artificial-intelligence" }],
    originalTitle: "Google brings on-device AI assistant to more Android phones",
    titleKo: "구글, 온디바이스 AI 비서를 더 많은 안드로이드폰에 확대",
    summaryKo:
      "구글이 인터넷 연결 없이 동작하는 AI 비서 기능을 중급형 안드로이드 기기까지 확대한다. 메시지 요약, 사진 편집 제안 등의 기능이 기기 안에서 처리된다. 개인정보가 서버로 전송되지 않는다는 점이 강점으로 꼽힌다.",
    category: "제품·서비스",
    publishedAt: "2026-10-08T11:00:00Z",
    saved: false,
  },
  {
    id: "sample-5",
    sources: [{ name: "TechCrunch", url: "https://techcrunch.com/category/artificial-intelligence/" }],
    originalTitle: "Chipmaker unveils inference accelerator aimed at data centers",
    titleKo: "반도체 기업, 데이터센터용 AI 추론 가속기 공개",
    summaryKo:
      "한 반도체 기업이 데이터센터용 AI 추론 전용 가속기를 공개했다. 전력 효율이 이전 세대보다 두 배 개선됐다고 회사는 설명했다. 내년 상반기부터 클라우드 업체에 공급을 시작한다.",
    category: "AI 모델",
    publishedAt: "2026-10-07T22:20:00Z",
    saved: true,
    notionPageUrl: "https://www.notion.so/",
  },
];
