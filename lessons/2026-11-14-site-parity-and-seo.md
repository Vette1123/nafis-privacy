# Site parity with Rafiq and Masareef, and an SEO gate

**What.** Nafis gets the sibling sites' mechanisms. A generated, bilingual `features/` set
(10 features, Arabic at `/features/<slug>`, English at `/features/en/<slug>`, a hub each,
22 pages), built from `scripts/features-data.mjs` plus reusable components
(`scripts/components.mjs`, `partials/feature.css`) on the shared partials. The "More apps"
footer points at each app's own domain with `?s=nafis-site` (owner rule of 5 Nov: never
`/go`). A generated `sitemap.xml`, an SEO gate (`scripts/check-site.mjs`), the Masareef
IndexNow URL mapper, a `package.json` with `build` and `check`.

**Mistakes.**
- Wrote the 700-line feature data file with a bash heredoc: `ENAMETOOLONG`. Big files go
  through the Write tool, not the shell.
- The first SEO gate reported 4 pages with "no meta description": Prettier wraps long
  attributes onto their own lines, and the regex read one line. Collapse whitespace before
  matching.
- The gate then passed on everything, which proves nothing. A negative test (rename the
  terms canonical) still passed: the link resolver returned "unknown" for a missing local
  page instead of "broken". It only turned red after the resolver treated any
  `mohamedgado.com/projects/nafis` URL it cannot map to a file as broken. Always make the
  gate fail once before trusting it.
- Assumed the siblings' IndexNow key files in the repo were what the workflow sends. They
  are leftovers from when the host was github.io: the workflow uses one shared key served by
  mohamedgado.com. Nafis already had the same workflow; the work was the URL mapper, so
  `features/index.html` maps to `/features`, not `/features/index`.
- The siblings' `sitemap.xml` is empty on purpose, because every canonical is on
  www.mohamedgado.com. A github.io sitemap listing www URLs is cross-host, so the sitemap
  that counts is the portfolio's; this one is for the owner's checks and Bing.

**What worked.** Reading the pages' claims off the store listing and `go.copy.json` only,
so every point is traceable. Fitting titles to 60 and descriptions to 110-170 in the data
test, not by eye. Keeping the page shell as one function so the two languages cannot drift.

**Rules.**
- A new page type goes in `features-data.mjs` and the components, never as a hand-written
  page; `npm run check` runs every generator in `--check` plus the SEO gate.
- Any new gate gets one deliberate failure before it is trusted.
- Never claim "no account" on a feature page: Nafis Pro has an optional account.
- The portfolio proxy must map `/projects/nafis/features/*` before the canonical URLs resolve
  on www.mohamedgado.com.
