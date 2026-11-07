# Subdomain pageviews under their canonical page

## What

nafis.mohamedgado.com now serves the install page in place instead of a 301 to www (portfolio-v1,
same day: the redirect cost 0.2-0.4 s per first visit). Its pageviews would have counted as that
host's `/`, mixed with the portfolio home in the shared Vercel Analytics project. The
`beforeSend` hook in `partials/head.html` now swaps the URL for the page's canonical www URL,
keeping the query and hash, so `?s=` still becomes utm_source. On www nothing changes.

## Mistakes

- The first URL regex was written through a heredoc + template literal and its `\/` escapes
  collapsed into a syntax error. Rewrote it with no slashes to escape (`search(/[?#]/)` + slice).

## What worked

- The existing `runHead` vm harness: one extra `querySelector` stub covered the new path.

## Rules

- A page served under more than one host reports analytics under its canonical URL.
