# 오설록 리디자인 — 이미지 교체 슬롯 가이드

현재 모든 비주얼은 **인라인 SVG 아트 디렉션**으로 구현되어 있다 (저작권 안전 + LCP/CLS 최적).
실사진으로 업그레이드할 경우 아래 슬롯에 무료 스톡(Unsplash/Pexels, 라이선스 확인)을 적용한다.
**SVG 유지도 유효한 선택** — "일러스트 아트 디렉션"으로 서사화 가능.

| 슬롯 | 위치 | 권장 소재 (검색어) | 권장 스펙 |
|---|---|---|---|
| 챕터1 봄 | `index.html` ch1 SVG | "jeju green tea field mist" | 1920×1200, AVIF/WebP, `<picture>` 모바일 세로 크롭 |
| 챕터2 여름 | ch2 SVG | "tea leaf macro" | 동일 |
| 챕터3 가을 | ch3 SVG | "roasting tea leaves pan" | 동일 |
| 챕터4 겨울 | ch4 SVG | "green tea cup steam minimal" | 동일 |
| 티뮤지엄 | `index.html` #museum SVG | "osulloc museum" 은 저작권 주의 → "modern museum tea field" | 1200×825 |
| 제품 카드 12종 | `tv-*` 그라디언트 div | 각 차 제품 스타일 사진 or 유지 | 800×600, lazy |

## 교체 시 지켜야 할 것 (plan_C §5·§6)
1. `<picture>` + AVIF/WebP + `width`/`height` 명시 (CLS < 0.1 유지)
2. 챕터 이미지는 `loading="eager"` 첫 장면만, 나머지 `lazy` + `fetchpriority` 관리
3. 텍스트 오버레이 대비 4.5:1 재검증 (캡션 카드가 반투명 흰색이므로 대부분 안전)
4. `role="img"` + 구체적 `aria-label`/`<title>` 유지
