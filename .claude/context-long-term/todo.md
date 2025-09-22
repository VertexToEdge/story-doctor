# 스토리 상담실 (Dr. 스토리) - 개발 투두리스트

## 📋 프로젝트 개요
- **목표**: LLM 기반 웹소설 적합도 검사 서비스 MVP 개발
- **기간**: 2시간 집중 개발
- **대상 작품**: 홍길동전 (하드코딩)
- **기술 스택**: pnpm + Turborepo, Next.js 14, Fastify, Gemini API

---

## 🎯 Phase 1: 프로젝트 초기화 (0-15분) ✅ 완료

### 1.1 모노레포 구조 설정
- [x] pnpm 설치 및 워크스페이스 초기화 (pnpm-workspace.yaml)
- [x] Turborepo 구성 (turbo.json:1-20)
- [x] 기본 디렉터리 구조 생성
  ```
  ├─ apps/
  │  ├─ web/    # Next.js 14 (App Router)
  │  └─ api/    # Fastify 서버
  ├─ packages/
  │  ├─ core/   # 도메인 로직
  │  └─ ui/     # 공통 컴포넌트
  ```

### 1.2 의존성 설치
- [x] 루트 package.json 설정 (package.json:1-24)
- [x] TypeScript 설정 (tsconfig.json:1-33, 경로 별칭 포함)
- [x] ESLint/Prettier 공통 설정 (.eslintrc.js:1-31, .prettierrc:1-11)

---

## 🔧 Phase 2: Core 패키지 개발 (15-30분) ✅ 완료

### 2.1 타입 및 스키마 정의
- [x] Zod 스키마 작성 (packages/core/src/schemas/index.ts:1-119)
- [x] TypeScript 타입 export
- [x] 응답 정규화 유틸 (binary/likert5)

### 2.2 점수화 로직
- [x] normalize 함수 구현 (packages/core/src/scoring/index.ts:21-58)
- [x] calculateWeightedScore 함수 구현 (packages/core/src/scoring/index.ts:60-93)
- [x] labelOf 함수 구현 (packages/core/src/scoring/index.ts:95-108)
- [x] extractTopReasons 로직 (packages/core/src/scoring/index.ts:110-141)

### 2.3 기본 데이터 및 프롬프트
- [x] 홍길동전 텍스트 요약 하드코딩 (packages/core/src/data/works.ts:16-48)
- [x] 폴백용 기본 질문 세트 (packages/core/src/data/fallback-questions.ts:17-61)
- [x] LLM 프롬프트 템플릿 작성 (packages/core/src/prompts/index.ts:1-170)
  - 질문 생성 프롬프트
  - 결과 해석 프롬프트

---

## 🚀 Phase 3: API 서버 개발 (30-60분) ✅ 완료

### 3.1 Fastify 서버 초기화
- [x] Fastify 앱 생성 및 기본 설정 (apps/api/src/index.ts:1-68)
- [x] CORS 설정 (apps/api/src/index.ts:39-42)
- [x] 환경변수 설정 (.env.example, .env 구성 완료)
- [x] 에러 핸들링 미들웨어 (apps/api/src/plugins/error-handler.ts:1-82)

### 3.2 LLM 연동
- [x] Gemini API SDK 설정 (apps/api/src/services/llm.ts:30-39)
- [x] 질문 생성 함수 구현 (apps/api/src/services/llm.ts:47-76)
  - 6초 타임아웃 처리
  - 폴백 로직 (기본 질문 세트)
- [x] 응답 파싱 및 검증 (Zod)

### 3.3 API 엔드포인트
- [x] POST `/api/question-set` 구현 (apps/api/src/routes/question-set.ts:35-111)
  - 입력: workId, lang
  - 출력: 질문 세트 (JSON)
  - LLM 실패 시 폴백 처리
  
- [x] POST `/api/evaluate` 구현 (apps/api/src/routes/evaluate.ts:30-139)
  - 입력: sessionId, questionSetId, answers
  - 점수 계산 로직
  - 라벨 및 이유 생성
  - 처방전 응답 (점수, 라벨, 팁, 주의)

### 3.4 데이터 관리
- [x] 인메모리 캐시 구현 (apps/api/src/services/storage.ts:130-184)
- [x] 세션 관리 (apps/api/src/services/storage.ts:30-80)

---

## 💻 Phase 4: Web 프론트엔드 개발 (60-90분)

### 4.1 Next.js 앱 초기화
- [ ] Next.js 14 App Router 설정
- [ ] TailwindCSS 설정
- [ ] shadcn/ui 컴포넌트 설치
- [ ] Zustand 상태관리 설정

### 4.2 페이지 및 라우팅
- [ ] 홈페이지 (작품 카드 선택)
- [ ] 상담 페이지 (/consult)
- [ ] 결과 페이지 (/result)

### 4.3 상담 플로우 구현
- [ ] Dr. 스토리 캐릭터 UI
- [ ] 질문 스텝퍼 (6단계 진행도)
- [ ] 질문 카드 컴포넌트
  - Binary 선택지 (예/아니오)
  - Likert5 선택지 (5점 척도)
- [ ] react-hook-form + zod 폼 검증

### 4.4 API 통신
- [ ] API 클라이언트 함수
- [ ] React Query 또는 fetch 구현
- [ ] 로딩/에러 상태 처리

### 4.5 결과 화면
- [ ] 원형 게이지 (점수 시각화)
- [ ] 라벨 배지 (잘 맞음/보통/비추천)
- [ ] 이유 카드 (Top 2)
- [ ] 읽기 팁 & 주의사항 표시
- [ ] "다시하기" 버튼

---

## 🎨 Phase 5: UI 컴포넌트 패키지 (90-105분)

### 5.1 공통 컴포넌트
- [ ] Button 컴포넌트
- [ ] Card 컴포넌트
- [ ] Progress/Stepper 컴포넌트
- [ ] Badge 컴포넌트
- [ ] CircularGauge 컴포넌트

### 5.2 스타일링
- [ ] 테마 설정 (컬러, 폰트)
- [ ] 반응형 디자인
- [ ] 애니메이션 (진행도, 게이지)

---

## ✅ Phase 6: 테스트 및 마무리 (105-120분)

### 6.1 유닛 테스트
- [ ] Core 패키지 테스트 (점수화 로직)
- [ ] 정규화 함수 테스트
- [ ] 라벨 변환 테스트

### 6.2 통합 테스트
- [ ] 전체 플로우 테스트 (작품 선택 → 질문 → 결과)
- [ ] LLM 폴백 동작 확인
- [ ] 에러 케이스 처리 확인

### 6.3 최종 점검
- [ ] 환경변수 설정 확인
- [ ] README.md 작성
- [ ] 스크린샷 캡처
- [ ] 빌드 및 실행 테스트

---

## 📊 성공 지표 체크리스트

- [ ] 상호작용 완료율 ≥ 70%
- [ ] 평균 소요시간 ≤ 90초
- [ ] LLM 호출 실패율 ≤ 5%
- [ ] 모든 에러 케이스 처리

---

## 🔥 Critical Path (우선순위)

1. **필수**: 모노레포 초기화 → Core 스키마/점수화 → API 엔드포인트 → 상담 플로우
2. **중요**: LLM 연동 → 결과 화면 → 폴백 처리
3. **선택**: UI 폴리싱 → 테스트 → 애니메이션

---

## 📝 메모

### 홍길동전 기본 질문 세트 (폴백용)
1. 권선징악의 통쾌한 전개를 좋아하시나요? (binary, weight: 1.6)
2. 로맨스 비중이 낮아도 괜찮나요? (binary, weight: 1.2)
3. 신분/가족 갈등 중심 서사를 선호하시나요? (likert5, weight: 1.4)
4. 복수·응징 요소가 있는 이야기를 즐기시나요? (likert5, weight: 1.6)
5. 고전체 어투나 서술 톤에 거부감이 없으신가요? (likert5, weight: 1.3)
6. 느릿한 로맨스 대신 도덕·가치 중심을 선호하시나요? (binary, weight: 1.0)

### 환경 설정
```bash
# .env
GEMINI_API_KEY=your_api_key_here

# 실행 명령어
pnpm install
pnpm --filter @story-doctor/api dev    # 백엔드 서버 (포트 3001)
pnpm --filter @story-doctor/web dev    # 프론트엔드 (포트 3000)
```

---

## 🚨 리스크 관리

| 리스크 | 대응방안 |
|--------|---------|
| LLM 응답 지연 | 6초 타임아웃 + 폴백 질문 세트 |
| LLM 응답 파싱 실패 | Zod 스키마 검증 + 기본값 |
| 프론트-백 통신 실패 | 에러 바운더리 + 재시도 로직 |
| 시간 부족 | Critical Path 우선 개발 |

---

## 🎯 완료 기준

- [ ] 홍길동전에 대한 상담 플로우 완성
- [ ] 질문 6개 → 응답 수집 → 점수 계산 → 처방전 표시
- [ ] LLM 실패 시 폴백 동작 확인
- [ ] 로컬 환경에서 정상 실행