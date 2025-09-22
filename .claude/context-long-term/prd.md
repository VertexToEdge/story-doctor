# PRD: LLM 기반 웹 소설 적합도 검사 서비스 — “스토리 상담실 (Dr. 스토리)”

## 0) 프로젝트 개요

- **목적**: 무료 관람 20화 이내 이탈률을 낮추고, 유저 리텐션을 높이는 “사전 적합도 상담” 데모.
- **타깃**: 웹소설/웹툰 오디언스(초입 이탈이 잦은 신규/라이트 유저).
- **범위(2시간 제한용 MVP)**: 단일 작품(홍길동전) 대상 질문 생성 → 답변 수집 → 점수화/라벨링 → 처방전 노출.
  (지식그래프/RAG 배제, 작품 텍스트는 코드 하드코딩, 프롬프트 엔지니어링 중심)

---

## 1) 성공 지표 (MVP)

- **상호작용 완료율**: 질문 시작 대비 처방전 도달 ≥ 70%
- **상담 소요시간**: 평균 ≤ 90초
- **사용자 만족도**: 처방전 “유용함” 체크 ≥ 60%
- **기술적 안정성**: LLM 호출 실패율 ≤ 5%

---

## 2) 유저 스토리 & 시나리오

- **US-01**: 나는 소설을 고르기 전, 내 취향과 맞는지 빠르게 알고 싶다.
- **US-02**: 과장된 리뷰 대신, 취향 기반 질문 몇 개로 ‘맞춤’ 판단을 받고 싶다.
- **US-03**: 결과가 왜 그런지 간단한 이유(해석)를 보고 싶다.

### 플로우 (홍길동전 예시)

1. 카드에서 **홍길동전** 선택 →
2. **Dr. 스토리** 캐릭터 등장, “상담 시작” →
3. LLM이 작품 요약을 내부적으로 참고해 **5\~6개 질문 + 해석 규칙** 생성 →
4. 프런트가 질문을 순차 제시(라디오/리커트) →
5. 응답 묶음 서버 전송 → **적합도 계산(점수/라벨/설명)** →
6. **처방전** 노출(점수, 맞춤 코멘트, 읽기 팁, 주의 포인트)

---

## 3) 기능 명세 (MVP)

### 3.1 질문 생성

- 입력: 하드코딩된 작품 텍스트(홍길동전), 시스템 프롬프트(역할/톤), 사용자 언어(ko).
- 출력:

  - `questions[5..6]`: 질문 텍스트, 응답 스케일(예/아니오 or 5점), 해석 규칙(응답→가중치).
  - `dimensions`: 예) 권선징악, 복수서사, 가족/신분갈등, 로맨스 비중, 서사 속도.

- 제약: **스포일러 최소화**(초반 설정·톤 중심), **웹소설 문법 차용**(사이다/고구마 등 친숙한 용어).

### 3.2 응답 수집 UI

- 각 질문당 선택지 2\~5개.
- 진행도(스텝퍼), 1문항당 1\~2초 내 선택 유도.

### 3.3 적합도 계산

- **규칙 기반 가중합 + LLM 보정(선택)**:

  - 규칙: 질문별 가중치(0.5\~2.0) × 정규화 응답(0\~1) 합산 → 0\~100점.
  - 보정(옵션): 응답 요약을 LLM에 투입, “규칙 점수 대비 상향/하향 ±10” 제안 수용(LLM 실패 시 스킵).

- 라벨: `잘 맞음(≥75) / 중간(50~74) / 비추천(<50)`
- 해석: **상위 2개 찬성/거부 신호**를 뽑아 자연어 코멘트 생성.

### 3.4 처방전 출력

- 구성: 점수(배지), 라벨, 핵심 이유 Top2, **읽기 팁 1\~2개**(예: “권선징악 직진 시원함 기대”, “로맨스 비중 낮음”), **주의 포인트**.
- CTA(가상): “이 작품 시작하기” / “다른 작품 상담받기”(MVP에선 더미)

### 3.5 에러/옵스

- LLM 실패 시: **캐시된 기본 질문 세트** 사용.
- 타임아웃: 6초 초과 시 기본 세트로 폴백.
- 로깅: 질문 세트 ID, 응답, 점수, 라벨, 경로.

---

## 4) 정보 구조 & 데이터 모델 (서버 메모리/파일 캐시 수준)

```yaml
Work:
  id: "hong-gildong"
  title: "홍길동전"
  text: "<하드코딩 원문/요약>"
  default_question_set_id: "base-v1"

QuestionSet:
  id: "qs-<uuid>"
  work_id: "hong-gildong"
  questions:
    - id: "q1"
      text: "권선징악 중심의 사이다 전개를 좋아하시나요?"
      type: "binary" # binary | likert5
      weight: 1.5
      interpret: { "yes": 1, "no": 0 } # likert는 0..1 정규화
      dimension: "권선징악"
  created_from: "llm|static"

Session:
  id: "sess-<uuid>"
  work_id: "hong-gildong"
  question_set_id: "qs-..."
  answers:
    - { question_id:"q1", value:"yes" } # or 1..5
  result:
    score: 82
    label: "잘 맞음"
    reasons: ["권선징악 선호 강함", "로맨스 비중 낮아도 무관"]
    tips: ["초반부 템포 빠름, 바로 몰입 가능"]
    caveats: ["현대 로맨스 요소는 적음"]
  created_at: <ts>
```

---

## 5) API 설계 (MVP)

### POST `/api/question-set`

- **기능**: 작품 기반 질문 생성(LLM) 또는 기본 세트 반환.
- 요청:

```json
{ "workId": "hong-gildong", "lang": "ko" }
```

- 응답:

```json
{
  "questionSetId": "qs-abc",
  "workId": "hong-gildong",
  "questions": [
    {
      "id": "q1",
      "text": "권선징악...좋아하시나요?",
      "type": "binary",
      "weight": 1.5,
      "dimension": "권선징악"
    },
    {
      "id": "q2",
      "text": "로맨스 비중이 낮아도 괜찮나요?",
      "type": "binary",
      "weight": 1.2,
      "dimension": "로맨스"
    },
    {
      "id": "q3",
      "text": "주인공의 출신/신분 갈등 서사를 선호하시나요?",
      "type": "likert5",
      "weight": 1.4,
      "dimension": "신분갈등"
    },
    {
      "id": "q4",
      "text": "복수/응징 서사를 즐기시나요?",
      "type": "likert5",
      "weight": 1.6,
      "dimension": "복수"
    },
    {
      "id": "q5",
      "text": "고전 어투/서술 톤에 거부감이 없으신가요?",
      "type": "likert5",
      "weight": 1.3,
      "dimension": "톤"
    },
    {
      "id": "q6",
      "text": "느슨한 로맨스 대신 가족/도덕 중심을 선호하시나요?",
      "type": "binary",
      "weight": 1.0,
      "dimension": "가치관"
    }
  ]
}
```

### POST `/api/evaluate`

- **기능**: 응답을 점수화하고 처방전 반환.
- 요청:

```json
{
  "sessionId": "sess-123",
  "questionSetId": "qs-abc",
  "answers": [
    { "questionId": "q1", "value": "yes" },
    { "questionId": "q2", "value": "no" },
    { "questionId": "q3", "value": 4 },
    { "questionId": "q4", "value": 5 },
    { "questionId": "q5", "value": 3 },
    { "questionId": "q6", "value": "yes" }
  ]
}
```

- 응답:

```json
{
  "score": 78,
  "label": "잘 맞음",
  "reasons": ["복수/권선징악 선호", "고전 톤 허용"],
  "tips": ["초반부 정의 구현 쾌감 포인트 집중해서 읽어보세요"],
  "caveats": ["로맨스 결여를 크게 중시한다면 맞지 않을 수 있어요"]
}
```

---

## 6) LLM 프롬프트 설계 (샘플)

### 시스템 프롬프트

```
당신은 카카오페이지용 취향 상담사 'Dr. 스토리'입니다.
- 스포일러 없이, 작품의 톤/주제/구조/클리셰 관점의 질문 5~6개를 만드세요.
- 각 질문은 'binary' 혹은 'likert5' 중 택1.
- 질문마다 해석 기준(찬성/반대가 적합도에 주는 방향)을 설명할 내부 메모를 JSON으로 포함.
- 결과는 JSON만 반환.
```

### 사용자 프롬프트 (홍길동전 하드코딩 텍스트)

```
<작품 개요 요약문/발췌 텍스트...>
위 작품이 사용자 취향에 맞는지 가늠할 질문 5~6개를 생성하고,
각 질문의 적합도 가중치(0.5~2.0)와 dimension을 제안하세요.
JSON 필드: questions[].text,type,weight,dimension,interpret_note
```

### 해석/보정 프롬프트 (옵션)

```
다음 응답 요약을 바탕으로, 규칙 기반 점수 0~100에 대해 -10~+10 범위 내 보정 값을 제안하고,
상위 2개 이유와 팁/주의 포인트를 한국어로 간결히 제시하세요.
입력: {응답요약, dimension별 성향, 규칙점수}
출력: {delta, reasons[2], tips[1..2], caveats[0..1]}
```

---

## 7) 적합도 산식 (구체)

- **정규화**:

  - binary: yes=1, no=0
  - likert5: (value-1)/4 → 0..1
  - 질문에 “거부 선호” 성격이면 **1 - 정규화값**으로 반전(질문 메타에 `invert:true`)

- **가중합**: `score_raw = Σ(weight_i × norm_i)`
- **정규화**: `score = round( 100 × score_raw / Σ(weight_i) )`
- **보정**(옵션): `score = clamp(score + delta, 0, 100)`
- **라벨**: 0\~49 비추천 / 50\~74 보통 / 75\~100 잘 맞음

---

## 8) UI/UX 스케치

- **작품 카드**: 썸네일, 장르 태그, “상담 시작”
- **상담 화면**: 상단 Dr. 스토리 아바타(말풍선), 하단 질문 카드(라디오/리커트), 진행도(6단계)
- **처방전**: 원형 게이지(점수), 라벨 배지, 이유 Top2, 팁/주의, 다시하기 버튼

---

## 9) 기술 스택 & 모노레포

### 모노레포

- **pnpm + Turborepo**
- 패키지: `apps/web`(프론트), `apps/api`(백엔드), `packages/ui`(공용 컴포넌트), `packages/core`(도메인 로직/프롬프트/스키마)

### 프런트엔드

- **Next.js 14 (App Router)** + TypeScript
- 상태: **Zustand**(경량)
- UI: **TailwindCSS**, shadcn/ui
- 폼: **react-hook-form + zod**
- 통신: **fetch/React Query(경량 캐시)**

### 백엔드

- **Fastify (Node/TS)** 또는 **NestJS(선호 시)** — 2시간이면 **Fastify** 추천
- 스키마: **zod**
- LLM SDK: **Google Generative AI SDK**(Gemini) - 키는 `.env`
- 데이터: 인메모리 캐시(필요 시 파일 캐시). DB 불필요.

### 공통

- ESLint/Prettier, tsconfig path alias
- 테스트: Vitest(핵심 함수만 2\~3개 스냅샷)
- 배포: 로컬/버셀(웹) + Render/Cloud Run(백)

---

## 10) 디렉터리 구조 (요약)

```
.
├─ apps/
│  ├─ web/            # Next.js
│  └─ api/            # Fastify
├─ packages/
│  ├─ core/           # 도메인 로직(점수화/프롬프트/스키마)
│  └─ ui/             # 버튼/게이지/카드 등
└─ turbo.json
```

---

## 11) 개발 체크리스트 (2시간 플랜)

**T0\~T15**

- Turborepo + pnpm 워크스페이스 초기화
- packages/core: zod 스키마, 점수 함수, 기본 질문세트(폴백) 작성
- apps/api: `/question-set`, `/evaluate` Fastify 엔드포인트, LLM 연동(타임아웃/폴백)

**T15\~T75**

- apps/web: 작품 카드 + 상담 플로우(스텝퍼) + 폼
- 결과(게이지, 배지, 이유/팁/주의) 화면
- 에러/로딩/폴백 처리

**T75\~T105**

- 간단한 유닛 테스트(core 점수화, invert, 정규화)
- UI 폴리시싱(shadcn 컴포넌트 적용)

**T105\~T120**

- 최종 QA(LLM 실패 시 폴백 동작), 환경변수/키 체크
- 스크린샷 캡처/README

---

## 12) 기본 질문 세트 (폴백, 하드코딩 예시)

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "권선징악의 통쾌한 전개를 좋아하시나요?",
      "type": "binary",
      "weight": 1.6,
      "dimension": "권선징악"
    },
    {
      "id": "q2",
      "text": "로맨스 비중이 낮아도 괜찮나요?",
      "type": "binary",
      "weight": 1.2,
      "dimension": "로맨스"
    },
    {
      "id": "q3",
      "text": "신분/가족 갈등 중심 서사를 선호하시나요?",
      "type": "likert5",
      "weight": 1.4,
      "dimension": "신분갈등"
    },
    {
      "id": "q4",
      "text": "복수·응징 요소가 있는 이야기를 즐기시나요?",
      "type": "likert5",
      "weight": 1.6,
      "dimension": "복수"
    },
    {
      "id": "q5",
      "text": "고전체 어투나 서술 톤에 거부감이 없으신가요?",
      "type": "likert5",
      "weight": 1.3,
      "dimension": "톤"
    },
    {
      "id": "q6",
      "text": "느릿한 로맨스 대신 도덕·가치 중심을 선호하시나요?",
      "type": "binary",
      "weight": 1.0,
      "dimension": "가치관"
    }
  ]
}
```

---

## 13) 보안·가드레일

- 스포일러 최소화 정책(질문/결과에서 구체 사건·반전 금지).
- 개인정보 미수집(세션 ID로만 추적).
- LLM 안전 가이드(폭력/차별 발화 방지, 중립적 코칭 톤).

---

## 14) 리스크 & 완화

- **LLM 변동성**: 폴백 질문 세트, 응답 JSON 파서/스키마 검증.
- **시간 초과**: 요청 6초 타임아웃 + 캐시.
- **톤 이질감**: “상담실” 캐릭터 가이드라인(말투 템플릿).

---

## 15) 샘플 코드 스니펫 (핵심 로직; 타입/가중합)

```ts
// packages/core/scoring.ts
import { z } from "zod";

export const Answer = z.union([
  z.object({ type: z.literal("binary"), value: z.enum(["yes", "no"]) }),
  z.object({ type: z.literal("likert5"), value: z.number().min(1).max(5) }),
]);

export type AnswerT = z.infer<typeof Answer>;

export function normalize(a: AnswerT) {
  if (a.type === "binary") return a.value === "yes" ? 1 : 0;
  return (a.value - 1) / 4; // 1..5 -> 0..1
}

export function weightedScore(
  items: { weight: number; norm: number; invert?: boolean }[]
) {
  const wsum = items.reduce((s, i) => s + i.weight, 0);
  const ssum = items.reduce(
    (s, i) => s + i.weight * (i.invert ? 1 - i.norm : i.norm),
    0
  );
  return Math.round((ssum / Math.max(wsum, 0.0001)) * 100);
}

export function labelOf(score: number) {
  if (score >= 75) return "잘 맞음";
  if (score >= 50) return "보통";
  return "비추천";
}
```

---

## 16) README 요약(배포용)

- `.env`

  - `GEMINI_API_KEY=...`

- 실행

  - 루트: `pnpm i`
  - `pnpm --filter @app/api dev`
  - `pnpm --filter @app/web dev`

- 데모 경로

  - `/` 작품 카드 → `/consult` 상담 → 결과

---

## 17) 확장 아이디어(데모 이후)

- 다작품 지원(작품 메타 + 초반 3\~5화 요약 텍스트만 사용).
- **다중 에이전트**: 질문 생성/스포일러 감시/결과 에디터.
- **A/B**: 질문 수(4 vs 6), 스케일 타입, 톤 실험.
- **구매 연결**: 결과→작품 상세/바로보기(전환 측정).

---

### 부록) 질문 생성 프롬프트 예시(요청하신 문구 반영)

```
사용자에게 이 웹소설이 취향에 맞는지 미리 파악할 수 있도록 여러 질문을 해야 해.
실제로 홍길동전은 웹소설이 아니지만 지금은 데모로써 사용자의 취향을 검사할 수 있도록 질문을 구성해줘.
5~6개 정도의 질문을 만들어주면 될 것 같아. 질문의 응답을 해석하는 방법도 덧붙여서 알려줘.
예시)
- 권선징악 형태의 사이다물을 좋아하시나요?
- 로맨스가 없는 소설은 어떠세요?
등등

---
<소설 내용: (하드코딩된 요약/발췌)>
```
