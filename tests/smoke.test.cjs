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
