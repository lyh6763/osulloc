const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

let browser;
let origin;
let server;

before(async () => {
  server = http.createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const relativePath = requestPath === '/' ? 'index.html' : requestPath.replace(/^\//, '');
      const filePath = path.resolve(root, relativePath);

      if (!filePath.startsWith(root + path.sep)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      const body = await fs.readFile(filePath);
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
      response.end(body);
    } catch (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: process.env.HEADED !== '1' });
});

after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

test('all pages load without browser errors', async () => {
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  for (const route of ['/', '/story.html', '/products.html']) {
    const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `${route} should return 200`);
  }

  assert.deepEqual(errors, []);
  await page.close();
});

test('product filters update cards, count and pressed state', async () => {
  const page = await browser.newPage();
  await page.goto(origin + '/products.html');

  await page.getByRole('button', { name: '녹차' }).click();
  assert.equal(await page.locator('[data-category]:visible').count(), 3);
  assert.equal(await page.getByRole('button', { name: '녹차' }).getAttribute('aria-pressed'), 'true');
  await assert.doesNotReject(() => page.getByText('녹차 — 3개 제품').waitFor());

  await page.close();
});

test('no-JS mode keeps content readable and hides inactive filters', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(origin + '/products.html');

  assert.equal(await page.locator('[data-category]:visible').count(), 12);
  assert.equal(await page.locator('.filter-bar').evaluate((element) => getComputedStyle(element).display), 'none');
  assert.notEqual(await page.locator('.site-header').evaluate((element) => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)');

  await context.close();
});

test('timeline supports card-sized keyboard navigation', async () => {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  await page.goto(origin + '/story.html');

  const timeline = page.locator('.timeline');
  await timeline.focus();
  await timeline.press('End');
  assert.ok(await timeline.evaluate((element) => element.scrollLeft > 0));
  await timeline.press('Home');
  assert.ok(await timeline.evaluate((element) => element.scrollLeft <= 1));

  await page.close();
});

test('keyboard focus reaches skip link, navigation and filters in order', async () => {
  const page = await browser.newPage();
  await page.goto(origin + '/products.html');

  const focusOrder = [];
  for (let index = 0; index < 6; index += 1) {
    await page.keyboard.press('Tab');
    focusOrder.push(await page.evaluate(() => document.activeElement.textContent.trim()));
  }

  assert.deepEqual(focusOrder, [
    '본문 바로가기',
    'OSULLOC',
    '브랜드 스토리',
    '티 컬렉션',
    '티뮤지엄',
    '전체'
  ]);

  await page.close();
});

// axe는 이미지 위 텍스트 대비를 판정하지 못한다(incomplete). 글자를 투명하게 만든 뒤
// 텍스트 박스 아래 실제 배경 픽셀을 캡처해, 가장 밝은 배경 픽셀 기준 최소 대비를 계산한다.
async function minContrastOverBackground(page, selector) {
  const target = page.locator(selector);
  const color = await target.evaluate((element) => getComputedStyle(element).color);
  const style = await page.addStyleTag({ content: `${selector} { color: transparent !important; }` });
  const png = await target.screenshot({ animations: 'disabled' });
  await style.evaluate((element) => element.remove());

  return page.evaluate(async ({ base64, color }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    const channel = (value) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (r, g, b) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const [r, g, b] = color.match(/\d+/g).map(Number);
    const fg = luminance(r, g, b);

    let min = Infinity;
    for (let i = 0; i < pixels.length; i += 4) {
      const bg = luminance(pixels[i], pixels[i + 1], pixels[i + 2]);
      min = Math.min(min, (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05));
    }
    return min;
  }, { base64: png.toString('base64'), color });
}

test('hero text over the photo meets WCAG AA contrast', async (t) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto(origin + '/', { waitUntil: 'networkidle' });

    for (const selector of ['.hero .eyebrow', '.hero h1', '.hero .lead', '.hero .scroll-hint']) {
      const ratio = await minContrastOverBackground(page, selector);
      t.diagnostic(`${viewport.width}px ${selector}: ${ratio.toFixed(2)}:1`);
      assert.ok(ratio >= 4.5, `${selector} at ${viewport.width}px: ${ratio.toFixed(2)}:1 < 4.5:1`);
    }

    await page.close();
  }
});

test('Korean words are never split across lines', async () => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    const page = await browser.newPage({ viewport });

    for (const route of ['/', '/story.html', '/products.html']) {
      await page.goto(origin + route);
      const broken = await page.evaluate(() => {
        const found = [];
        for (const element of document.querySelectorAll('main :is(h1, h2, h3, p)')) {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            for (const match of node.data.matchAll(/[가-힣]+/g)) {
              const range = document.createRange();
              range.setStart(node, match.index);
              range.setEnd(node, match.index + match[0].length);
              const tops = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
              if (tops.size > 1) found.push(match[0]);
            }
          }
        }
        return found;
      });
      assert.deepEqual(broken, [], `${route} at ${viewport.width}px splits words`);
    }

    await page.close();
  }
});

test('print output shows reveal content that was never scrolled into view', async () => {
  const page = await browser.newPage();

  for (const route of ['/', '/story.html']) {
    await page.goto(origin + route);
    await page.emulateMedia({ media: 'print' });
    const hidden = await page.$$eval('.reveal', (elements) =>
      elements.filter((element) => getComputedStyle(element).opacity !== '1').length);
    assert.equal(hidden, 0, `${route} should print every .reveal element`);
    await page.emulateMedia({ media: 'screen' });
  }

  await page.close();
});

test('print layout keeps the header in flow and the whole timeline on paper', async () => {
  const page = await browser.newPage();
  await page.goto(origin + '/story.html');
  await page.emulateMedia({ media: 'print' });

  assert.equal(await page.locator('.site-header').evaluate((element) => getComputedStyle(element).position), 'static');
  const timeline = await page.locator('.timeline').evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth
  }));
  assert.ok(timeline.scrollWidth <= timeline.clientWidth, `timeline overflows: ${timeline.scrollWidth} > ${timeline.clientWidth}`);

  await page.close();
});

test('mobile pages do not create document-level horizontal overflow', async () => {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } });

  for (const route of ['/', '/story.html', '/products.html']) {
    await page.goto(origin + route);
    const sizes = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth
    }));
    assert.equal(sizes.scrollWidth, sizes.clientWidth, `${route} should fit a 360px viewport`);
  }

  await page.close();
});
