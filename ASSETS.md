# 오설록 리디자인 — 이미지 교체 슬롯 가이드

히어로와 제품 카드 12개는 프로젝트 전용 AI 생성 이미지를 WebP로 최적화해 적용했다.
사계 챕터와 티뮤지엄은 인라인 SVG 아트 디렉션을 유지한다.

## 적용된 이미지

| 파일 | 용도 | 크기 |
|---|---|---|
| `assets/images/jeju-tea-field.webp` | 메인 히어로 (가로 화면 1672w) | 1672×941 |
| `assets/images/jeju-tea-field-1280.webp` | 메인 히어로 (가로 화면 1280w) | 1280×720 |
| `assets/images/jeju-tea-field-960.webp` | 메인 히어로 (가로 화면 960w) | 960×540 |
| `assets/images/jeju-tea-field-portrait.webp` | 메인 히어로 (세로 화면 · 가운데 크롭) | 800×941 |
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

## 웹폰트

| 파일 | 용도 | 크기 |
|---|---|---|
| `assets/fonts/noto-serif-kr-subset.woff2` | 제목 명조 (Noto Serif KR 가변 600–700, SIL OFL 1.1) | 60.6KB |
| `assets/fonts/noto-serif-kr-subset.txt` | 서브셋에 담을 글자 목록 (원본 데이터) | — |

제목에 쓰인 글자만 담은 서브셋이다. 제목에 새 글자를 쓰면 스모크 테스트가 빠진 글자를 알려준다 →
txt에 추가 → `npm run fonts`(Google Fonts `text=` API로 재생성) → woff2와 txt를 함께 커밋.
본문은 웹폰트 없이 OS 기본 한글 글꼴을 쓴다 (선택 근거: [METRICS.md](METRICS.md)).

## 남은 교체 슬롯

| 슬롯 | 위치 | 권장 소재 (검색어) | 권장 스펙 |
|---|---|---|---|
| 챕터1 봄 | `index.html` ch1 SVG | "jeju green tea field mist" | 1920×1200, AVIF/WebP, `<picture>` 모바일 세로 크롭 |
| 챕터2 여름 | ch2 SVG | "tea leaf macro" | 동일 |
| 챕터3 가을 | ch3 SVG | "roasting tea leaves pan" | 동일 |
| 챕터4 겨울 | ch4 SVG | "green tea cup steam minimal" | 동일 |
| 티뮤지엄 | `index.html` #museum SVG | "osulloc museum" 은 저작권 주의 → "modern museum tea field" | 1200×825 |

## 교체 시 지켜야 할 것
1. `<picture>` + AVIF/WebP + `width`/`height` 명시 (CLS < 0.1 유지)
2. 챕터 이미지는 `loading="eager"` 첫 장면만, 나머지 `lazy` + `fetchpriority` 관리
3. 텍스트 오버레이 대비 4.5:1 재검증 (캡션 카드가 반투명 흰색이므로 대부분 안전)
4. `role="img"` + 구체적 `aria-label`/`<title>` 유지
