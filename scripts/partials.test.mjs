// node --test scripts/partials.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { markCurrent, applyPartials, css } from './partials.mjs';

const B = 'https://www.mohamedgado.com/projects/nafis';
const page = (canon, extra = '') => `<link rel="canonical" href="${canon}" />${extra}<nav class="topnav"><a href="${B}/go">Download</a><a href="${B}/go-ar">AR</a><a href="${B}/privacy">Privacy</a><a href="${B}/terms.html">Terms</a></nav><footer class="sitefoot"><a href="${B}/privacy">Policy</a><a href="${B}">About</a></footer>`;

test('the top nav and footer mark exactly the page they sit on', () => {
  const p = markCurrent(page(`${B}/privacy`));
  assert.match(p, /<nav[^]*\/privacy" aria-current="page">Privacy/);
  assert.match(p, /<footer[^]*\/privacy" aria-current="page">Policy/);
  assert.doesNotMatch(p, /\/go" aria-current/);
  // The footer's project link would prefix-match every page: it must never be marked.
  assert.doesNotMatch(p, /nafis" aria-current/);
});

test('the Arabic install page marks its own link, not the English one', () => {
  const p = markCurrent(page(`${B}/go-ar`));
  assert.match(p, /\/go-ar" aria-current="page">AR/);
  assert.doesNotMatch(p, /\/go" aria-current/);
});

test('a noindex page with a borrowed canonical marks nothing', () => {
  assert.doesNotMatch(markCurrent(page(`${B}/privacy`, '<meta name="robots" content="noindex" />')), /aria-current/);
});

test('a page that lost its theme marker fails loudly; markers are filled and idempotent', () => {
  assert.throws(() => applyPartials('<p>x</p>', { require: ['theme.css'] }), /theme\.css/);
  const once = applyPartials('<!--partial:theme.css--><!--/partial:theme.css-->', { require: ['theme.css'] });
  assert.match(once, /<style>[\s\S]*--gold/);
  assert.equal(applyPartials(once, { require: ['theme.css'] }), once);
});

test('css() minifies comments and whitespace', () => {
  assert.equal(css('a { color: red; } /* x */'), 'a{color: red}');
});

test('footer: at phone width the last column spans the row, so no column sits alone beside empty space', () => {
  const t = fs.readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  const phone = t.match(/@media \(max-width: 560px\) \{ \.sitefoot \{[^}]*\}[^@]*\}/)?.[0] ?? '';
  assert.match(phone, /\.sitefoot > nav:last-of-type \{ grid-column: 1 \/ -1; \}/);
});

test('a page under /terms.html marks Terms and not Privacy', () => {
  const p = markCurrent(page(`${B}/terms.html`));
  assert.match(p, /<nav[^]*\/terms\.html" aria-current="page">Terms/);
  assert.doesNotMatch(p, /\/privacy" aria-current/);
});

const doc = fs.readFileSync(new URL('../partials/doc.css', import.meta.url), 'utf8');
const theme = fs.readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');

test('lessons from Masareef live in the shared CSS', () => {
  // A heading never touches the block under it.
  assert.match(theme, /\.sec > h2 \+ :not\(p\) \{ margin-top: 28px; \}/);
  assert.match(doc, /\.prose h2 \+ :not\(p\):not\(ul\):not\(ol\) \{ margin-top: 24px; \}/);
  // RTL ticks: physical border-left, never border-inline-*.
  assert.match(theme, /\.band li::before \{[^}]*border-left: 2px solid/);
  assert.match(doc, /\.glance li::before \{[^}]*border-left: 2px solid/);
  assert.doesNotMatch(theme + doc, /\.(band|glance) li::before \{[^}]*border-inline/);
  // The glow mask: fades before its box edge. No fog layer behind a text hero.
  assert.match(theme, /\.head::before \{[^}]*mask-image: linear-gradient\(#000 55%, transparent 92%\)/);
  assert.doesNotMatch(theme.match(/\.head::before \{[^}]*\}/)[0], /var\(--fog\)/);
  // Nafis is Arabic first: the language rules key on .lang-en.
  assert.match(doc, /html:not\(\.lang-en\) #doc-en/);
});

// 6 Nov: a panel's first heading kept `.sec h3 { margin-top: 32px }` on top of the panel's
// own padding, so the bank "how it works" cards opened on a band of empty space. And a
// <button> shows the arrow by default: every clickable thing gets the pointer from one rule.
test('theme: a panel opens on its content, and every action shows the pointer', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  assert.match(theme, /\.panel > :first-child\s*\{[^}]*margin-top:\s*0/);
  const rule = theme.match(/([^{}]+)\{\s*cursor:\s*pointer;?\s*\}/)?.[1] ?? '';
  for (const sel of ['a[href]', 'button', 'summary', '[role="button"]', 'label[for]', 'select']) {
    assert.ok(rule.includes(sel), `pointer rule is missing ${sel}`);
  }
});

// 6 Nov: the current page's nav pill was a near-invisible shade of the bar. It now wears the
// brand colour, a ring and a dot, so "where am I" reads at a glance in both themes.
test('theme: the current nav item is clearly marked', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  const on = theme.match(/\.topnav a\[aria-current\]\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(on, /color:\s*var\(--gold\)/);
  assert.match(on, /inset 0 0 0 1px/);
  assert.match(theme, /\.topnav a\[aria-current\]::before\s*\{[^}]*border-radius:\s*50%/);
});

// 6 Nov UI audit. Each assertion pins one visible flaw.
test('audit: the footer divider sits on the content edges, not the padded wrap box', () => {
  // `.sitefoot.wrap` painted its border across the wrap's 20px padding, so the line ran
  // wider than the page rule above it (and edge to edge on a phone).
  assert.doesNotMatch(theme.match(/\.sitefoot \{[^}]*\}/)[0], /border-top/);
  assert.match(theme, /\.sitefoot::before \{[^}]*inset-inline: max\(20px[^}]*height: 1px/);
});

test('audit: touch targets reach 44px (language pills, nav, footer, brand)', () => {
  assert.match(doc.match(/\.switch button \{[^}]*\}/)[0], /min-height: 44px/);
  assert.match(theme, /\.brand \{[^}]*min-height: 44px/);
  // Contents links: 26px of line + 2 x 9px = 44.
  assert.match(doc, /\.toc a \{[^}]*padding-block: 9px/);
  const touch = theme.match(/@media \(max-width: 720px\), \(pointer: coarse\) \{(.*)\}\r?\n/)?.[1] ?? '';
  for (const sel of ['.topnav a', '.sitefoot li a', '.foot a']) {
    assert.match(touch, new RegExp(`${sel.replace('.', '\.')} \{[^}]*min-height: 44px`), `${sel} stays under 44px on touch`);
  }
});

test('audit: language pills, brand and prose links answer hover and press', () => {
  assert.match(doc, /\.switch button:hover \{/);
  assert.match(doc, /\.switch button:active \{ transform: scale\(0\.97\)/);
  assert.match(doc, /\.prose a:hover, footer\.page a:hover \{/);
  assert.match(theme, /\.brand:active \{ transform: scale/);
  // Hover is for a mouse: touch never sticks in a hover state.
  assert.match(doc, /@media \(hover: hover\) and \(pointer: fine\) \{ \.switch button:hover/);
});

test('audit: every page with a language switch sets the language before first paint', () => {
  for (const f of ['index.html', 'terms.html', 'delete-account.html', 'delete-data.html']) {
    const html = fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    assert.match(head, /root\.classList\.add\("lang-" \+ lang\)/, `${f} flashes the wrong language: no pre-paint script in <head>`);
  }
});

test('audit: nafis.css is gone and nothing points at it', () => {
  assert.equal(fs.existsSync(new URL('../nafis.css', import.meta.url)), false);
  for (const f of fs.readdirSync(new URL('..', import.meta.url)).filter((n) => n.endsWith('.html'))) {
    assert.doesNotMatch(fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), /nafis\.css/, f);
  }
});
