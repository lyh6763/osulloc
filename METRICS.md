# 오설록 리디자인 — 성과 실측 기록

> 케이스 스터디 ⑤결과 블록의 근거 데이터. 배포 후 라이브 URL 기준으로 재측정 예정.

## 측정 환경
- 일자: 2026-07-09
- 도구: Lighthouse CLI (headless Chrome, 모바일 시뮬레이션 기본 프리셋) · axe-core (브라우저 주입 실행)
- 대상: 로컬 정적 서버 (`npx serve`, localhost:4174)

## Lighthouse (파비콘·필터 대비 수정 반영 후)

| 페이지 | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| index.html | 99 | **100** | 100 | 100 | 1.7s | **0** | 0ms |
| story.html | 99 | **100** | 100 | 100 | 1.5s | **0** | 0ms |
| products.html | **100** | **100** | 100 | 100 | 1.2s | **0** | 10ms |

- 목표 대비: LCP < 2.5s ✅ · CLS < 0.1 ✅ (완전 0) · Lighthouse 90+ ✅
- Perf 99는 실행 간 변동 범위 (1차 측정 시 3페이지 모두 100)

## axe-core

| 페이지 | 위반 | 비고 |
|---|---|---|
| index.html | **0건** | |
| story.html | **0건** | |
| products.html | **0건** | 필터 상태 전환 중(양방향)에도 0건 재검증 |

## 트러블슈팅 기록 (케이스 스터디 ③설계 결정 소재)

1. **필터 버튼 전환 중 저대비 프레임** — `background-color`는 150ms 트랜지션되는데 `color`는 즉시 flip → 눌림 해제 순간 1.07:1 프레임 발생 (axe가 포착).
   해결: 상태 색 전환은 트랜지션 없이 즉시, 트랜지션은 `border-color`(호버)만.
   교훈: **정적 대비 검증만으로는 부족 — 상태 전환 중간 프레임도 접근성 표면이다.**
2. **favicon.ico 404** → 콘솔 에러 → Best Practices 96. SVG data URI 파비콘으로 요청 자체를 제거.

## 남은 측정 (배포 후)
- [ ] 라이브 URL(GitHub Pages) 기준 재측정 → 케이스 스터디 게시 수치로 확정
- [ ] JS off 콘텐츠 완전성 확인 스크린샷
- [ ] 키보드 완주 녹화 (탭 순서: 스킵링크 → GNB → 필터 → 카드)
