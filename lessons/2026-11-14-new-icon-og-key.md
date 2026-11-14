# The new icon, and an og:image key written in four places

## What

Nafis has a new gold-gem icon. `pnpm site:go-art` (in the nafis repo) redrew `go-img/` and `og.jpg`, `icon.png` was cut again at 192px from the app icon, and the `og.jpg` cache key went from `v=2` to `v=3` so link previews fetch the new card.

## Mistakes

- I bumped `OG` in `scripts/components.mjs` and took it for the only copy. The key was also in `go.copy.json`, in `index.html`, and missing from the three legal pages altogether, so 12 of 56 references would have kept the old preview. `scripts/og-key.test.mjs` now fails on any page whose og:image or twitter:image differs from `OG`. It went red with `terms.html` set back to `v=2`.

## What worked

- Counting every `og.jpg…` string across the built HTML (`grep -o | uniq -c`) after the bump, instead of trusting the rebuild.

## Rules

- A cache key lives in one constant. Every other copy is pinned to it by a test.
