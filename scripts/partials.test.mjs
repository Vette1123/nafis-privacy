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
const lang = fs.readFileSync(new URL('../partials/lang.css', import.meta.url), 'utf8');
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
  assert.match(theme, /\.head::before \{[^}]*mask-image: linear-gradient\(transparent, #000 160px, #000 55%, transparent 92%\)/);
  assert.doesNotMatch(theme.match(/\.head::before \{[^}]*\}/)[0], /var\(--fog\)/);
  // Nafis is Arabic first: with no script the Arabic document shows (the rules hide English unless lang="en").
  assert.match(lang, /html:not\(\[lang="en"\]\) #doc-en/);
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
  assert.match(theme.match(/\.switch button \{[^}]*\}/)[0], /min-height: 44px/);
  assert.match(theme, /\.brand \{[^}]*min-height: 44px/);
  // Contents links: 26px of line + 2 x 9px = 44.
  assert.match(doc, /\.toc a \{[^}]*padding-block: 9px/);
  const touch = theme.match(/@media \(max-width: 720px\), \(pointer: coarse\) \{(.*)\}\r?\n/)?.[1] ?? '';
  for (const sel of ['.topnav a', '.sitefoot li a', '.foot a']) {
    assert.match(touch, new RegExp(`${sel.replace('.', '\.')} \{[^}]*min-height: 44px`), `${sel} stays under 44px on touch`);
  }
});

test('audit: language pills, brand and prose links answer hover and press', () => {
  assert.match(theme, /#btn-ar:hover, html\[lang="ar"\] #btn-en:hover \{ color: var\(--ink\)/);
  assert.match(theme, /\.switch button:active \{ transform: scale\(0\.97\)/);
  assert.match(doc, /\.prose a:hover, footer\.page a:hover \{/);
  assert.match(theme, /\.brand:active \{ transform: scale/);
  // Hover is for a mouse: touch never sticks in a hover state.
  assert.match(theme, /@media \(hover: hover\) and \(pointer: fine\) \{\n  \.theme:hover/);
  assert.match(theme, /@media \(hover: hover\) and \(pointer: fine\) \{ \.topnav a:hover/);
});

test('audit: every page sets the language before first paint, from the one shared script', () => {
  for (const f of ['index.html', 'terms.html', 'delete-account.html', 'delete-data.html', '404.html', 'go.html', 'go-ar.html']) {
    const html = fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    assert.match(head, /root\.classList\.add\("lang-" \+ lang\)/, `${f} flashes the wrong language: no pre-paint script in <head>`);
    assert.match(head, /<!--partial:lang-pick\.js-->/, `${f}: not the shared lang-pick.js`);
  }
});

test('audit: nafis.css is gone and nothing points at it', () => {
  assert.equal(fs.existsSync(new URL('../nafis.css', import.meta.url)), false);
  for (const f of fs.readdirSync(new URL('..', import.meta.url)).filter((n) => n.endsWith('.html'))) {
    assert.doesNotMatch(fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), /nafis\.css/, f);
  }
});

// 6 Nov: on a wide screen the policy filled the left half and left the right half empty.
// Same fix as Rafiq: from 1100px the contents ride beside the text as a sticky sidebar.
test('doc: the policy contents sit beside the text on wide screens', async () => {
  const { readFileSync } = await import('node:fs');
  const doc = readFileSync(new URL('../partials/doc.css', import.meta.url), 'utf8');
  const wide = doc.match(/@media \(min-width: 1100px\) \{([^]*?)\n\}/)?.[1] ?? '';
  assert.match(wide, /\.prose > \.toc\s*\{[^}]*position:\s*sticky/);
  assert.match(wide, /grid-template-columns:\s*minmax\(0, 72ch\)/);
});

// 6 Nov: every page drew its own header. The install page had a lone "العربية" link and its own
// stored language (go-lang), the bank pages put Arabic first and named the brand in Arabic on the
// English page, and a language picked on one page never reached the next. One header now, inlined
// from partials/header.html, with the same switches on every page.
test('site: every page carries the one shared header and nothing else', async () => {
  const { readFileSync } = await import('node:fs');
  const root = new URL('../', import.meta.url);
  const pages = ['go.html', 'go-ar.html', 'index.html', 'terms.html', 'delete-account.html', 'delete-data.html', '404.html'];
  for (const f of pages) {
    const html = readFileSync(new URL(f, root), 'utf8');
    for (const p of ['header.html', 'lang-pick.js', 'lang.js', 'switch.js']) assert.ok(html.includes(`<!--partial:${p}-->`), `${f}: no ${p}`);
    assert.equal(html.split('<header').length, 2, `${f}: a header besides the shared one`);
    assert.ok(!/go-lang'\s*,/.test(html.replace(/<!--partial:lang(-pick)?\.js-->[\s\S]*?<!--\/partial:lang(-pick)?\.js-->/g, '')), `${f}: writes its own language key`);
  }
});

// The head script: one stored language for the whole site; the install page (one URL per
// language, <html data-alt>) is swapped for its other URL instead of flipped in place.
function runPick({ served, alt, stored = {}, nav = 'en-US', hash = '' }) {
  return import('node:fs').then(async ({ readFileSync }) => {
    const vm = await import('node:vm');
    const attrs = { 'data-alt': alt ?? null };
    const root = { lang: served, dir: '', style: {}, classList: { add() {} }, getAttribute: (k) => attrs[k] ?? null };
    let replaced = null;
    const ctx = {
      document: { documentElement: root },
      location: { hash, search: '?s=ig', replace: (u) => (replaced = u) },
      navigator: { language: nav, userAgent: 'Mozilla/5.0' },
      localStorage: { getItem: (k) => stored[k] ?? null },
    };
    vm.runInNewContext(readFileSync(new URL('../partials/lang-pick.js', import.meta.url), 'utf8'), ctx);
    return { lang: root.lang, replaced };
  });
}

test('lang-pick: a language chosen on any page carries to the install page and back', async () => {
  assert.deepEqual(await runPick({ served: 'en', alt: 'go-ar', stored: { 'nafis-privacy-lang': 'ar' } }), { lang: 'en', replaced: 'go-ar?s=ig' });
  assert.deepEqual(await runPick({ served: 'ar', alt: 'go', stored: { 'nafis-privacy-lang': 'en' } }), { lang: 'ar', replaced: 'go?s=ig' });
  assert.equal((await runPick({ served: 'en', alt: 'go-ar', stored: { 'go-lang': 'ar' } })).replaced, 'go-ar?s=ig', 'the old install-page key still counts');
  assert.equal((await runPick({ served: 'en', stored: { 'go-lang': 'ar' } })).lang, 'ar', 'and reaches the two-language pages');
  assert.equal((await runPick({ served: 'en', alt: 'go-ar', nav: 'ar-EG' })).replaced, 'go-ar?s=ig', 'an Arabic browser goes to go-ar');
  assert.deepEqual(await runPick({ served: 'ar', alt: 'go', nav: 'en-US' }), { lang: 'ar', replaced: null }, 'the Arabic link stays Arabic');
  assert.deepEqual(await runPick({ served: 'en', stored: { 'nafis-privacy-lang': 'ar' } }), { lang: 'ar', replaced: null }, 'a two-language page flips in place');
  assert.equal((await runPick({ served: 'en', stored: { 'nafis-privacy-lang': 'ar' }, hash: '#en-4' })).lang, 'en', 'a section link wins');
});

// 6 Nov: on a phone the header wraps to two rows, and the hero glow and grid (which start 120-140px
// above the hero) began inside it as a hard band; the tabs' backdrop blur sat on top of it.
test('theme: hero layers fade in from their top edge, and nothing in the header is frosted', async () => {
  const { readFileSync } = await import('node:fs');
  const theme = readFileSync(new URL('../partials/theme.css', import.meta.url), 'utf8');
  assert.doesNotMatch(theme, /backdrop-filter/);
  assert.match(theme, /--rise:\s*linear-gradient\(transparent,/);
  assert.match(theme, /\.head::after, \.hero::after\s*\{[^}]*mask-image:[^;]*var\(--rise\)/);
  assert.match(theme, /\.head::before\s*\{[^}]*mask-image:\s*linear-gradient\(transparent,/);
  const go = readFileSync(new URL('../go.template.html', import.meta.url), 'utf8');
  assert.match(go, /\.hero::before\s*\{[^}]*mask-image:\s*var\(--rise\)/);
});

// 6 Nov: the header became sticky and smart: it scrolls away going down and slides back going up.
// position: sticky only holds inside a parent as tall as the page, so the header must sit directly
// in <body>; inside the legal pages' header-only .wrap it would have scrolled away like before.
test('header: every page puts it straight in <body>, sticky, with the Contents clear of it', async () => {
  const { readFileSync } = await import('node:fs');
  const root = new URL('../', import.meta.url);
  const pages = ['go.html', 'go-ar.html', 'index.html', 'terms.html', 'delete-account.html', 'delete-data.html', '404.html'];
  for (const f of pages) {
    const html = readFileSync(new URL(f, root), 'utf8');
    assert.match(html, /<body[^>]*>\s*(<a class="skip"[^>]*>[^<]*<\/a>\s*)?<!--partial:header\.html-->/, `${f}: header is not a direct child of <body>`);
  }
  const theme = readFileSync(new URL('partials/theme.css', root), 'utf8');
  assert.match(theme, /\.top \{ position: sticky; top: 0;/);
  assert.match(theme, /\.top-hidden \.top \{ transform: translateY\(-100%\); \}/);
  assert.match(theme, /\.top::before \{[^}]*background: var\(--bg\);/, 'the bar is solid: see-through let text ghost under it');
  assert.match(readFileSync(new URL('partials/doc.css', root), 'utf8'), /\.prose > \.toc \{[^}]*position: sticky; top: calc\(24px \+ var\(--top-on\)\)/);
});

// The scroll logic, run against a fake window: direction with an 8px dead zone, never hidden
// near the top or while it holds focus, and kept away for a moment after an in-page jump.
test('header.js: hides going down, returns going up, ignores jitter and keeps focus visible', async () => {
  const { readFileSync } = await import('node:fs');
  const vm = await import('node:vm');
  const classes = new Set();
  const handlers = {};
  let focusInside = false;
  let now = 0;
  const top = { offsetHeight: 80, contains: () => focusInside, addEventListener: (t, f) => (handlers['top:' + t] = f) };
  const ctx = {
    scrollY: 0,
    document: {
      documentElement: { classList: { toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)), contains: (c) => classes.has(c), remove: (c) => classes.delete(c) }, style: { setProperty() {} } },
      querySelector: () => top,
      addEventListener: (t, f) => (handlers['doc:' + t] = f),
      activeElement: null,
    },
    addEventListener: (t, f) => (handlers[t] = f),
    requestAnimationFrame: (f) => f(),
    performance: { now: () => now },
    window: {},
  };
  vm.runInNewContext(readFileSync(new URL('../partials/header.js', import.meta.url), 'utf8'), ctx);
  const to = (y) => { ctx.scrollY = y; handlers.scroll(); return { stuck: classes.has('top-stuck'), hidden: classes.has('top-hidden') }; };
  assert.deepEqual(to(0), { stuck: false, hidden: false });
  assert.deepEqual(to(60), { stuck: true, hidden: false }, 'still within the header: never hidden');
  assert.deepEqual(to(600), { stuck: true, hidden: true }, 'going down');
  assert.deepEqual(to(596), { stuck: true, hidden: true }, '4px back is jitter');
  assert.deepEqual(to(560), { stuck: true, hidden: false }, 'going up');
  focusInside = true;
  assert.equal(to(900).hidden, false, 'focus inside keeps it shown');
  focusInside = false;
  handlers['doc:click']({ target: { closest: () => ({}) } });
  assert.equal(to(400).hidden, true, 'an in-page jump up keeps it away');
  now = 2000;
  assert.equal(to(300).hidden, false, 'then scrolling up brings it back');
  assert.deepEqual(to(0), { stuck: false, hidden: false });
});

// 6 Nov: visits to these pages were invisible: mohamedgado.com proxies them from github.io, so they
// never got the portfolio's <Analytics/>. The head now loads Vercel Web Analytics on that host only.
function runHead(hostname) {
  return import('node:fs').then(async ({ readFileSync }) => {
    const vm = await import('node:vm');
    const head = readFileSync(new URL('../partials/head.html', import.meta.url), 'utf8');
    const js = head.match(/<script>([\s\S]*?)<\/script>/)[1];
    const added = [];
    const win = {};
    const ctx = {
      window: win, location: { hostname },
      localStorage: { getItem: () => null },
      document: { documentElement: { setAttribute() {} }, querySelectorAll: () => [], createElement: () => ({}), head: { appendChild: (n) => added.push(n) } },
      Object,
    };
    vm.runInNewContext(js, ctx);
    return { added, win };
  });
}

test('head: Vercel Web Analytics loads on mohamedgado.com only, and ?s= becomes utm_source', async () => {
  for (const host of ['vette1123.github.io', 'localhost', 'mohamedgado.com.evil.example']) {
    const { added, win } = await runHead(host);
    assert.equal(added.length, 0, `${host} loads nothing`);
    assert.equal(win.va, undefined);
  }
  for (const host of ['www.mohamedgado.com', 'mohamedgado.com']) {
    const { added } = await runHead(host);
    assert.deepEqual(added.map((n) => n.src), ['/_vercel/insights/script.js'], `${host}: same-origin script`);
  }
  const { win } = await runHead('www.mohamedgado.com');
  const [kind, beforeSend] = win.vaq[0];
  assert.equal(kind, 'beforeSend');
  const url = (u) => beforeSend({ type: 'pageview', url: u }).url;
  assert.equal(url('https://www.mohamedgado.com/projects/nafis/go?s=IG'), 'https://www.mohamedgado.com/projects/nafis/go?s=IG&utm_source=ig');
  assert.equal(url('https://www.mohamedgado.com/projects/nafis/privacy#en-12'), 'https://www.mohamedgado.com/projects/nafis/privacy#en-12', 'no tag, untouched');
  assert.equal(url('https://www.mohamedgado.com/projects/nafis/go?s=x&utm_source=y'), 'https://www.mohamedgado.com/projects/nafis/go?s=x&utm_source=y', 'an explicit utm wins');
  // The policy says so, in both languages, and no page still claims to run none.
  const { readFileSync } = await import('node:fs');
  for (const f of ['index.html', 'terms.html', 'delete-account.html', 'delete-data.html']) {
    const html = readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /runs no analytics|no analytics, no external|ولا تشغّل أي قياس|بلا تتبّع/, `${f} still says no analytics`);
    assert.match(html, /Vercel\s+Web\s+Analytics,\s+without\s+cookies/);
    assert.match(html, /تُعدّ\s+الزيارة\s+عبر\s+Vercel\s+Web\s+Analytics\s+بلا\s+كوكيز/);
  }
});
