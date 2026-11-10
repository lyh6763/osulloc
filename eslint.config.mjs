// ESLint flat config — 번들러 없는 정적 사이트라 파일 위치로 실행 환경을 나눈다.
//   js/       브라우저가 <script defer>로 읽는 일반 스크립트(모듈 아님)
//   scripts/  Node에서 돌리는 ES 모듈(폰트 서브셋·Lighthouse·자산 해시)
//   tests/    Node에서 돌리는 CommonJS 테스트 — page.evaluate()에 넘긴 함수는 브라우저에서 돌므로
//             document·NodeFilter 같은 브라우저 전역도 함께 연다
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'reports/', 'test-results/', 'playwright-report/'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: globals.browser
    }
  },
  {
    files: ['scripts/**/*.mjs', '*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    }
  },
  {
    files: ['tests/**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.browser }
    }
  }
];
