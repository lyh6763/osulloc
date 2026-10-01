// Lighthouse 측정 — METRICS.md 수치를 재현하기 위한 스크립트
//
//   npm run lighthouse            라이브(GitHub Pages) 측정 → reports/lighthouse-live
//   npm run lighthouse:local      작업 트리를 임시 정적 서버로 측정 → reports/lighthouse
//   옵션: --runs 3 (기본) · --pages index,story,products · --url <base URL>
//
// 모바일 시뮬레이션 기본 프리셋으로 페이지당 N회 측정하고, LCP 중앙값 실행의 HTML·JSON 보고서를 저장한다.
// 결과 표는 METRICS.md에 그대로 붙여 넣을 수 있는 마크다운으로 출력한다.
// Chrome은 CHROME_PATH가 없으면 Playwright Chromium(`npx playwright install chromium`)을 사용한다.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { values: args } = parseArgs({
  options: {
    local: { type: 'boolean', default: false },
    runs: { type: 'string', default: '3' },
    pages: { type: 'string', default: 'index,story,products' },
    url: { type: 'string', default: 'https://lyh6763.github.io/osulloc/' }
  }
});
const runs = Number(args.runs);
const pageNames = args.pages.split(',');
const routes = { index: '', story: 'story.html', products: 'products.html' };
const outDir = path.join(root, 'reports', args.local ? 'lighthouse' : 'lighthouse-live');

// --local: 작업 트리를 그대로 서빙 (GitHub Pages와 같은 MIME)
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2'
};
async function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = path.resolve(root, pathname === '/' ? 'index.html' : pathname.slice(1));
      if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
      const body = await fs.readFile(file);
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return server;
}

const server = args.local ? await startServer() : null;
const base = server ? `http://127.0.0.1:${server.address().port}/` : args.url;
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH || chromium.executablePath(),
  chromeFlags: ['--headless=new']
});

const summarize = (lhr) => {
  const audit = (id) => lhr.audits[id].numericValue;
  const score = (id) => Math.round(lhr.categories[id].score * 100);
  return {
    perf: score('performance'), a11y: score('accessibility'), bp: score('best-practices'), seo: score('seo'),
    fcp: audit('first-contentful-paint') / 1000, lcp: audit('largest-contentful-paint') / 1000,
    cls: audit('cumulative-layout-shift'), tbt: audit('total-blocking-time'), warnings: lhr.runWarnings.length
  };
};

const rows = [];
try {
  console.log(`대상 ${base} · ${runs}회 · ${(await (await fetch(`http://127.0.0.1:${chrome.port}/json/version`)).json()).Browser}`);
  await fs.mkdir(outDir, { recursive: true });

  for (const name of pageNames) {
    if (!(name in routes)) throw new Error(`알 수 없는 페이지: ${name} (index, story, products)`);
    const results = [];
    for (let i = 1; i <= runs; i++) {
      const { lhr, report } = await lighthouse(base + routes[name], { port: chrome.port, output: ['html', 'json'], logLevel: 'error' });
      const summary = summarize(lhr);
      console.log(`  ${name} ${i}/${runs}  Perf ${summary.perf} · LCP ${summary.lcp.toFixed(2)}s · CLS ${summary.cls.toFixed(3)}${summary.warnings ? ` · 경고 ${summary.warnings}` : ''}`);
      results.push({ summary, report });
    }
    results.sort((a, b) => a.summary.lcp - b.summary.lcp);
    const median = results[Math.floor(results.length / 2)];
    await fs.writeFile(path.join(outDir, `${name}.report.html`), median.report[0]);
    await fs.writeFile(path.join(outDir, `${name}.report.json`), median.report[1]);
    rows.push({ name, ...median.summary });
  }
} finally {
  // Windows에서 chrome-launcher가 임시 프로필 삭제에 실패(EPERM)해도 측정 결과에는 영향 없음
  try { await chrome.kill(); } catch {}
  server?.close();
}

console.log(`\n보고서: ${path.relative(root, outDir)} (LCP 중앙값 실행)\n`);
console.log('| 페이지 | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const r of rows) {
  console.log(`| ${r.name} | **${r.perf}** | **${r.a11y}** | **${r.bp}** | **${r.seo}** | ${r.fcp.toFixed(1)}s | ${r.lcp.toFixed(2)}s | ${+r.cls.toFixed(3)} | ${Math.round(r.tbt)}ms |`);
}
