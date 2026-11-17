# Nafis gets its own Telegram channel

## What

- Opened https://t.me/nafis_app (name "نفيس · Nafis", the app icon, a bilingual description
  ending in `nafis.mohamedgado.com/?s=tg`). `nafisapp` was taken by an unrelated channel.
- `scripts/social.mjs` lists it first, `who: 'app'`. Both footers show it with a named icon,
  and every page's MobileApplication `sameAs` carries it: go pages and feature pages read
  `APP_SAME_AS`; the hand-written JSON-LD in index, terms, delete-account and delete-data got
  the line. partials.test.mjs went red (footer row, index sameAs) and then green, 33/33;
  `pnpm check` clean.
- The portfolio's /projects/nafis lists the channel in its sameAs too (portfolio-v1
  lib/structured-data.ts, APP_PROFILES).

## Mistakes

- `components.mjs` hardcoded the two store URLs in the feature pages' sameAs, separate from
  `APP_SAME_AS`. The social.mjs comment claimed a new 'app' profile would be "picked up"; that
  held only for the go pages. Now it reads the list. The static pages still hold their JSON-LD
  by hand, so the test is what catches them.
- Telegram Web's create-channel description is a single-line input: Shift+Enter is dropped.
  Set the description, then fix the line breaks in Edit Channel (a textarea).

## Rules

- A new app profile goes in social.mjs, then run `pnpm check`: the test names every page that
  still lacks it.
