// Where a reader can follow the person who makes Nafis. Nafis has no brand accounts of its own
// yet (2026-11-07), so these are Mohamed Gado's profiles, the same ones masareef and rafiq link.
// The footer icons and every page's Person `sameAs` are checked against this list
// (scripts/partials.test.mjs). When Nafis gets its own Instagram, Facebook or Telegram, add it
// here with who: 'app' and the MobileApplication sameAs picks it up.
export const SOCIAL = [
  { key: 'tiktok', who: 'owner', url: 'https://www.tiktok.com/@vetteop' },
  { key: 'x', who: 'owner', url: 'https://x.com/Sadge1996' },
  { key: 'linkedin', who: 'owner', url: 'https://www.linkedin.com/in/mgado' },
];

const STORES = ['https://apps.apple.com/app/id6807595780', 'https://play.google.com/store/apps/details?id=com.mohamedgado.nafis'];
export const APP_SAME_AS = [...STORES, ...SOCIAL.filter((s) => s.who === 'app').map((s) => s.url)];
export const PERSON_SAME_AS = SOCIAL.filter((s) => s.who === 'owner').map((s) => s.url);
