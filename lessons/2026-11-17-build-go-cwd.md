# build-go runs from any folder

## What
`scripts/build-go.mjs` set `const repo = '.'`, so it read `go.copy.json` and `go.template.html` from the shell's folder. From anywhere but the repo root it died with ENOENT (seen 17 Nov, run from portfolio-v1). It now resolves the repo from `import.meta.url`, like every other script here. `scripts/build-go.test.mjs` runs `--check` from `os.tmpdir()` and pins it.

## Mistakes
- Called it "not a bug, wrong folder" first. A script that only works from one cwd is a bug; every sibling script already used `import.meta.url`.
- Once the cwd was fixed, `--check` on a Windows checkout reported both go pages stale: the page on disk and the template it is built from are CRLF (core.autocrlf), and `--check` compared raw strings. `build-pages.mjs` already normalised CRLF; build-go did not. Both sides now compare through `lf()`.
- The first patch script wrote `\r\n` through a shell heredoc and `node -e`, and the escapes became real line breaks in the source: a syntax error. Write escapes with the Edit tool or build them from char codes.
- Masareef's build-go had no `--check` at all and always wrote; it now has the siblings' block, so it can be tested without writing.
- rafiq-privacy `seo-check.test.mjs` also read `scripts/...` and `partials/...` from cwd: 2 false failures from any other folder. Now paths come from `import.meta.url`.

## What worked
Running every repo's tests from portfolio-v1 (a foreign cwd) showed the whole class at once: 3 build-go scripts + 1 test file, nothing else.

## Rules
- A script never trusts cwd: `path.join(path.dirname(fileURLToPath(import.meta.url)), '..')`, tests use `new URL('../x', import.meta.url)`.
- Every `--check` compares through CRLF normalisation on Windows checkouts.
- Run a repo's tests from a folder that is not the repo before calling them done.
