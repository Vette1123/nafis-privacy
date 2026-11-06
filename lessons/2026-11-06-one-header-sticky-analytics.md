# Nafis site: one header, one remembered language, sticky header, visit counts

## What

Ported Masareef's two site commits. `partials/header.html` is the only header (both languages,
theme button, English · العربية pill) on go, go-ar, privacy, terms, both deletion pages and the 404.
`SITE` in `scripts/partials.mjs` lists what every page must carry. `lang-pick.js` (head) and `lang.js`
replace the per-page language scripts and `nafis.js`; one key, `nafis-privacy-lang`, serves every
page, and go / go-ar swap through `<html data-alt>` (legacy `go-lang` is still read). The header is a
direct child of `<body>`, sticky, hides going down and returns going up (`header.js`). `head.html`
loads Vercel Web Analytics on mohamedgado.com only; every "no analytics" line was rewritten.

## Mistakes

- First edit script was not idempotent and died on the second page (the terms page head comment
  differs from the policy's), leaving two files half-edited. Reset those two and fixed the pattern.
- Kept `.top .brand img` and `.switch button` phone rules in `doc.css`; they beat theme.css on the
  legal pages only, so the pill was narrower there than on go. The screenshots showed it. They are gone.
- Windows `sed` on the test file ate `\s` (and a `\{`), so a regex test passed on nothing and then
  failed on the whole page. Edit regexes with the Edit tool, not `sed -i`.

## What worked

Copying Masareef's partials and tests and swapping tokens: gold for teal, Arabic first, no account
sentence in the new policy paragraph. Real-browser check at 390px with CDP device emulation: scrollWidth
390 on all six pages in both themes and the 7-step scroll test green.

## Rules

- A header that must stick sits directly in `<body>`; test it per page.
- Nothing may say "no analytics" while `head.html` can load one: grep both languages after any change.
- Page-specific CSS must not restyle a shared partial; put the rule in theme.css once.
