// Stylelint — recommended는 실제 오류(잘못된 속성·값, 중복 선택자, 빈 블록 등)만 잡고
// 코드 모양(따옴표·들여쓰기·색 표기)은 건드리지 않는다. 포매터는 쓰지 않는다.
//
// `npm run lint:css`는 --cache를 켜 둔다. 캐시를 끄면 Stylelint가 캐시 파일을 fs.rmSync로 지우는데,
// Windows의 Node 24.13은 한글이 든 경로(이 저장소 위치)에서 rmSync를 부르면 출력 없이 프로세스가 죽는다.
// 캐시 파일은 git이 무시하는 node_modules/.cache 안에 둔다.
export default {
  extends: ['stylelint-config-recommended'],
  rules: {
    // 끝 요소가 같은 선택자를 파일 전체에서 비교해 순서를 강제한다. 여기서는 헤더 메뉴 링크(.gnb a:hover)와
    // 계절 챕터·푸터 링크(.chapter__tea a, .site-footer a)처럼 같은 요소에 함께 걸릴 수 없는 선택자를 짚는다.
    // 맞추려면 머리글 → 본문 → 푸터 순서로 묶은 구역을 깨야 하므로 끈다.
    'no-descending-specificity': null
  }
};
