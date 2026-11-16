// The reusable page components of the generated pages (features/ today; any generated page
// tomorrow): store badges, screenshot, breadcrumb, FAQ block, call-to-action, related cards, and
// the JSON-LD graph. Pure functions of a language and plain data, no fs, so scripts/build-features.mjs
// and the tests build every page offline. The shared look (header, footer, theme) is in partials/.
export const BASE = 'https://www.mohamedgado.com/projects/nafis';
export const PAGES = 'https://vette1123.github.io/nafis-privacy';
export const IMG = `${BASE}/go-img/`;
export const OG = `${PAGES}/og.jpg?v=3`;
export const APPLE_ID = '6807595780';
export const PKG = 'com.mohamedgado.nafis';
export const GO = { en: `${BASE}/go`, ar: `${BASE}/go-ar` };
export const PERSON = 'https://www.mohamedgado.com/#person';

export const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
// JSON inside <script>: "<" must not close it.
export const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

// Where a language's feature pages live: Arabic is the default at features/, English at features/en/.
export const featuresUrl = (lang) => (lang === 'ar' ? `${BASE}/features` : `${BASE}/features/en`);
export const featureUrl = (lang, slug) => `${featuresUrl(lang)}/${slug}`;

export function stores(lang, ui, campaign, medium = 'feature_page') {
  const referrer = encodeURIComponent(`utm_source=site&utm_medium=${medium}&utm_campaign=${campaign}`);
  const play = `https://play.google.com/store/apps/details?id=${PKG}&referrer=${referrer}`;
  const apple = `https://apps.apple.com/app/id${APPLE_ID}?ct=${encodeURIComponent(`${medium}-${campaign}`.slice(0, 40))}`;
  return `<nav class="badges" aria-label="${esc(ui.downloadAria)}">
          <a class="apple" href="${esc(apple)}"><img src="${IMG}app-store-en.svg" width="156" height="52" alt="${esc(ui.appleAlt)}" /></a>
          <a class="play" href="${esc(play)}"><img src="${IMG}${ui.playImg}" width="197" height="76" alt="${esc(ui.playAlt)}" /></a>
        </nav>`;
}

export const shot = (file, alt) =>
  `<figure class="shot"><picture><source type="image/avif" srcset="${IMG}${file}-480.avif 480w, ${IMG}${file}-720.avif 720w" sizes="280px" /><img src="${IMG}${file}-480.webp" srcset="${IMG}${file}-480.webp 480w, ${IMG}${file}-720.webp 720w" sizes="280px" width="480" height="985" alt="${esc(alt)}" decoding="async" /></picture></figure>`;

export const crumbs = (ui, items) =>
  `<nav class="crumbs" aria-label="${esc(ui.breadcrumb)}"><ol>${items.map(([label, href]) => (href ? `<li><a href="${href}">${esc(label)}</a></li>` : `<li aria-current="page">${esc(label)}</li>`)).join('')}</ol></nav>`;

export const faqHtml = (ui, faq) =>
  `<section class="faq">
        <h2>${esc(ui.faqH)}</h2>
        <div>
${faq.map(([q, a]) => `          <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}
        </div>
      </section>`;

export const cta = (lang, ui, campaign) => `
      <section class="cta">
        <img class="ic" src="${IMG}icon-192.webp" width="88" height="88" alt="" loading="lazy" decoding="async" />
        <h2>${esc(ui.ctaH)}</h2>
        ${stores(lang, ui, campaign)}
        <p class="meta">${esc(ui.ctaMeta)}</p>
      </section>`;

export const cards = (items) =>
  `<ul class="cards">${items.map(({ href, title, text }) => `<li><a href="${href}"><b>${esc(title)}</b><span>${esc(text)}</span></a></li>`).join('')}</ul>`;

// The JSON-LD graph. The app node is the install page's own (same @id), so every page points
// at one MobileApplication. FAQPage only when the page shows the same questions.
export function graph(lang, ui, { url, title, description, trail, faq = null }) {
  const app = `${GO[lang]}#app`;
  return [
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: lang, isPartOf: { '@id': 'https://www.mohamedgado.com/#website' }, breadcrumb: { '@id': `${url}#breadcrumb` }, mainEntity: { '@id': app } },
    {
      '@type': 'MobileApplication', '@id': app, name: lang === 'ar' ? 'نفيس' : 'Nafis', alternateName: lang === 'ar' ? 'Nafis' : 'نفيس',
      description: ui.appDesc, url: GO[lang], inLanguage: lang, applicationCategory: 'FinanceApplication', operatingSystem: 'Android, iOS',
      downloadUrl: [`https://apps.apple.com/app/id${APPLE_ID}`, `https://play.google.com/store/apps/details?id=${PKG}`],
      sameAs: [`https://apps.apple.com/app/id${APPLE_ID}`, `https://play.google.com/store/apps/details?id=${PKG}`],
      image: `${PAGES}/icon.png`, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@id': PERSON }, publisher: { '@id': PERSON },
    },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: trail.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) },
    ...(faq ? [{ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] : []),
  ];
}

// The whole page. `alt` is the same page in the other language: <html data-alt> swaps to it
// (partials/lang-pick.js), and hreflang names both so each answers its own searcher.
export function shell(lang, ui, { title, description, url, altUrl, body, after = '', graphNodes }) {
  const arUrl = lang === 'ar' ? url : altUrl;
  const enUrl = lang === 'en' ? url : altUrl;
  const footer = lang === 'ar' ? 'footer.ar.html' : 'footer.en.html';
  return `<!doctype html>
<html lang="${lang}" dir="${ui.dir}" data-alt="${altUrl}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <link rel="alternate" hreflang="ar" href="${esc(arUrl)}" />
    <link rel="alternate" hreflang="en" href="${esc(enUrl)}" />
    <link rel="alternate" hreflang="x-default" href="${esc(arUrl)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="apple-itunes-app" content="app-id=${APPLE_ID}" />
    <!--partial:head.html--><!--/partial:head.html-->
    <!--partial:lang-pick.js--><!--/partial:lang-pick.js-->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(ui.brand)}" />
    <meta property="og:locale" content="${ui.locale}" />
    <meta property="og:locale:alternate" content="${lang === 'ar' ? 'en_US' : 'ar_EG'}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${OG}" />
    <meta property="og:image:width" content="2400" />
    <meta property="og:image:height" content="1260" />
    <meta property="og:image:alt" content="${esc(ui.ogAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${OG}" />
    <meta name="twitter:image:alt" content="${esc(ui.ogAlt)}" />
    <link rel="icon" href="${IMG}icon-96.webp" type="image/webp" />
    <link rel="apple-touch-icon" href="${PAGES}/icon.png" />
    <!-- Generated by scripts/build-features.mjs from scripts/features-data.mjs. Edit those, not
         this file: the next run overwrites it. -->
    <!--partial:theme.css--><!--/partial:theme.css-->
    <!--partial:feature.css--><!--/partial:feature.css-->
    <script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graphNodes })}</script>
  </head>
  <body>
    <!--partial:header.html--><!--/partial:header.html-->
    <main>
      <div class="wrap">
${body}
      </div>
${after}
    </main>
    <!--partial:${footer}--><!--/partial:${footer}-->
    <!--partial:lang.js--><!--/partial:lang.js-->
    <!--partial:header.js--><!--/partial:header.js-->
    <!--partial:switch.js--><!--/partial:switch.js-->
  </body>
</html>
`;
}
