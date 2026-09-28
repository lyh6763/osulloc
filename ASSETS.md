# 오설록 리디자인 — 이미지 교체 슬롯 가이드

히어로와 카테고리 대표 제품은 프로젝트 전용 AI 생성 이미지를 WebP로 최적화해 적용했다.
사계 챕터와 나머지 제품 비주얼은 인라인 SVG 아트 디렉션을 유지한다.

## 적용된 이미지

| 파일 | 용도 | 크기 |
|---|---|---|
| `assets/images/jeju-tea-field.webp` | 메인 히어로 · 공유 이미지 | 1672×941 |
| `assets/images/tea-collection.webp` | 녹차 대표 제품 | 1200×900 |
| `assets/images/fermented-tea.webp` | 발효차 대표 제품 | 1200×900 |
| `assets/images/black-tea.webp` | 홍차 대표 제품 | 1200×900 |
| `assets/images/blended-tea.webp` | 블렌디드 티 대표 제품 | 1200×900 |
| `assets/images/teaware-set.webp` | 티웨어 대표 제품 | 1200×900 |
| `assets/images/og-home.jpg` | 메인·스토리 공유 미리보기 | 1200×630 |
| `assets/images/og-products.jpg` | 제품 공유 미리보기 | 1200×630 |

제품 이미지는 브랜드 로고와 실제 패키지를 복제하지 않은 학습용 목업이다.

## 남은 교체 슬롯

| 슬롯 | 위치 | 권장 소재 (검색어) | 권장 스펙 |
|---|---|---|---|
| 챕터1 봄 | `index.html` ch1 SVG | "jeju green tea field mist" | 1920×1200, AVIF/WebP, `<picture>` 모바일 세로 크롭 |
| 챕터2 여름 | ch2 SVG | "tea leaf macro" | 동일 |
| 챕터3 가을 | ch3 SVG | "roasting tea leaves pan" | 동일 |
| 챕터4 겨울 | ch4 SVG | "green tea cup steam minimal" | 동일 |
| 티뮤지엄 | `index.html` #museum SVG | "osulloc museum" 은 저작권 주의 → "modern museum tea field" | 1200×825 |
| 나머지 제품 카드 | `tv-*` 그라디언트 div | 각 차 제품 스타일 사진 또는 SVG 유지 | 800×600, lazy |

## 교체 시 지켜야 할 것 (plan_C §5·§6)
1. `<picture>` + AVIF/WebP + `width`/`height` 명시 (CLS < 0.1 유지)
2. 챕터 이미지는 `loading="eager"` 첫 장면만, 나머지 `lazy` + `fetchpriority` 관리
3. 텍스트 오버레이 대비 4.5:1 재검증 (캡션 카드가 반투명 흰색이므로 대부분 안전)
4. `role="img"` + 구체적 `aria-label`/`<title>` 유지
