# Same-origin images on the install pages

## What
Nafis pages loaded every `go-img/` picture from `vette1123.github.io`, a second connection before the
hero (LCP) image: Lighthouse mobile on `/go-ar` scored 94 with LCP 2.4 s. Rafiq already loads them from
`www.mohamedgado.com/projects/<app>/go-img/` (same origin as the page, edge-cached). Nafis now does too:
header and footer partials, `build-go.mjs` (and its preconnect), `components.mjs` `IMG`.

## Mistakes
- The site check only followed `href=`, so it never looked at an `<img src>`; a wrong image host could not fail it.
- First cut of the new rule went red on every page for the right reason, then the asset resolver
  reported the new www `go-img` URLs as missing, because it only mapped github.io URLs to files.
- A python heredoc in the shell hung for 2 minutes; edit files with the edit tool.

## What worked
- Mirroring the sibling's working path (Rafiq, commit 022fda0) instead of inventing one.
- Writing the rule in `scripts/check-site.mjs` first and seeing 28 pages fail.

## Rules
- Pictures load from `www.mohamedgado.com/projects/nafis/go-img/`; `check-site.mjs` fails on a `src` pointing at github.io `go-img`.
- `pnpm build` then `pnpm check` before pushing.
