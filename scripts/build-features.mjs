// Builds the Arabic + English feature pages from scripts/features-data.mjs, with the shared
// look filled in from partials/ (the same pass as build-pages.mjs).
//
//   features/<slug>.html        Arabic (the default, x-default)   -> /features/<slug>
//   features/en/<slug>.html     English                           -> /features/en/<slug>
//   features/index.html, features/en/index.html   the two hubs
//
//   node scripts/build-features.mjs           write the pages
//   node scripts/build-features.mjs --check   exit 1 naming pages that are stale
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPartials, css, localImages, SITE } from './partials.mjs';
import { FEATURES, UI } from './features-data.mjs';
import { BASE, cards, crumbs, cta, esc, faqHtml, featureUrl, featuresUrl, graph, shell, shot, stores } from './components.mjs';

const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const byslug = new Map(FEATURES.map((f) => [f.slug, f]));
const rel = (lang, slug) => (lang === 'ar' ? `features/${slug}.html` : `features/en/${slug}.html`);

function head(lang, ui, { trail, h1, lede, campaign, shotFile, shotAlt }) {
  return `      <div class="head${shotFile ? ' split' : ''}">
        <div>
          ${crumbs(ui, trail)}
          <h1 class="title rise">${esc(h1)}</h1>
          <p class="lede rise d1">${esc(lede)}</p>
          ${stores(lang, ui, campaign, 'hero')}
          <p class="meta">${esc(ui.ctaMeta)}</p>
        </div>${shotFile ? `\n        ${shot(shotFile, shotAlt)}` : ''}
      </div>`;
}

function featurePage(lang, f) {
  const ui = UI[lang];
  const c = f[lang];
  const url = featureUrl(lang, f.slug);
  const altLang = lang === 'ar' ? 'en' : 'ar';
  const trail = [[ui.brand, BASE], [ui.features, featuresUrl(lang)], [c.name, url]];
  const body = `${head(lang, ui, { trail: [trail[0], trail[1], [c.name]], h1: c.h1, lede: c.lede, campaign: `feature-${f.slug}`, shotFile: f.shot, shotAlt: f.shot && ui.shotAlt[f.shot] })}

      <section class="sec">
        <h2>${esc(ui.whatH)}</h2>
        <ul class="points">
${c.points.map((p) => `          <li>${esc(p)}</li>`).join('\n')}
        </ul>
      </section>

${faqHtml(ui, c.faq)}

      <section class="sec">
        <h2>${esc(ui.moreH)}</h2>
${cards([...f.related.map((s) => ({ href: featureUrl(lang, s), title: byslug.get(s)[lang].name, text: byslug.get(s)[lang].lede })), { href: featuresUrl(lang), title: ui.allFeatures, text: ui.hubLede }])}
      </section>`;
  return shell(lang, ui, {
    title: c.title, description: c.description, url, altUrl: featureUrl(altLang, f.slug), body,
    after: cta(lang, ui, `feature-${f.slug}`),
    graphNodes: graph(lang, ui, { url, title: c.title, description: c.description, trail, faq: c.faq }),
  });
}

function hubPage(lang) {
  const ui = UI[lang];
  const url = featuresUrl(lang);
  const altLang = lang === 'ar' ? 'en' : 'ar';
  const trail = [[ui.brand, BASE], [ui.features, url]];
  const body = `${head(lang, ui, { trail: [trail[0], [ui.features]], h1: ui.hubH1, lede: ui.hubLede, campaign: 'feature-index', shotFile: 'home', shotAlt: ui.shotAlt.home })}

      <section class="sec">
        <h2>${esc(ui.features)}</h2>
${cards(FEATURES.map((f) => ({ href: featureUrl(lang, f.slug), title: f[lang].name, text: f[lang].lede })))}
      </section>`;
  return shell(lang, ui, {
    title: ui.hubTitle, description: ui.hubDescription, url, altUrl: featuresUrl(altLang), body,
    after: cta(lang, ui, 'feature-index'),
    graphNodes: graph(lang, ui, { url, title: ui.hubTitle, description: ui.hubDescription, trail }),
  });
}

export function buildAll() {
  const out = new Map();
  for (const lang of ['ar', 'en']) {
    out.set(lang === 'ar' ? 'features/index.html' : 'features/en/index.html', hubPage(lang));
    for (const f of FEATURES) out.set(rel(lang, f.slug), featurePage(lang, f));
  }
  const finish = (html) => applyPartials(html, { require: SITE }).replace(/<style>([\s\S]*?)<\/style>/g, (_, s) => `<style>${css(s)}</style>`);
  // localImages: images load from whichever host served the page (partials.mjs says why).
  return new Map([...out].map(([k, v]) => [k, localImages(finish(v), k)]));
}

/** The slugs, in page order, as the portfolio's content/nafis-feature-pages.json. */
export function featureKeysJson() {
  return JSON.stringify(FEATURES.map((f) => f.slug), null, 2) + '\n';
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const stale = [];
  const files = buildAll();
  // The portfolio proxies these pages and is their canonical home; its sitemap, llms.txt,
  // IndexNow and check:prod read this slug list. Skipped where there is no checkout (CI).
  const portfolio = path.join(repo, '../../Next/portfolio-v1');
  if (fs.existsSync(path.join(portfolio, 'content'))) {
    files.set(path.join(portfolio, 'content/nafis-feature-pages.json'), featureKeysJson());
  } else console.log(`portfolio skipped: no checkout at ${portfolio}`);
  for (const [file, body] of files) {
    const p = path.resolve(repo, file);
    const old = fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') : null;
    if (old === body) continue;
    stale.push(file);
    if (!check) {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, body);
    }
  }
  if (check && stale.length) {
    console.error('stale (run node scripts/build-features.mjs): ' + stale.join(', '));
    process.exit(1);
  }
  console.log(check ? 'feature pages up to date' : stale.length ? `wrote ${stale.length} feature pages` : 'nothing to rebuild');
}
