# reference-templates

These HTML files are the **source of truth** for every email layout. The render
functions in `lib/email/render/*.ts` port their structure and inline styles.

Drop the known-good HTML from the manual runs here, named to match the spec:

- `listing-single.html`, `listing-dual.html` (and any other listing variants)
- `market-pulse.html`
- `education-numbered.html`, `education-argued.html`
- `holiday.html`

Every file must already follow the hard email rules in `CLAUDE.md`:
nested `<table role="presentation">` layout, all CSS inline (only the mobile
media query in a `<head>` `<style>`), `bgcolor` + inline `background-color` on
colored cells, Georgia/Arial only, 600px max container, GHL merge tags left
literal, and the address + unsubscribe footer.

Do not hand-write these from scratch here. Paste the versions that already ship.
