# 대전플레이 — React 애니메이션 프론트엔드 (작업용)

이 폴더는 기존 대전플레이 프로토타입을 React + TypeScript로 재구성한 **개발용 소스**입니다.

## UI 라이브러리 역할

- **Anime.js 4:** 브랜드 로고/히어로 등장 및 숫자 카운트 연출 (`src/App.tsx`)
- **Motion for React:** 메뉴 활성화, 카드 호버, 모달, 버튼 탭 애니메이션 (`src/App.tsx`)
- **Bklit UI:** 진행률 다중 링 차트와 분야별 누적 XP 막대 차트 (`src/components/GrowthCharts.tsx`)

## 실행하기

Node.js 20 이상에서 아래 명령을 실행합니다.

```bash
cd frontend
npm install
npm run setup:charts
npm run dev
```

Bklit은 shadcn 레지스트리에서 **컴포넌트 소스를 내려받아 프로젝트 안에 설치**하는 구조입니다. `setup:charts` 실행 후 `src/components/ui` 안의 생성 파일과 컴파일 결과를 확인해 주세요. 컴포넌트 API가 바뀌었다면 최신 공식 문서의 예제에 맞게 `GrowthCharts.tsx`를 조정해야 합니다.

**이번 실행 환경에서는 패키지 서버 접근이 제한되어 npm 설치와 React 빌드까지는 검증하지 못했습니다.** 다만 설치가 필요 없는 디자인 체험판은 `../docs/animated-preview.html`에 준비되어 있습니다. 체험판의 막대/링 그래프는 **Bklit이 아닌 경량 HTML/SVG로 만든 UI 시안**입니다.

## 주요 구현 내용

- 기존 21개 장소와 8개 축제 샘플 JSON 사용
- 분야별 경험치, 누적 XP, 업적 및 방문 기록
- 방문 완료 중복 방지 및 브라우저 로컬 저장
- 장소 필터/검색, 퀘스트 모달, 사진 갤러리
- 이용 조건에 따른 규칙 기반 추천 데모

## 아직 미구현된 부분

실제 GPS·사진 인증, 공식 사진의 권리 확인/자동 수집, DB 로그인/동기화, 백엔드 API 연동, LLM·RAG 추천, 현장 운영시간 자동 검증.
