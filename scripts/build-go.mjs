// go.html (English) and go-ar.html (Arabic) are generated: edit go.template.html or
// go.copy.json, then run `node scripts/build-go.mjs` and commit all of it. Each language
// is its own URL so that hreflang and a search engine can tell them apart.
import fs from 'fs'
import path from 'path'
import { applyPartials, css, SITE } from './partials.mjs'
const repo = '.'
const c = JSON.parse(fs.readFileSync(path.join(repo, 'go.copy.json'), 'utf8'))
// Canonical on the domain Google crawls, which proxies these pages. The github.io URLs keep
// serving: printed QR codes open them, and they cannot be updated.
const base = `https://www.mohamedgado.com/projects/${c.slug}/`
const site = `https://vette1123.github.io/${c.slug}-privacy/`
// Pictures load from github.io on both hosts: the proxy only maps the pages.
const img = `${site}go-img/`
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
const tpl = fs.readFileSync(path.join(repo, 'go.template.html'), 'utf8')

// Which language a reader gets is partials/lang-pick.js, the same as every other page: the
// language they chose anywhere on the site, else an Arabic browser goes from go to go-ar.
// <html data-alt> names the other URL it swaps to. A crawler reads both URLs as they are.

function ld(l) {
  const t = c[l]
  // App only. Google stopped showing FAQ rich results on 7 May 2026, so the FAQ stays
  // visible HTML and no longer ships as FAQPage markup. No aggregateRating: Google only
  // accepts ratings collected and shown on this page, and store ratings are neither.
  const self = base + (l === 'ar' ? 'go-ar' : 'go')
  const app = {
    '@type': 'MobileApplication',
    '@id': self + '#app',
    name: t.ldName,
    alternateName: t.ldAlt,
    description: t.description,
    url: base + (l === 'ar' ? 'go-ar' : 'go'),
    inLanguage: l,
    applicationCategory: c.category,
    operatingSystem: 'Android, iOS',
    downloadUrl: [c.apple, c.play],
    installUrl: base + (l === 'ar' ? 'go-ar' : 'go'),
    sameAs: [c.apple, c.play],
    image: site + 'icon.png',
    screenshot: t.features.map(([f]) => `${img}${f}-720.webp`),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: t.features.map(([, , h]) => h),
    author: { '@id': 'https://www.mohamedgado.com/#person' },
    publisher: { '@id': 'https://www.mohamedgado.com/#person' },
  }
  // Breadcrumbs make the result show the site path (mohamedgado.com › Nafis) instead of a bare URL.
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      ['Mohamed Gado', 'https://www.mohamedgado.com/'],
      [t.ldName, `https://www.mohamedgado.com/projects/${c.slug}`],
      [t.nav, self],
    ].map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
  }
  crumbs['@id'] = self + '#breadcrumb'
  const person = { '@type': 'Person', '@id': 'https://www.mohamedgado.com/#person', name: 'Mohamed Gado', url: 'https://www.mohamedgado.com/' }
  const website = { '@type': 'WebSite', '@id': 'https://www.mohamedgado.com/#website', name: 'Mohamed Gado', url: 'https://www.mohamedgado.com/', publisher: { '@id': person['@id'] } }
  // The page itself: what it is about (the app), where it sits (breadcrumb, site) and its language.
  const webpage = {
    '@type': 'WebPage', '@id': self + '#webpage', url: self, name: t.title, description: t.description, inLanguage: l,
    isPartOf: { '@id': website['@id'] }, breadcrumb: { '@id': crumbs['@id'] }, mainEntity: { '@id': app['@id'] },
    primaryImageOfPage: { '@type': 'ImageObject', url: `${img}${t.features[0][0]}-720.webp`, width: 720, height: 1477 },
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [webpage, app, crumbs, website, person] }).replaceAll('<', '\\u003c')
}

function page(l) {
  const t = c[l]
  const self = base + (l === 'ar' ? 'go-ar' : 'go')
  const head = [
    `<title>${esc(t.title)}</title>`,
    `<meta name="description" content="${esc(t.description)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
    `<link rel="canonical" href="${self}" />`,
    `<link rel="alternate" hreflang="en" href="${base}go" />`,
    `<link rel="alternate" hreflang="ar" href="${base}go-ar" />`,
    `<link rel="alternate" hreflang="x-default" href="${base}go" />`,
    `<meta property="og:title" content="${esc(t.title)}" />`,
    `<meta property="og:description" content="${esc(t.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${self}" />`,
    `<meta property="og:site_name" content="${esc(t.ldName)}" />`,
    `<meta property="og:locale" content="${l === 'ar' ? 'ar_EG' : 'en_US'}" />`,
    `<meta property="og:locale:alternate" content="${l === 'ar' ? 'en_US' : 'ar_EG'}" />`,
    `<meta property="og:image" content="${site}${c.image}" />`,
    `<meta property="og:image:width" content="2400" />`,
    `<meta property="og:image:height" content="1260" />`,
    `<meta property="og:image:alt" content="${esc(t.ogAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(t.title)}" />`,
    `<meta name="twitter:description" content="${esc(t.description)}" />`,
    `<meta name="twitter:image" content="${site}${c.image}" />`,
    `<meta name="twitter:image:alt" content="${esc(t.ogAlt)}" />`,
    `<meta name="apple-itunes-app" content="app-id=${c.appleId}" />`,
    `<link rel="preconnect" href="https://vette1123.github.io" />`,
  ].join('\n    ')
  const pic = (f, sizes, alt, cls, lazy) =>
    `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${img}${f}-480.avif 480w, ${img}${f}-720.avif 720w" sizes="${sizes}" />` +
    `<img src="${img}${f}-480.webp" srcset="${img}${f}-480.webp 480w, ${img}${f}-720.webp 720w" sizes="${sizes}" width="480" height="983" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async" /></picture>`
  const badges =
    `<a class="apple" href="${c.apple}?ct=card-qr"><img src="${img}app-store-en.svg" width="156" height="52" alt="${esc(t.apple)}" /></a>` +
    `<a class="play" href="${c.play}&amp;referrer=utm_source%3Dcard%26utm_medium%3Dqr"><img src="${img}google-play-${l}.png" width="197" height="76" alt="${esc(t.play)}" /></a>`
  // The first feature (the gold price) is the hero's story, so it heads "how it works"; the rest
  // get a row each, text beside its screen.
  const [lead, ...rest] = t.features
  const feats = rest
    .map(([f, k, h, p]) => `<article class="feat"><div><div class="k">${esc(k)}</div><h2>${esc(h)}</h2><p>${esc(p)}</p></div>${pic(f, '(max-width: 860px) 72vw, 270px', `${t.ldName}: ${h}`, '', true)}</article>`)
    .join('\n        ')
  const d = t.demo
  // The hero screen is the one image above the fold: eager and high priority. The two cards are
  // text, so the animation costs no bytes and a crawler reads the price alert as words.
  const trend = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>'
  const demo =
    pic(lead[0], '300px', `${t.ldName}: ${lead[2]}`, '', false).replace('decoding="async"', 'fetchpriority="high"') +
    `<div class="card alert" aria-hidden="true"><img class="ic" src="${img}icon-96.webp" width="40" height="40" alt="" /><div><b>${esc(d.app)}</b><small>${esc(d.alert)}</small></div><time>${esc(d.when)}</time></div>` +
    `<div class="card txn" aria-hidden="true"><span class="ic">${trend}</span><div><b>${esc(d.place)}</b><small>${esc(d.meta)}</small><span class="tag">${esc(d.tag)}</span></div><span class="amt">${esc(d.time)}<span>${esc(d.ampm)}</span></span></div>`
  const vals = {
    LANG: l,
    DIR: l === 'ar' ? 'rtl' : 'ltr',
    ALT_URL: l === 'ar' ? 'go' : 'go-ar',
    HEAD: head,
    JSONLD: ld(l),
    IMG: img,
    CUE: esc(t.cue),
    KICKER: esc(t.kicker),
    H1A: esc(t.h1a),
    H1B: esc(t.h1b),
    LEDE: esc(t.lede),
    NAV_LABEL: esc(t.nav),
    BADGES: badges,
    FACTS: t.facts.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join(''),
    DEMO: demo,
    HOW_H: esc(lead[2]),
    HOW_P: esc(lead[3]),
    HOW: t.how.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join(''),
    FEATS: feats,
    MORE_H: esc(t.moreH),
    MORE_P: esc(t.moreP),
    MORE: t.more.map((m) => `<li>${esc(m)}</li>`).join(''),
    PRIV_H: esc(t.privH),
    PRIV_P: esc(t.privP),
    PRIV: t.priv.map((p) => `<li>${esc(p)}</li>`).join(''),
    FAQ_H: esc(t.faqH),
    FAQ: t.faq.map(([q, a], i) => `<details${i ? '' : ' open'}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join(''),
    CTA_H: esc(t.ctaH),
    FOOT: esc(t.foot),
    LINKS: t.links.map(([n, u]) => `<a href="${u}">${esc(n)}</a>`).join(''),
  }
  const filled = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vals)) throw Error('no value for ' + k)
    return vals[k]
  })
  // The shared look and footer (partials/), then every inline <style> minified, the theme's too.
  return applyPartials(filled, { require: [...SITE, `footer.${l}.html`] })
    .replace(/<style>([\s\S]*?)<\/style>/g, (_, c) => `<style>${css(c)}</style>`)
}

// --check: write nothing, exit 1 naming the pages that are stale.
const check = process.argv.includes('--check')
const stale = []
for (const [f, l] of [['go.html', 'en'], ['go-ar.html', 'ar']]) {
  const next = page(l)
  const p = path.join(repo, f)
  if (check ? fs.readFileSync(p, 'utf8') !== next : (fs.writeFileSync(p, next), false)) stale.push(f)
}
if (check) {
  if (stale.length) { console.error('stale (run node scripts/build-go.mjs): ' + stale.join(', ')); process.exit(1) }
  console.log('go pages up to date')
  process.exit(0)
}
for (const f of ['go.html', 'go-ar.html']) {
  const h = fs.readFileSync(path.join(repo, f), 'utf8')
  if (/noindex/.test(h)) throw Error(f + ' still noindex')
  if (/\{\{/.test(h)) throw Error(f + ' has an unfilled slot')
  console.log(f, h.length, 'bytes, title', /<title>(.*)<\/title>/.exec(h)[1])
}
