# Nafis install pages: SEO /go and /go-ar

## What
Replaced the bare Arabic store chooser with generated go.html and go-ar.html (title, description, hreflang, JSON-LD, FAQ, phone shots), ported from Rafiq's builder.

## Mistakes
Headless Chrome cannot render below ~500px wide, so the first 390px shots were cropped slices of a wider layout; an iframe of width 390 gives a true mobile viewport. The nafis repo has no node_modules, so the art script ran with NODE_PATH pointed at rafiq's sharp.

## What worked
Reusing Rafiq's template and builder; only palette, demo cards and copy changed. Demo card figures come from the real capture, not invented.

## Rules
Never edit go.html by hand. Copy facts come from store/listing-*.md only. Check mobile with a 390px iframe, not --window-size.
