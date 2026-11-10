// 파비콘 PNG와 apple-touch-icon 생성
// HTML <head>의 data-URI SVG 파비콘(찻잎 한 장)과 같은 도형을 Playwright Chromium으로 그려 PNG로 저장한다.
//   assets/icons/favicon-32.png         32×32, 투명 바탕 — SVG 파비콘을 못 쓰는 브라우저용
//   assets/icons/apple-touch-icon.png   180×180, 크림 바탕 — iOS는 투명한 곳을 검게 채우므로 바탕을 깐다
//
// 도형이나 색을 바꾸면 모든 HTML의 data-URI도 함께 고친 뒤 `npm run icons`
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets/icons');

// css/tokens.css의 --green-700(잎)과 --cream-50(바탕)
const LEAF = '#1D4B3F';
const CREAM = '#F9F6F0';
const leafPath = 'M24 44C8 34 8 16 24 4c16 12 16 30 0 40Z';

const svg = ({ size, background, padding }) => {
  const inner = size - padding * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '') +
    `<svg x="${padding}" y="${padding}" width="${inner}" height="${inner}" viewBox="0 0 48 48">` +
    `<path d="${leafPath}" fill="${LEAF}"/></svg></svg>`;
};

const icons = [
  { file: 'favicon-32.png', size: 32, background: null, padding: 0 },
  // 홈 화면 아이콘은 모서리가 둥글게 잘리므로 잎 둘레에 여백을 둔다
  { file: 'apple-touch-icon.png', size: 180, background: CREAM, padding: 30 }
];

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const { file, size, background, padding } of icons) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.setContent(`<!DOCTYPE html><style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg({ size, background, padding })}`);
    const png = await page.locator('body > svg').screenshot({ omitBackground: !background });
    await fs.writeFile(path.join(outDir, file), png);
    console.log(`${path.relative(root, path.join(outDir, file))} ${size}×${size} (${(png.length / 1024).toFixed(1)}KB)`);
    await page.close();
  }
} finally {
  await browser.close();
}
