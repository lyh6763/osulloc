// 제목 명조·본문 고딕 서브셋 재생성
// assets/fonts/<이름>.txt 의 글자만 담은 가변 폰트를 Google Fonts text= API로 받아 같은 이름의 woff2로 저장한다.
// (Noto Serif KR·Noto Sans KR: SIL OFL 1.1 — 서브셋 자체 호스팅 허용)
//
// 화면에 새 글자를 쓰면 스모크 테스트가 실패한다 → 해당 txt에 글자 추가 → `npm run fonts` → 결과 커밋
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const subsets = [
  { name: 'noto-serif-kr-subset', family: 'Noto+Serif+KR:wght@600..700' }, // 제목
  { name: 'noto-sans-kr-subset', family: 'Noto+Sans+KR:wght@400..700' }    // 본문
];

for (const { name, family } of subsets) {
  const listPath = path.join(root, `assets/fonts/${name}.txt`);
  const outPath = path.join(root, `assets/fonts/${name}.woff2`);

  const text = [...new Set([...(await fs.readFile(listPath, 'utf8')).replace(/\s/g, '')])].join('');
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&display=swap&text=` + encodeURIComponent(text);
  // woff2 응답을 받으려면 최신 브라우저 UA가 필요하다
  const css = await (await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0 Safari/537.36' }
  })).text();

  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\) format\('woff2'\)/g)].map((m) => m[1]))];
  if (urls.length !== 1) throw new Error(`${name}: 가변 폰트 파일 1개를 기대했지만 ${urls.length}개: ${css.slice(0, 300)}`);

  const font = Buffer.from(await (await fetch(urls[0])).arrayBuffer());
  await fs.writeFile(outPath, font);
  console.log(`${[...text].length}자 → ${path.relative(root, outPath)} (${(font.length / 1024).toFixed(1)}KB)`);
}
