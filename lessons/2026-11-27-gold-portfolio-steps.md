# Gold portfolio page: How it works steps and three new FAQs

## What
- GSC marked `/features/en/gold-portfolio` "Crawled, currently not indexed" (crawled 16 Nov). Its 10
  EN siblings are indexed, and its meta, canonical and robots matched theirs. The page's own copy was
  6 bullets and 3 FAQs, about 150 words on a page that is otherwise shared template.
- Feature pages now take an optional `steps` array, rendered as a numbered "How it works" / "كيف يعمل"
  list. gold-portfolio got 4 steps and 3 new FAQs in both languages (why the value is below what you
  paid, coins/bars/crypto/cash, family vaults), plus CSV export in the move-phones answer. Every claim
  was checked against the nafis app code (presets, `break-even.tsx`, `lib/backup/csv.ts`, family vaults).
- Test: `features.test.mjs` "optional steps render…" was red with no steps data, green with it.

## Follow-up the same day
- Steps + extra FAQs on nafis-compass, gold-tools (own heading: "Is my gold real? The water test, step by step", the app's
  own 3 measuring steps from `app/authenticity.tsx`) and silver-platinum-crypto. Optional `stepsH` per page.
- **The Compass copy was wrong since launch:** it said the Compass blends "the dollar gap" and reads "buy, hold or wait".
  `lib/rates/compass.ts` has four legs: range position 35%, Fear & Greed 30%, dip from the 30-day high 20%,
  seasonality 15%, and stances buy / watch / wait. Fixed on the Compass page, the street-dollar page ("one of the
  signals behind the Compass") and www `content/projects/nafis.md`.

## Mistakes
- I first put the step styles in `partials/feature.css`. That partial is inlined into all 22 pages,
  so the commit would have re-dated every page in `lastmod.json` (git dates) and told Google 20
  untouched pages changed. I moved the styles into the steps section, so only the 2 changed pages differ.

## What worked
- Reading the app source before writing feature copy. The copy promises only what ships.

## Rules
- Feature copy that names how something is computed gets checked against the code that computes it.
- A style only some pages need ships with those pages. A shared partial edit re-dates every page.
