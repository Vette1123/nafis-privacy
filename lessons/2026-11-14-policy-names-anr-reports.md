# The policy names ANR reports

## What

Section 7 of the privacy policy listed "error and crash reports". The app also sends freeze (ANR) reports and the reason Android logged for the app's last exit, through `@vette1123/crash-kit`. Both languages now say so, along with the fact that the rest of that system record is dropped on the device. The policy is dated 14 November 2026. `scripts/policy-anr.test.mjs` fails if either line goes missing.

## Mistakes

- The policy went stale and no check caught it. The crash-kit port added a new kind of report, and nobody went back to the policy afterwards. It came up only because an "update everything" pass read section 7 line by line against the code.

## What worked

- Checking each claim against the source (`exitTraces.ts` keeps frames and drops threads, registers and paths) before writing it. "Dropped on the device" is what the parser does, so the policy can say it.

## Rules

- Any change to what the app sends to PostHog includes a matching edit to section 7 in both languages, done in the same unit of work.
