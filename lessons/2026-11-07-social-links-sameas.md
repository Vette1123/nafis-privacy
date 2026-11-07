# 2026-11-07 · The maker's social links in the footer, profiles in sameAs

## What

Every page's footer gained a "Follow the maker" row (TikTok, X, LinkedIn), the Person JSON-LD
on every indexable page lists those profiles (`sameAs`), and the head partial carries
`twitter:creator`. `scripts/social.mjs` is the one list, tested against both footers and all six
indexable pages. Ported from masareef-privacy and rafiq-privacy the same day.

## Mistakes

- Nafis has no brand accounts. The app links none, and marketing and docs name none. The row
  carries the owner's three profiles only, and no Nafis handle was invented.
- The one-off edit script matched `\n` and stopped on `head.html`, which this checkout stores with
  CRLF. The footers and CSS it had already written were fine; the rest went in by hand.
- The first attempt ran as a subagent and was refused by the parent session's worktree guard
  before it changed anything.

## What worked

- `who: 'app'` entries feed the MobileApplication sameAs automatically, so adding a Nafis
  Instagram or Telegram later is one line in `scripts/social.mjs` plus the two footers.

## Rules

- A text edit in a script reads CRLF and LF alike (`\r?\n`) on a Windows checkout.
