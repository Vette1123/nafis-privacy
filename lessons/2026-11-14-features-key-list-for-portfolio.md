# Feature slugs written for the portfolio

## What

`build-features.mjs` also writes `content/nafis-feature-pages.json` in the portfolio
checkout (`../../Next/portfolio-v1`), and `--check` fails if it is stale. The portfolio's
sitemap, llms.txt, IndexNow and its rewrites read that list. Skipped with a message where
there is no portfolio checkout (CI).

## Mistakes

- The feature pages shipped with www canonicals while www had no route for them: 22 pages,
  every one a 404 at its canonical (portfolio lesson 2026-11-14-nafis-feature-pages-404).
  `check-site.mjs` reads the files here and never fetches www, so it passed.
- The first draft used `path.join(repo, file)` for the output path; with an absolute
  portfolio path on Windows that builds `C:\...\C:\...`. `path.resolve` takes the
  absolute path as-is.

## What worked

- Copying Rafiq's `site:pages` shape (portfolio file in the same output map, held to
  `--check`) instead of inventing a second step.

## Rules

- A page whose canonical is on www isn't live until www returns 200 for it; check with curl
  after the portfolio deploys.
