# nafis-privacy

Public privacy policy for the **Nafis** app (نفيس), served as a single static page on
GitHub Pages.

**Live page:** <https://vette1123.github.io/nafis-privacy/>
**App:** Nafis, package `com.mohamedgado.nafis`, Google Play
**Contact:** boogado@yahoo.com

---

## What Nafis is

Nafis is an offline-first, keyless price tracker for gold, silver, platinum and crypto,
plus FX rates. It adds a personal holdings vault, price and move alerts, savings goals,
a zakat calculator, a set of money tools, and a native news reader. Arabic-first with an
Egyptian tone, English supported, dark and light themes.

Two properties drive the whole policy:

1. **Keyless.** Every data source is a free public API. There are no API keys and no
   secrets in the app.
2. **Serverless.** There is no Nafis backend. The app talks to public services directly,
   so financial data cannot reach us even in principle. Holdings live in an on-device
   SQLite database; preferences live in on-device storage.

## What lives in this repo

| File          | Purpose                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| `index.html`  | The entire policy. Arabic and English in one self-contained page.           |
| `404.html`    | Redirects any wrong path to the policy, so an old link never dead-ends.     |
| `robots.txt`  | Allows indexing, points at the sitemap.                                     |
| `sitemap.xml` | One URL. Keep `lastmod` in step with the policy date.                       |
| `README.md`   | This file. Maintenance notes for the policy.                                |

Nothing else. No build step, no dependencies, no package.json, no CI.

## Why a separate repo

The policy used to live in the app repo and was published from its GitHub Pages. That
made a "pages build and deployment" workflow run on **every** push to the app repo, and
it kept failing, so every commit showed a red X. Splitting the page into this repo killed
that noise for good.

> Pages is intentionally **disabled** on the app repo. Do not re-enable it. This repo is
> the only publisher of the policy.

## How the page works

Single `index.html`, no framework, no build.

- **Bilingual in one document.** Both the Arabic (`#doc-ar`, RTL) and English
  (`#doc-en`, LTR) versions are always present in the DOM, so crawlers, reader modes and
  Play reviewers see the full policy without running JavaScript. A small inline script
  toggles which one is visible and flips `<html lang>` and `<html dir>`.
- **Language resolution order:** URL anchor (`#en-7` or `#ar-7`) → the visitor's stored
  choice in `localStorage` → browser language. Arabic wins for `ar-*` locales, English
  for everything else.
- **Deep links per section.** Every section has a stable id (`#ar-1` to `#ar-16`,
  `#en-1` to `#en-16`). Link Play Console or support replies straight at a section.
- **Zero external requests.** No web fonts, no CDN, no analytics, no cookies. A privacy
  page should not be the thing that tracks you. Keep it that way when editing.
- **Light and dark** via `prefers-color-scheme`, and reduced-motion is respected.
- Tables scroll horizontally inside their own container on narrow screens, so the page
  body never scrolls sideways on a phone.
- **Print and save-as-PDF** are styled: the header, language switch and table of contents
  drop out, colors go to plain black on white, and every link prints its URL. Play does
  not accept a PDF as the policy URL, but users and reviewers do print pages.
- `application/ld+json` describes the page as a `PrivacyPolicy` with the app and the
  developer, so search results and link previews identify it correctly.

## What the policy covers

| Section | Topic                                                                          |
| ------- | ------------------------------------------------------------------------------ |
| 1       | Who we are, scope, the keyless and serverless principle, the in-app link       |
| 2       | What stays on device: vault, goals, alerts, price history, settings, photos    |
| 3       | Every outbound host, its purpose, and exactly what is sent                     |
| 4       | Location: optional, one-shot, reverse-geocoded, never tracked in background    |
| 5       | Camera and photos: local copy only, never uploaded                             |
| 6       | Notifications: evaluated on device, local only, no push tokens                 |
| 7       | Analytics and crash reporting: what is sent, and what is never sent            |
| 8       | Backups and sharing: user-initiated, goes only where the user sends it         |
| 9       | App updates over EAS Update                                                    |
| 10      | Android permissions: the complete merged-manifest list, with what is not asked |
| 11      | Security: HTTPS, app-private storage, no secrets, unencrypted backups warning  |
| 12      | Retention and deletion                                                         |
| 13      | Rights (GDPR, UK GDPR, CCPA) and the legal basis for analytics                 |
| 14      | Children's privacy                                                             |
| 15      | Third-party policy links                                                       |
| 16      | Change policy                                                                  |
| 17      | Contact                                                                        |

### Outbound hosts disclosed (keep this in sync with the app)

Prices and market data: `api.gold-api.com`, `open.er-api.com`, `api.coingecko.com`,
`query1.finance.yahoo.com`, `egrates.com`, `banklive.net`.
Location: `api.bigdatacloud.net` (reverse geocode), `geocoding-api.open-meteo.com`
(manual city search).
News: `bing.com` RSS plus curated feeds from `skynewsarabia.com`, `arabic.rt.com`,
`youm7.com`, `dailynewsegypt.com`, and `r.jina.ai` as the reader's extraction fallback.
Platform: `eu.i.posthog.com` (analytics and error reports, EU region), `u.expo.dev` and
EAS services (updates, performance and crash metrics), `play.google.com` (store listing
and review prompt).

Google News was dropped from the app and is no longer listed.

### Permissions disclosed

Section 10 lists the **merged release manifest**, not the app's own manifest, because that
is what Play shows users. As of the 1.18.0 cleanup that is 15 permissions: location
(coarse and fine), camera, notifications, internet, network state, wifi state, vibrate,
app badge, foreground service, wake lock, receive boot completed, scheduled alarm
(`maxSdkVersion 32`), and read/write external storage (`maxSdkVersion 32`).

Four permissions were removed in that pass, all of them dragged in by libraries and never
used by the app: `RECORD_AUDIO` (expo-image-picker, blocked with
`microphonePermission: false`), `SYSTEM_ALERT_WINDOW` (Expo's template, blocked via
`android.blockedPermissions`; the debug flavor keeps its own copy so the dev overlay still
works), and `USE_BIOMETRIC` plus `USE_FINGERPRINT` (androidx.biometric behind
expo-secure-store, which was an unused dependency and is gone).

To re-derive the real list after a dependency change:

```bash
npx expo prebuild --platform android
cd android && ./gradlew :app:processReleaseMainManifest
grep -oE 'android:name="android.permission.[A-Z_]+"' \
  app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml | sort -u
```

## Maintaining it

Edit `index.html` directly, commit, push. GitHub Pages redeploys from `main` within about
a minute.

Every substantive edit must:

1. Update **both** language versions. They are separate DOM trees, so an Arabic-only fix
   silently leaves the English copy wrong.
2. Update the **date** in both `<p class="meta">` blocks (Arabic uses Arabic-Indic
   digits, English uses Latin) and the app **version** shown next to it.
3. Keep section ids stable. Old links from Play Console and support emails point at them.
4. Add no external resource. Inline everything.

### When the app changes, the policy changes

Re-check this page whenever the app:

- adds or removes a data source, a feed, or any host it calls,
- adds a permission, or changes what an existing one is used for,
- adds or changes an analytics vendor, an event property, or session replay settings,
- starts storing a new class of user data, or starts sending anything off device,
- adds an in-app analytics opt-out (section 7 currently states none exists and promises
  one; remove that promise when it ships).

The app-side sources of truth: `lib/rates/sources.ts`, `lib/news/sources.ts`,
`lib/analytics/` and `android/app/src/main/AndroidManifest.xml`.

## Google Play

Play's User Data policy sets requirements for the policy **URL and its content**, not for
how the page looks. A styled, bilingual HTML page is fine; a plain white page has no
advantage. What Play actually requires, and where this page satisfies it:

| Play requirement                                            | Where                                   |
| ----------------------------------------------------------- | --------------------------------------- |
| Active, publicly accessible, non-geofenced URL, not a PDF   | GitHub Pages, static HTML               |
| Non-editable by users                                       | Static page, no form, no CMS            |
| Clearly labeled as a privacy policy                         | Page title and `<h1>`                   |
| Developer or app named in the policy                        | Sections 1 and 17, plus the JSON-LD     |
| Privacy contact or inquiry mechanism                        | Section 17                              |
| Data accessed, collected, used and shared, and with whom    | Sections 2, 3, 7                        |
| Secure data handling procedures                             | Section 11                              |
| Retention and deletion policy                               | Section 12                              |
| A privacy link or text inside the app itself                | Settings, then Privacy Policy           |

Two things to keep true, because both break silently:

1. The Play Console privacy policy URL must be
   <https://vette1123.github.io/nafis-privacy/>.
2. The in-app link (`PRIVACY_URL` in `app/settings/index.tsx`) must point at the same
   page. It pointed at the dead app-repo Pages URL until 2026-07-25.

The Play Console **Data safety** form must match this page: approximate and precise
location (optional), photos (optional), app activity and diagnostics (analytics and crash
reports), nothing sold, nothing shared for advertising.

## License

The policy text applies to the Nafis app and is published for its users. Reuse the page
structure freely if it helps, but do not present its text as the policy of a different
app without rewriting it to describe what that app actually does.
