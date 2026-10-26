# OSULLOC Redesign — 제주에서 찻잔까지

> 웹 퍼블리싱 학습용 브랜드 리디자인 습작입니다. 실제 오설록·아모레퍼시픽과 무관하며,
> 제품·가격·연혁 정보는 학습 목적으로 재구성되었습니다.

**Live**: https://lyh6763.github.io/osulloc/

프로모션에 묻혀 있던 브랜드 이야기를 앞으로 꺼내는 것이 목표였습니다. 메인은 제주 다원의 한 해를
계절 순서로 따라가는 스크롤 페이지로 만들었고, 스크롤 동작은 브라우저 기본 그대로 두었습니다.

AI 코딩 도구 Claude Code와 함께 만들었습니다. 소재와 방향(프로모션에 묻혀 있던 브랜드 이야기를 앞으로 꺼내기)은 직접 정했고,
화면을 직접 보며 깨짐·어색한 디자인·문구를 찾아 고치게 했습니다. 성능 측정·대비 계산·테스트 결과를 보고 채택 여부를
판단했습니다(예: preload를 쓰지 않는 방식, 세로 화면 전용 크롭). 코드와 테스트 작성, 측정 실행은 Claude Code가 했습니다.

## 페이지

| 페이지 | 내용 | 구현 |
|---|---|---|
| `index.html` | 사계절 챕터, 시그니처 4종, 티뮤지엄 | sticky 장면 위로 캡션 스크롤, IntersectionObserver 리빌, `animation-timeline: view()` |
| `story.html` | 1979~2026 연대기, 철학, 방문 안내 | 가로 스크롤 + `scroll-snap`, 방향키·Home·End 탐색, 이전/다음 버튼 |
| `products.html` | 12개 제품, 카테고리 필터 | JS가 없으면 필터를 숨기고 전 제품 노출, `aria-live`로 결과 개수 안내 |

## 만들 때 정한 것

- 프레임워크 없이 HTML·CSS·바닐라 JS로 만든다.
- 콘텐츠는 모두 정적 HTML에 두고, JS는 필터·버튼 같은 편의만 더한다.
- `prefers-reduced-motion`이면 sticky 장면을 정적 배치로 바꾼다.
- 애니메이션은 `transform`·`opacity`만 쓴다.
- 웹폰트는 제목 명조 서브셋(61KB) 하나만 쓰고, 본문은 OS 기본 한글 글꼴을 쓴다.

## 측정 결과

2026-10-21 라이브 사이트, Lighthouse 모바일 프리셋, 페이지당 3회 중앙값입니다.

| 페이지 | Perf / A11y / BP / SEO | LCP | CLS |
|---|---|---|---|
| index | 100 / 100 / 100 / 100 | 1.65s | 0.001 |
| story | 100 / 100 / 100 / 100 | 1.21s | 0.001 |
| products | 100 / 100 / 100 / 100 | 1.66s | 0 |

측정 조건과 성능·대비 문제를 해결한 과정은 [METRICS.md](METRICS.md),
이미지 자산과 교체 계획은 [ASSETS.md](ASSETS.md)에 있습니다.

## 접근성

한국형 웹 콘텐츠 접근성 지침 2.2(KWCAG 2.2)의 33개 검사항목으로 세 페이지를 점검했습니다.
항목별 결과와 근거, 고친 내용은 [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md)에 있습니다(2026-10-19 기준 미흡 0).

## 실행과 검증

정적 사이트라 아무 정적 서버로 열면 됩니다.

```bash
npx serve .
```

Playwright 스모크 테스트 17개가 필터, JS가 꺼진 상태, 키보드 탐색, 360px 가로 넘침, 사진 위 텍스트 대비,
명조 서브셋 글자 범위, 인쇄 레이아웃 등을 확인합니다.

```bash
npm install
npx playwright install chromium
npm test
```

`npm run lighthouse`는 라이브 사이트를 재서 `reports/lighthouse-live`에 저장하고,
`npm run lighthouse:local`은 작업 트리를 잽니다.

## 배포

`main`에 push하면 GitHub Actions가 스모크 테스트를 돌리고, 통과했을 때만 사이트 파일을
`gh-pages` 브랜치에 올려 GitHub Pages로 배포합니다.
