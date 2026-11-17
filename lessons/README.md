# Lessons

| Date | Lesson | The one thing |
|---|---|---|
| 2026-11-04 | [Terms page for the trader declaration](2026-11-04-terms-page.md) | A paid app gets its own terms page; store terms govern the sale, not the app. |
| 2026-11-06 | [Install pages /go and /go-ar](2026-11-06-go-seo-pages.md) | Generated from template + copy json; verify mobile in a 390px iframe. |
| 2026-11-06 | [Site partials, nav and footer ported](2026-11-06-site-partials-port.md) | One shared look from partials; the glance card is not the tile grid, and Nafis is Arabic first. |
| 2026-11-06 | [One header, sticky, visit counts](2026-11-06-one-header-sticky-analytics.md) | One header and one stored language for every page; the policy says visits are counted on mohamedgado.com. |
| 2026-11-07 | [Subdomain pageviews](2026-11-07-subdomain-pageviews.md) | nafis.mohamedgado.com is served in place now; analytics logs its pageviews under the canonical www URL, ?s= still tagged. |
| 2026-11-10 | [Policy breadcrumb](2026-11-10-policy-breadcrumb.md) | The JSON-LD trail is in Arabic, the first visible trail, pinned by a test on the real page. |
| 2026-11-14 | [Contact email moved to Gmail](2026-11-14-contact-email-gmail.md) | Exclude paths with `:(exclude)`, never `:!_`; generators and their output change together |

| 2026-11-14 | [Site parity and SEO gate](2026-11-14-site-parity-and-seo.md) | Bilingual features pages from data and components; a gate is trusted only after it fails once. |
| 2026-11-14 | [New icon, og key in four places](2026-11-14-new-icon-og-key.md) | Bumping `OG` missed three other copies of the og.jpg key; a test now pins every page to `OG`. |
| 2026-11-14 | [The policy names ANR reports](2026-11-14-policy-names-anr-reports.md) | A new kind of report sent to PostHog means a policy edit in both languages, same unit of work. |
| 2026-11-14 | [Feature slugs for the portfolio](2026-11-14-features-key-list-for-portfolio.md) | The pages named www as canonical while www 404ed; the generator now writes the portfolio key list and checks it. |
| 2026-11-16 | [Same-origin images](2026-11-16-same-origin-images.md) | Load go-img from the www host so the LCP image needs no second connection; the check now reads img src too |
| 2026-11-17 | [Relative page images](2026-11-17-relative-page-images.md) | Feature pages load go-img from the host that served them, so github.io crawls stop billing Vercel. |
| 2026-11-17 | [build-go runs from any folder](2026-11-17-build-go-cwd.md) | Scripts resolve the repo from import.meta.url, never cwd; --check compares through CRLF normalisation. |
| 2026-11-17 | [Telegram channel](2026-11-17-telegram-channel.md) | A new app profile goes in social.mjs; pnpm check names every page that still lacks it. |
