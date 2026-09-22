# Dusty Email Hub

A mobile-first dashboard that plans, generates, reviews, and ships the monthly email program for Dusty Joplin (Make Your Mark Legacy Team, Coldwell Banker Trusted Advisors, Lubbock TX). Emails go out through GoHighLevel (GHL).

Two users:

- Trey (admin): builds and edits emails, manages data, pushes to GHL.
- Dusty (client): sees the month, previews emails on his phone, approves or requests changes, submits listings, sees campaign metrics.

Full product spec: `docs/SPEC.md`. Read it before starting any feature.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel
- Tailwind for the dashboard UI (never inside email HTML)
- Neon: free Postgres, accessed with Drizzle ORM (`lib/db`). `npm run db:push` applies the schema.
- Clerk: free auth. Wired in `proxy.ts` + `lib/auth.ts`; gated on the publishable key, so the app runs openly until keys are set. Roles (admin/client) live in `profiles.role`, resolved in `lib/auth.ts` (admins via ADMIN_EMAILS).
- File uploads (screenshots/PDFs) land on the GHL CDN; a temporary store (Vercel Blob or R2) is added when the ingestion pipeline is built.
- Anthropic Claude API: copy generation and reading screenshots/PDFs
- `sharp` for image processing
- `web-push` + PWA manifest/service worker for push notifications
- Vercel Cron for scheduled jobs

The user building this is early in learning to code. When you make changes, explain what you did and why in plain language, keep steps small, and say exactly which command to run.

## Hard rules for email HTML (never break these)

GHL and Outlook break modern HTML. Every email must follow these rules. The files in `reference-templates/` are known-good and are the source of truth for structure and styling.

1. Layout is nested `<table role="presentation">` only. No divs for layout, no flexbox, no grid.
2. All CSS inline. The only `<style>` block allowed is the mobile media query in `<head>` (classes: `.stack`, `.gap`, `.pad`, `.statcell`, `.btn`, `.tbl`).
3. Every colored cell gets both `bgcolor="#hex"` and inline `background-color` (Outlook).
4. No `letter-spacing`. No web fonts. Fonts are Georgia (headings, serif accents) and Arial (body).
5. 600px max container. Images use `width` attribute plus `width:100%; height:auto; display:block; border:0`.
6. Buttons are table cells with a padded `<a>`, and `white-space:nowrap`.
7. All images are hosted on the GHL CDN (`assets.cdn.filesafe.space`). Never reference local or third-party image URLs.
8. GHL merge tags stay literal: `{{contact.first_name}}`, `{{location.name}}`, `{{location.full_address}}`, `{{unsubscribe_link}}`. Every email has the footer with address and unsubscribe.
9. Keep total HTML under ~90KB (Gmail clips at ~102KB).
10. HTML is rendered by code, never written by the LLM. Claude produces structured JSON copy; TypeScript render functions turn it into HTML. This keeps layouts from breaking.

## Brand

- Navy `#2b2d6e` (header, buttons, CTA panel), deep navy `#1a1a2e` (page background, footer), gold `#b58c4a` (accents, eyebrows, CTA button), light panel `#f7f7f9`, hairlines `#ececf1`, big faint numerals `#dcdde9`
- Logo: `https://assets.cdn.filesafe.space/fHjFPixdwzhw2AqUfXJm/media/6a2ad9efe5084c4b7183c2d5.png`
- Headshot: `https://assets.cdn.filesafe.space/fHjFPixdwzhw2AqUfXJm/media/6a2adda9ee57e63b961096e4.jpg` (not square: set width only, `border-radius:6px`, never force a height)
- Phone `806-543-3814` (`tel:8065433814`), email `dusty@makeyourmarklbk.com`
- Style is premium editorial, not newsletter: serif italic eyebrows in gold, short gold rule under headlines, gold-bordered callout boxes, oversized faint numerals instead of boxed numbers, navy CTA panel with gold button.

Brand values live in code at `lib/brand.ts`.

## Writing rules (Dusty's voice)

- Never use em dashes. Not in emails, UI copy, or code comments. Use periods, commas, or colons.
- Plainspoken, confident, a little dry. Short declarative sentences. Talks to "you."
- Avoids contractions in email body copy ("it is", "do not").
- Honest over hype. Concedes bad news before making his point. Never "it's always a great time to buy."
- No emojis. Strip them from any listing description.
- No exclamation-point closers or "won't want to miss" filler; the CTA panel does that job.
- Each listing gets one gold callout for its single most distinctive feature.

## Data honesty rules

- Every market number carries its source, geography, and period in the email. A single zip (e.g. Altos 79424) is "southwest Lubbock," never "Lubbock."
- Sources disagree on Lubbock because of methodology (Texas A&M months of inventory vs Altos weekly absorption vs Realtor.com DOM). Never mix metrics from different sources as if they were the same metric.
- Never invent listing facts. If a description is truncated, flag it; do not fill the gap.
- Humans approve every market email before it can be pushed.

## Image rules

- All gallery photos must be 3:2. Auto center-crop anything off by more than 0.03 to 1500x1000 with `sharp` before uploading to GHL.
- Portrait photos are excluded from grids (flag them for the admin) rather than cropped.
- The hero can be any landscape ratio since it sits alone.
- The GHL CDN returns 403 to non-browser user agents. Send a browser `User-Agent` header when fetching.

## Scraping

Do not scrape flexmls pages. They are behind bot detection and it violates their terms. Listings come from the Spark API (Dusty's own listings) or from what Dusty submits (screenshot, photos, MLS text). See `docs/SPEC.md`.

@AGENTS.md
