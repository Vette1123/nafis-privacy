# Terms of Service page for the Play trader declaration

## What
Added `terms.html` (Arabic + English, same `nafis.css`/`nafis.js` shell as the other pages) so
the Play Console app-level trader declaration has a Terms of Service URL. Nafis sells Pro, so
it is declared a trader app.

## Mistakes
- First answer to the owner was "leave the ToS field blank" because no terms page existed.
  The field is optional, but a paid app with no terms of its own is a gap: the paywall points
  at Google's and Apple's store terms, which govern the sale, not the use of Nafis.

## What worked
- Started from masareef-privacy's `terms.html` for structure, rewrote every clause for what
  Nafis actually does (public price sources, alerts, zakat calculator, Pro-only account).
- Reused this repo's shell and the privacy page's pre-paint language script, no new CSS.

## Rules
- Every app that sells anything gets its own `terms.html` on its privacy site before the
  Play trader declaration asks for one.
