/**
 * build.js — Assembles src/ pieces into a single dist/index.html file.
 *
 * CSS files from src/css/ are sorted by filename and inlined into <style>.
 * JS  files from src/js/  are sorted by filename and inlined into <script>.
 * HTML fragments from src/html/ are injected by marker name.
 *
 * Usage:
 *   node build.js            — one-shot build
 *   node build.js --watch    — rebuild on file changes
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

// ── helpers ──────────────────────────────────────────────────────────────────

function readSorted(dir, ext) {
  if (!fs.existsSync(dir)) return '';
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .sort()
    .map(f => fs.readFileSync(path.join(dir, f), 'utf-8'))
    .join('\n');
}

function readFragment(name) {
  const file = path.join(SRC, 'html', name);
  if (!fs.existsSync(file)) return `<!-- missing fragment: ${name} -->`;
  return fs.readFileSync(file, 'utf-8');
}

// ── assemble ─────────────────────────────────────────────────────────────────

function build() {
  const css = readSorted(path.join(SRC, 'css'), '.css');
  const js  = readSorted(path.join(SRC, 'js'),  '.js');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${readFragment('head.html')}
<style>
${css}
</style>
</head>
<body>
${readFragment('body-header.html')}
${readFragment('body-main.html')}
${readFragment('body-footer.html')}
<script>
${js}
</script>
</body>
</html>`;

  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf-8');

  const sizeKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
  console.log(`[build] dist/index.html  (${sizeKB} KB)`);
}

// ── watch mode ───────────────────────────────────────────────────────────────

if (process.argv.includes('--watch')) {
  build();
  console.log('[watch] watching src/ for changes…');
  fs.watch(SRC, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    console.log(`[watch] changed: ${filename}`);
    build();
  });
} else {
  build();
}
