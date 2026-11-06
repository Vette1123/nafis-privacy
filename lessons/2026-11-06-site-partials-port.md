# Nafis site: Masareef's partials, nav and footer ported

## What

Every page (go, go-ar, privacy, terms, delete-account, delete-data, 404) shares `partials/`
(theme.css, head.html with the pre-paint theme script, switch.js, doc.css, topnav and footer in AR
and EN), filled in by `scripts/partials.mjs`. `build-go.mjs` and `build-pages.mjs` both take
`--check`. Nafis keeps its gold-on-espresso palette and serif display type. The legal pages dropped
`nafis.css` for the shared theme (`nafis.js`, the language toggle, stays); the file is now unreferenced.
Nav: Download, Privacy, Terms; Delete account and Delete data sit in the footer's Legal column.
Legal text is unchanged: the visible-text diff shows only nav and footer words added.

## Mistakes

- Ported Rafiq's tile-style "at a glance" CSS first; Nafis's glance is one card with a tick list, so the
  rules did not apply. Then a flex `li` split every `<strong>` into its own column. Ticks are now an
  absolutely positioned physical `border-left`, and the `li` stays a normal block.
- Nafis is Arabic first: the language rules must key on `.lang-en`, not `.lang-ar`, or a page with no
  script shows English. A test pins it.
- Reached for a whole-tree stash for a red/green check; the working-tree guard blocked it. Run red/green
  on a copy of the one file.
- Left a delete command in a scratch step that prompted the owner. Screenshots overwrite by name.

## What worked

Reusing the Rafiq partials, then swapping the token block. The partials test now also pins the
Masareef lessons (heading-gap rules, physical RTL ticks, the glow mask, no fog behind text heroes).

## Rules

- A heading never touches the card, list or table that follows it (`.sec > h2 + :not(p)` and the
  `.prose h2` equivalent).
- Footer at phone width: two columns, the last spans the row.
- Check pages in an iframe of the real width; headless Chrome has a minimum window width.
