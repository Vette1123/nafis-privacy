# Feature pages load images from the host that served them

## What

Nafis feature pages (`features/`, `features/en/`) are served on www.mohamedgado.com (proxied,
canonical) and on the github.io copy that crawlers read. Their `<img src>`/`srcset` pointed at
absolute `https://www.mohamedgado.com/projects/nafis/go-img/`, so every crawl of a github.io
copy was a billed Vercel CDN request. On 17 Nov the Masareef copies cost 47K of portfolio-v1's
75K requests in 12 hours (Hobby pauses at 1M a month); Nafis is the same pattern, smaller.

`localImages(html, file)` in `scripts/partials.mjs` makes `src`/`srcset` relative (`../go-img/`,
`../../go-img/` under `en/`). `buildAll()` in `build-features.mjs` calls it after the partials
are stamped, the only writer of these pages (`build-pages.mjs` stamps root pages only). 20 pages
changed; the two `index.html` hubs and every root page stay absolute.

## Mistakes

None. The recipe came from the Masareef fix (masareef-privacy lesson of the same date).
`build-go.mjs --check` fails here on a missing `go.copy.json` in portfolio-v1; it is unrelated
and untouched by this change.

## What worked

- One call in `buildAll()` covers the footer badges and icons from the partials too.
- Test red first (missing export), then green.

## Rules

- HTML served from two hosts gets relative asset URLs; absolute URLs are for meta tags, JSON-LD
  and links only.
- An index page stays absolute: www serves it without the trailing slash, so `../` resolves one
  level too high.
