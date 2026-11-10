# 오설록 리디자인 — 이미지 교체 슬롯 가이드

히어로, 사계 챕터 4장면, 제품 카드 12개, 티뮤지엄은 프로젝트 전용 AI 생성 이미지를 WebP로 최적화해 적용했다.

## 적용된 이미지

| 파일 | 용도 | 크기 |
|---|---|---|
| `assets/images/jeju-tea-field.webp` | 메인 히어로 (가로 화면 1672w) | 1672×941 |
| `assets/images/jeju-tea-field-1280.webp` | 메인 히어로 (가로 화면 1280w) | 1280×720 |
| `assets/images/jeju-tea-field-960.webp` | 메인 히어로 (가로 화면 960w) | 960×540 |
| `assets/images/jeju-tea-field-portrait.webp` | 메인 히어로 (세로 화면 · 가운데 크롭) | 800×941 |
| `assets/images/season-{spring,summer,autumn,winter}.webp` | 사계 챕터 장면 (가로 화면 1376w) | 1376×768 |
| `assets/images/season-*-960.webp` | 사계 챕터 장면 (가로 화면 960w) | 960×536 |
| `assets/images/season-*-portrait.webp` | 사계 챕터 장면 (세로 화면 · 주인공 쪽 크롭) | 653×768 |
| `assets/images/tea-museum.webp` | 티뮤지엄 (1200w) | 1200×825 |
| `assets/images/tea-museum-800.webp` | 티뮤지엄 (800w) | 800×550 |
| `assets/images/tea-collection.webp` | 녹차 대표 제품 | 1200×900 |
| `assets/images/fermented-tea.webp` | 발효차 대표 제품 | 1200×900 |
| `assets/images/black-tea.webp` | 홍차 대표 제품 | 1200×900 |
| `assets/images/blended-tea.webp` | 블렌디드 티 대표 제품 | 1200×900 |
| `assets/images/teaware-set.webp` | 티웨어 대표 제품 | 1200×900 |
| `assets/images/first-flush-tea.webp` | 우전 | 1200×900 |
| `assets/images/powdered-green-tea.webp` | 가루녹차 | 1200×900 |
| `assets/images/fermented-teabags.webp` | 삼다연 티백 | 1200×900 |
| `assets/images/citrus-blend.webp` | 제주 영귤 블렌드 | 1200×900 |
| `assets/images/chamomile-blend.webp` | 안개 캐모마일 | 1200×900 |
| `assets/images/cast-iron-teapot.webp` | 무쇠 다관 | 1200×900 |
| `assets/images/bamboo-tea-spoon.webp` | 티 메저 스푼 | 1200×900 |
| `assets/images/*-800.webp` | 위 제품 사진 12장의 작은 변형 (`srcset` 800w) | 800×600 |
| `assets/images/og-home.jpg` | 메인·스토리 공유 미리보기 | 1200×630 |
| `assets/images/og-products.jpg` | 제품 공유 미리보기 | 1200×630 |

제품 이미지는 브랜드 로고와 실제 패키지를 복제하지 않은 학습용 목업이다.

### 히어로 반응형 변형 (2026-09-30)

세로 화면에서는 `object-fit: cover`로 가로 이미지의 가운데 약 1/3만 보이므로, 너비별 `srcset`만으로는
모바일 전송량이 줄지 않는다. `<picture>`로 세로 화면(`orientation: portrait`)에는 가운데 크롭본을,
가로 화면에는 `srcset`(960w·1280w·1672w, `sizes="100vw"`)을 제공한다.

- 원본 PNG가 없어 `jeju-tea-field.webp`에서 파생: Chromium canvas로 크롭·리사이즈 후 WebP 품질 0.72 인코딩
  (세로 크롭 x=436, 800×941). 1672w 원본은 재인코딩하지 않는다.
- 모바일(412×823 @1.75x) 히어로 전송량 196.9KB → 69.9KB, 로컬 Lighthouse 모바일 Perf 98 → 100, LCP 2.26s → 1.65s
- 원본 소스가 생기면 원본에서 다시 생성해 재인코딩 손실을 없앨 것

### 제품 카드 7장 추가 (2026-10-21)

아이콘 자리표시였던 카드 7개를 기존 제품 사진 5장과 같은 톤(무로고 보관함·돌·찻잎·자연광 스틸 라이프)으로 채웠다.

- Figma AI 이미지 생성(gemini-3.1-flash-image)으로 1200×896 PNG를 받아, Chromium canvas로 1200×900 cover 리사이즈 후 WebP 품질 0.85 인코딩
- 파일당 54–98KB (기존 제품 사진 59–127KB)
- 자리표시가 사진이 되자 모바일에서 첫 화면 근처 사진이 4장에서 7장으로 늘어, 로컬 Lighthouse(products, 모바일)가
  Perf 99 → 98, LCP 2.12s → 2.34s로 나빠졌다. 카드는 최대 약 370px 폭이라 1200w는 과하다
- 그래서 제품 사진 12장 모두 800w 변형을 두고 `srcset`(800w·1200w) + `sizes`로 제공한다 (홈 시그니처 카드 4개 포함).
  800w는 새 7장은 생성 원본 PNG에서, 기존 5장은 원본이 없어 저장소 WebP에서 파생 (품질 0.8, 26–53KB)
- 모바일 첫 화면에 들어오는 첫 카드(우전)가 LCP 요소가 되므로 이 한 장만 `lazy` 대신 `fetchpriority="high"`
- 결과: 로컬 Perf 99, LCP 2.12s로 교체 전과 같음

### 사계 챕터 사진 (2026-11-02)

도형 SVG 4개가 첫 화면·제품의 사진과 그림 언어가 맞지 않아 사진으로 바꿨다.

- Figma AI 이미지 생성(gemini-3.1-flash-image)으로 1376×768 PNG를 받았다. 제품 사진과 같은 톤(자연광, 차분한 흙빛,
  글자·로고·사람 없음)에, 주인공을 오른쪽 절반에 두고 왼쪽은 글 판이 올라가도록 흐리게 요청
  - 봄: 안개 낀 이른 아침 차밭의 새순 · 여름: 현무암 돌담 위 대나무 채반에 시들리는 찻잎
  - 가을: 차나무에 핀 흰 차꽃 · 겨울: 현무암 위 김 오르는 녹차 한 잔과 붉은 동백
  - 가을 첫 생성은 사진 두 장을 이어 붙인 모양이라 버리고 다시 만들었다. 노을빛이 진해 채도를 0.85로 낮췄다
- Chromium canvas로 가로 원본(품질 0.78)·960w(0.78)·세로 크롭 653×768(0.74)을 WebP로 만들었다. 세로 크롭은
  주인공이 있는 오른쪽에서 잘랐다(x = 봄 640, 여름 723, 가을 723, 겨울 680). 파일당 37–99KB
- 그대로 lazy로 두면 첫 화면 사진과 받는 순서를 다툰다. 받는 시점은 METRICS.md 4절

### 티뮤지엄 사진 (2026-11-02)

메인에서 마지막으로 남은 도형 SVG였다. 실제 건물을 흉내 내지 않도록 '차밭 너머의 낮은 현대식 전시관'으로 요청했다.

- Figma AI 이미지 생성(gemini-3.1-flash-image)으로 1264×848 PNG를 받았다. 계절 사진과 같은 톤(부드러운 낮빛,
  차분한 흙빛, 사람·글자·간판·로고 없음)에 곡선 차밭 이랑, 현무암, 오름 능선을 넣었다
- 자리 비율 16:11에 맞춰 가로 가운데를 1233×848로 자르고, Chromium canvas로 1200w(138KB)·800w(79KB) WebP(품질 0.8)
- 페이지 아래쪽이라 `lazy`. 데스크톱에서는 약 590px 폭이라 `sizes`로 800w를 먼저 고르게 했다

## 웹폰트

| 파일 | 용도 | 크기 |
|---|---|---|
| `assets/fonts/noto-serif-kr-subset.woff2` | 제목 명조 (Noto Serif KR 가변 600–700, SIL OFL 1.1) | 60.6KB |
| `assets/fonts/noto-serif-kr-subset.txt` | 서브셋에 담을 글자 목록 (원본 데이터) | — |

제목에 쓰인 글자만 담은 서브셋이다. 제목에 새 글자를 쓰면 스모크 테스트가 빠진 글자를 알려준다 →
txt에 추가 → `npm run fonts`(Google Fonts `text=` API로 재생성) → woff2와 txt를 함께 커밋.
본문은 웹폰트 없이 OS 기본 한글 글꼴을 쓴다 (선택 근거: [METRICS.md](METRICS.md)).

## 아이콘

| 파일 | 용도 | 크기 |
|---|---|---|
| (HTML `<head>`의 data-URI SVG) | 파비콘 — 찻잎 한 장, `--green-700` | — |
| `assets/icons/favicon-32.png` | SVG 파비콘을 못 쓰는 브라우저용, 투명 바탕 | 32×32 |
| `assets/icons/apple-touch-icon.png` | iOS 홈 화면 아이콘, `--cream-50` 바탕(iOS는 투명한 곳을 검게 채운다) | 180×180 |

PNG 두 장은 SVG와 같은 도형을 Playwright Chromium으로 그린 것이다(`npm run icons`, `scripts/build-icons.mjs`).
도형이나 색을 바꾸면 모든 HTML의 data-URI와 스크립트를 함께 고친 뒤 다시 만든다. (2026-11-10)

## 교체 시 지켜야 할 것
1. `<picture>` + AVIF/WebP + `width`/`height` 명시 (CLS < 0.1 유지)
2. 챕터 이미지는 `loading="eager"` 첫 장면만, 나머지 `lazy` + `fetchpriority` 관리
3. 텍스트 오버레이 대비 4.5:1 재검증 (캡션 카드가 반투명 흰색이므로 대부분 안전)
4. 사진이 보여 주는 장면을 구체적으로 적은 `alt` 유지
