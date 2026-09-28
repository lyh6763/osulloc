# 오설록 리디자인 — 성과 실측 기록

> 케이스 스터디 ⑤결과 블록의 근거 데이터. 2026-07-09 실측값과 이후 자동 검증 기록을 함께 관리한다.

## 최신 라이브 실측 (2026-09-28 · WebP 비주얼 배포 버전)

- 대상: `https://lyh6763.github.io/osulloc/`
- Lighthouse 13.5.0, Chrome for Testing 153, 모바일 시뮬레이션 기본 프리셋

| 페이지 | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| index | **90** | **100** | **100** | **100** | 0.8s | 2.0s | 0 | 383ms |
| story | **98** | **100** | **100** | **100** | 0.8s | 0.9s | 0 | 179ms |
| products | **97** | **100** | **100** | **100** | 1.0s | 1.3s | 0 | 193ms |

- 최종 세 실행에는 Lighthouse 실행 경고가 없었다.
- 메인은 인라인 사계 비주얼의 초기 렌더링 작업으로 TBT 변동 폭이 있지만 LCP 2.5초 미만, CLS 0.1 미만,
  Lighthouse 90+ 목표를 모두 충족한다. 강제 리플로우 감사 항목도 0건이다.
- 보고서: [`reports/lighthouse-live`](reports/lighthouse-live)의 페이지별 HTML·JSON 파일

## 최신 로컬 실측 (2026-09-28 · WebP 비주얼 적용 버전)

- Lighthouse 13.5.0, 모바일 시뮬레이션 기본 프리셋
- Chrome for Testing 153, 로컬 정적 서버 `http://127.0.0.1:4174`

| 페이지 | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| index | **95** | **100** | **100** | **100** | 1.2s | 2.3s | 0 | 206ms |
| story | **97** | **100** | **100** | **100** | 1.1s | 1.3s | 0 | 199ms |
| products | **98** | **100** | **100** | **100** | 1.1s | 1.2s | 0 | 173ms |

- 보고서: [`reports/lighthouse`](reports/lighthouse)의 페이지별 HTML·JSON 파일
- 최종 세 실행에는 Lighthouse 실행 경고가 없었다. 로컬 CPU 스케줄링에 따라 TBT 편차가 있어
  최종 배포 코드로 각 페이지를 새로 측정한 최신 실행을 보고서로 보존했다.
- 초기 헤더 상태 확인에서 발생하던 강제 레이아웃 읽기를 제거해 실제 스크롤 시에만 DOM을 갱신한다.
- WebP 히어로 추가 후 메인 LCP는 이전 라이브 1.1s에서 로컬 2.3s로 증가했지만 목표 2.5s 이내를 유지한다.

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

## 라이브 실측 (2026-07-09 · https://lyh6763.github.io/osulloc/ — 케이스 스터디 게시 확정 수치)

| 페이지 | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| index | 98 | **100** | **100** | **100** | **1.1s** | **0** |
| story | **100** | **100** | **100** | **100** | **0.9s** | **0** |
| products | **100** | **100** | **100** | **100** | **1.1s** | **0** |

- GitHub Pages CDN·압축 덕에 로컬보다 LCP 개선 (1.7s → 1.1s)
- 배포: repo `lyh6763/osulloc` · main + gh-pages 브랜치

## 자동 스모크 테스트 (2026-09-28)

- Playwright Chromium, 6개 시나리오 통과
- 세 페이지 로딩 및 콘솔 오류 확인
- 제품 필터 결과·카운트·`aria-pressed` 확인
- JS-off 전 제품 노출·필터 숨김·헤더 대비 확인
- 연대기 방향키·Home·End 탐색 확인
- 키보드 포커스 순서와 360px 문서 오버플로 확인

## 남은 측정
- [x] 라이브 URL 기준 재측정 (2026-07-09 완료)
- [x] JS off 콘텐츠 완전성 자동 검증 (2026-09-28)
- [x] 키보드 탐색 자동 검증 (스킵링크 → GNB → 필터, 연대기 방향키)
- [x] WebP 비주얼 적용 버전 Lighthouse 재측정 (2026-09-28)
- [x] 새 버전 배포 후 라이브 URL 기준 Lighthouse 재확인 (2026-09-28)
