# OSULLOC Redesign — 제주에서 찻잔까지

> 웹 퍼블리싱 학습용 브랜드 리디자인 습작입니다. 실제 오설록·아모레퍼시픽과 무관하며,
> 제품·가격·연혁 정보는 학습 목적으로 재구성되었습니다.

**Live**: https://lyh6763.github.io/osulloc/

프로모션에 묻힌 브랜드 스토리를 전면으로 — 다원의 사계에서 찻잔까지의 여정을
**스크롤 하이재킹 없이**, JS가 꺼져 있어도 서사가 성립하는 구조로 구현했습니다.

## 페이지

| 페이지 | 내용 | 핵심 기술 |
|---|---|---|
| `index.html` | 사계 챕터 스크롤 내러티브 · 시그니처 라인업 · 티뮤지엄 | sticky 장면 + 캡션 오버레이, IO `once` 리빌, `animation-timeline: view()` + 폴백 |
| `story.html` | 1979~2026 브랜드 연대기 · 철학 | 네이티브 가로 스크롤 + `scroll-snap`, 키보드 접근 가능 스크롤러, 마우스용 이전/다음 버튼(JS 향상) |
| `products.html` | 12제품 × 4카테고리 필터 | 점진적 향상 필터 (JS off 시 전 제품 노출), `aria-live` 결과 공지 |

## 원칙

- **0 프레임워크** — HTML·CSS·바닐라 JS
- **점진적 향상** — 모든 콘텐츠는 정적 HTML에 존재, JS는 편의를 더할 뿐
- **모션 배려** — `prefers-reduced-motion` 시 챕터가 정적 레이아웃으로 재구성
- **애니메이션은 `transform`/`opacity`만** — 레이아웃 유발 속성 금지

## 최신 측정 결과 (2026-09-30 · GitHub Pages 모바일 프리셋)

| 페이지 | Lighthouse (Perf/A11y/BP/SEO) | LCP | CLS | axe |
|---|---|---|---|---|
| index | 100 / 100 / 100 / 100 | 1.35s | 0 | Lighthouse 접근성 0건 |
| story | 100 / 100 / 100 / 100 | 0.86s | 0 | Lighthouse 접근성 0건 |
| products | 100 / 100 / 100 / 100 | 0.87s | 0 | Lighthouse 접근성 0건 |

공개 URL에서 페이지당 3회 측정한 중앙값입니다. 메인은 히어로를 `<picture>` 아트 디렉션으로 바꿔
모바일 이미지 전송량을 197KB → 70KB로 줄이며 90 → 100, LCP 2.0s → 1.35s로 개선했습니다.
axe가 판정하지 못하는 사진 위 텍스트 대비는 스모크 테스트에서 픽셀 단위로 따로 검증합니다. 세부 수치와 로컬 기준값은
[METRICS.md](METRICS.md), HTML·JSON 원본 보고서는 [`reports/lighthouse-live`](reports/lighthouse-live)에서 확인할 수 있습니다.

이미지 자산 기록: [ASSETS.md](ASSETS.md)

## 로컬 실행

정적 사이트입니다. 아무 정적 서버로 열면 됩니다:

```bash
npx serve .
```

## 자동 검증

Playwright 스모크 테스트가 페이지 로딩, 제품 필터, JS-off 폴백, 연대기 키보드 탐색,
키보드 포커스 순서, 360px 모바일 오버플로, 히어로 텍스트 대비(픽셀 측정), 반응형 히어로 이미지 선택,
한글 단어 줄바꿈, 인쇄 레이아웃, 연대기 버튼·정렬, 메인·제품 페이지 데이터 일치를 확인합니다.

```bash
npm install
npx playwright install chromium
npm test
```
