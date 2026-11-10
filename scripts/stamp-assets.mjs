// HTML이 참조하는 로컬 CSS·JS 내용의 SHA-256 앞 8자를 ?v=에 기록한다.
// node scripts/stamp-assets.mjs / node scripts/stamp-assets.mjs --check
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_PATH = '/osulloc/';
const referencePattern = /(<(?:link|script)\b[^>]*?\b(?:href|src)=["'])([^"']+)(["'])/gi;

function htmlFiles(root) {
  const files = readdirSync(root).filter((name) => name.endsWith('.html')).map((name) => join(root, name));
  const products = join(root, 'products');
  if (existsSync(products)) {
    files.push(...readdirSync(products).filter((name) => name.endsWith('.html')).map((name) => join(products, name)));
  }
  return files;
}

function versionedReference(root, file, reference) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return reference;
  const [withoutFragment, fragment] = reference.split('#');
  const [pathname, query = ''] = withoutFragment.split('?');
  if (!['.css', '.js'].includes(extname(pathname))) return reference;
  const asset = pathname.startsWith(SITE_PATH)
    ? resolve(root, pathname.slice(SITE_PATH.length))
    : resolve(dirname(file), decodeURIComponent(pathname));
  const rel = relative(root, asset);
  if (rel.startsWith('..') || rel.startsWith('/')) throw new Error(`사이트 밖 자산: ${reference}`);
  const hash = createHash('sha256').update(readFileSync(asset)).digest('hex').slice(0, 8);
  const params = new URLSearchParams(query);
  params.set('v', hash);
  return `${pathname}?${params}${fragment === undefined ? '' : `#${fragment}`}`;
}

function stampedHtml(root, file, source) {
  return source.replace(referencePattern, (_match, before, reference, after) =>
    `${before}${versionedReference(root, file, reference)}${after}`);
}

export function findAssetVersionProblems(root) {
  return htmlFiles(root).flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    return source === stampedHtml(root, file, source)
      ? []
      : [`${relative(root, file)}: CSS·JS의 ?v=가 현재 파일 내용과 다릅니다. npm run assets:stamp를 실행하세요.`];
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  if (process.argv.includes('--check')) {
    const problems = findAssetVersionProblems(root);
    if (problems.length) {
      console.error(problems.join('\n'));
      process.exitCode = 1;
    } else console.log('CSS·JS 내용 해시가 일치합니다.');
  } else {
    let changed = 0;
    for (const file of htmlFiles(root)) {
      const source = readFileSync(file, 'utf8');
      const next = stampedHtml(root, file, source);
      if (source !== next) {
        writeFileSync(file, next);
        changed += 1;
      }
    }
    console.log(`${changed}개 HTML의 CSS·JS 내용 해시를 갱신했습니다.`);
  }
}
