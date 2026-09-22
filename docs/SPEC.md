# Dusty Email Hub: Product and Technical Spec

## 1. What we are replacing

Today the program runs by hand in a chat: Trey pastes listing screenshots and photo links, Claude writes the copy and HTML, Trey pastes HTML into the GHL code editor, and Dusty never sees anything until it lands in his inbox. This app moves that whole loop into one place Dusty can check from his phone.

## 2. Users and permissions

| Action | Trey (admin) | Dusty (client) |
|---|---|---|
| See month calendar and previews | yes | yes |
| Approve / request changes / comment | yes | yes |
| Submit listings | yes | yes |
| Generate, edit copy, reorder, swap slots | yes | no |
| Upload market data | yes | no |
| Push to GHL | yes | no |
| See metrics | yes | yes |

Auth: Supabase magic link. Two roles in a `profiles.role` column.

## 3. Screens (mobile first, designed at 375px)

1. **This Month** (home): vertical list of the month's sends as cards. Each card shows date, type, subject line, status pill, hero thumbnail. Tap to open.
2. **Email detail**: live preview in a sandboxed iframe at phone width with a desktop toggle. Subject + preview text on top. Sticky bottom bar with **Approve** and **Request changes** (opens comment box). Comment thread below.
3. **Submit a listing**: MLS number field, optional screenshot upload, photo picker (camera roll, multi-select), "which email should this go in" (next listing slot by default). Shows progress as the agent processes it.
4. **Listings**: every ingested listing with status (processing, ready, needs attention) and any flags (truncated description, portrait photo, price change).
5. **Metrics**: per-email stats and simple trends.
6. **Admin only**: generate/regenerate copy, edit fields, market data uploads, GHL push, settings.

Install as a PWA. Onboarding screen for Dusty walks him through "Add to Home Screen" (required for iOS push).

## 4. Monthly cadence engine

Slots are keyed to Mondays of the month:

| Monday | Type |
|---|---|
| 1st | Listing email (dual by default, flexible count) |
| 2nd | Market Pulse |
| 3rd | Listing email |
| 4th | Education / value content |
| 5th (if any) | Flex: holiday, bonus listing, or skip |

- Holidays (July 4, Labor Day, Thanksgiving, Christmas, New Year) are overlays: they add a holiday email on or before the date and can displace a slot.
- Slots can be swapped (real example: Market Pulse moved when the data was not out yet, education email took its place). A swap is a user action with a note, not a rule change.
- Each slot generates an `emails` row in `planned` status at the start of the month (cron on the 25th of the prior month).

## 5. Email types and copy schemas

Claude returns JSON matching these shapes (validate with zod; retry once on failure). Render functions in `lib/email/render/*.ts` turn JSON into HTML by porting the structures in `reference-templates/`.

Shared fields on every type: `subject`, `previewText`, `eyebrow`, `headline`, `intro`.

- **listing** (1 to 4 listings; `reference-templates/listing-*.html`): per listing `eyebrow`, `address`, `price`, `stats[]` (value + label, 3 or 4), `paragraphs[]`, `callout`, `mlsLine`, `listingUrl?`, photos come from the database, not the LLM. Optional variants: `justListed`, `comingSoon` (navy panel, call CTA, no link), `newPrice`.
- **marketPulse** (`market-pulse.html`): `openingNote`, `stats[3]` (value, label, sublabel), `whatsMoving { headline, paragraphs[] }`, `tierTable?`, `dustysTake { quote, paragraphs[] }`, `sourceNote`.
- **education** (`education-*.html`): either numbered sections (`items[] { title, body }`) or argued sections (`sections[] { kicker, headline, paragraphs[] }`), plus `dustysTake`, optional `sideNote`.
- **holiday** (`holiday.html`): `note[]`, `list { kicker, title, items[] }`, `closing`, `pullQuote`.

Photo grid layout for a gallery of n photos (after the hero): first row of 2, then rows of 3; if the remainder is 4 use 2+2, if 2 use 2, if 1 turn the last 3 into 2 and add a 2. Example: 9 photos gives 2,3,2,2. 8 gives 2,3,3.

## 6. Listing ingestion agent

### Source priority

1. **Spark API, "Broker or Agent's Own Data" plan.** Flexmls is made by FBS; Spark is their official API. This plan issues a private key limited to listings Dusty owns, which covers his own listings. Needs a free developer registration at sparkplatform.com and MLS approval, so start that paperwork in week one. Given an MLS number it returns fields, remarks (full, not truncated), and photo URLs.
2. **Dusty's submission (fallback and for non-Spark cases):** screenshot of the flexmls listing plus photos from his camera roll. Claude vision reads the screenshot into the listing schema. This is exactly how the program has run so far and it works well.
3. **Never** scrape flexmls share links.

### Pipeline (a job per listing, status visible in UI)

1. Resolve fields (Spark or vision). Store `description_raw`.
2. Flag problems: description ends in "..." or "Show More" (truncated), status like "Active with Contingency" (ask whether to feature), price differs from a previous record (offer a "New Price" treatment).
3. Clean description with Claude: strip emojis, remove exclamation closers, convert em dashes, apply voice rules, pick the callout. Keep `description_edited` separate from raw.
4. Photos: download (browser User-Agent), read dimensions, center-crop to 3:2 at 1500x1000 with `sharp` when off by more than 0.03, exclude portrait from grids, choose hero (first landscape exterior), keep order.
5. Upload each processed photo to GHL media storage (see section 7) and save the returned CDN URL and media id.
6. Mark listing `ready`, notify.

## 7. GHL integration

Use a **Private Integration token** on Dusty's sub-account (simplest; no marketplace app). Store it encrypted in env.

| Capability | Status | Plan |
|---|---|---|
| Upload file to media storage | Confirmed in API v2 (file up to 25MB, or pass a hosted `fileUrl`) | Use for every processed photo |
| Create/update email template with raw HTML | **Verify in Phase 0** (`emails/builder` scope) | Push approved HTML as a template named `YYYY-MM-DD type` |
| Schedule a campaign via API | **Verify in Phase 0**; the campaigns scope appears read-only | Likely: app pushes template, Trey schedules in GHL UI (one screen). App tracks the scheduled date. |
| Campaign stats (delivered, opens, clicks, unsubscribes) | **Verify in Phase 0** | If no endpoint: subscribe to GHL email event webhooks and aggregate per campaign |

Use the typed SDK `@gnosticdev/highlevel-sdk` (generated from GHL's OpenAPI docs) rather than hand-rolling calls.

## 8. Market data

| Source | How | Notes |
|---|---|---|
| Freddie Mac 30-yr rate | Automated: FRED API series `MORTGAGE30US` (free key), weekly cron | Always cite "Freddie Mac weekly survey" |
| Altos Research zip reports | Admin uploads PDF(s); Claude extracts to JSON | Weekly, current. Label by zip. Their gauge label and narrative can contradict each other; report the numbers, not the label. Pull 79424, 79423, 79416, 79413, 79407 for a metro picture. |
| Texas A&M Real Estate Research Center monthly PDF | Admin uploads; Claude extracts | Lags about two months. Great for metro totals and the price cohort table. |
| National context (NAR, Altos national) | Admin pastes or uploads | Context only, never the lead |

Extracted numbers land in `market_snapshots` with `source`, `geography`, `period`, `method_notes`. The Market Pulse generator must only use numbers from snapshots, and the render includes a "Where these numbers come from" box built from those rows.

## 9. Notifications (Web Push)

- VAPID keys in env, `web-push` on the server, service worker in `public/sw.js`.
- iOS: works only after "Add to Home Screen" on iOS 16.4+. Detect and show the onboarding prompt.
- Events:
  - To Dusty: email ready for review; reminder 48h and 24h before send if not approved; listing processed or needs attention; monthly metrics recap.
  - To Trey: Dusty approved / requested changes / commented / submitted a listing; ingestion failed; market data missing 5 days before Market Pulse.

## 10. Metrics

Per email: delivered, unique opens, clicks, click rate, unsubscribes, bounces. Month view and a simple 6-month trend.

Show **click rate as the headline metric**. Apple Mail Privacy Protection auto-opens messages, so open rates are inflated and noisy. Say this in a small note on the screen.

## 11. Data model (Postgres)

```
profiles(id, email, name, role)
listings(id, mls_number, address, city, zip, price, prev_price, beds, baths, sqft, acres,
         status_text, neighborhood, listing_url, description_raw, description_edited,
         callout, source ['spark','submission'], flags jsonb, state ['processing','ready','needs_attention'],
         submitted_by, created_at)
listing_photos(id, listing_id, source_url, ghl_url, ghl_media_id, width, height,
               was_cropped, excluded_reason, is_hero, sort_order)
emails(id, month, slot ['week1','week2','week3','week4','week5','holiday'], type,
       send_date, status ['planned','drafting','in_review','changes_requested','approved','pushed','sent'],
       subject, preview_text, copy jsonb, html, ghl_template_id, ghl_campaign_id, swap_note)
email_listings(email_id, listing_id, sort_order)
comments(id, email_id, author_id, body, created_at)
market_snapshots(id, source, geography, period_start, period_end, metrics jsonb, method_notes, file_path)
email_stats(email_id, delivered, opens, clicks, unsubscribes, bounces, pulled_at)
push_subscriptions(id, profile_id, endpoint, keys jsonb)
```

## 12. Cron jobs (Vercel)

- Daily 7am CT: reminders, stats pull for anything sent in the last 14 days
- Weekly Thursday: FRED mortgage rate
- 25th of month: create next month's planned slots

## 13. Build phases

0. **API spike (do first, 1 to 2 days).** Prove with small scripts: GHL media upload, GHL template create with raw HTML, whether scheduling and stats exist in the API. Submit Spark developer registration. Adjust section 7 with what is real.
1. **Skeleton:** Next.js + Supabase auth and roles, month view, email records, render functions ported from `reference-templates/`, iframe preview. Seed with the September emails.
2. **Generation + review:** Claude copy generation per type, admin editor, approve / request changes / comments.
3. **Listings pipeline:** submission form, vision extraction, flags, photo processing, GHL upload.
4. **Ship to GHL + push notifications.**
5. **Metrics.**
6. **Spark API automation** once the key is approved.

## 14. Lessons learned from running this by hand

- Listing photos arrive in mixed aspect ratios; ragged grids were the most visible bug. Normalize to 3:2.
- Flexmls descriptions in screenshots are often truncated behind "Show More." Always flag.
- Prices change between sends (141st dropped $550K to $540K). Compare against prior records.
- "Active with Contingency" listings need a decision before being featured.
- The same property can appear in multiple months; reuse processed photos instead of re-uploading.
- Market data lags; the cadence must tolerate a swap.
- Sources contradict each other on Lubbock. Label everything.
- Date math matters: double check holiday dates against the calendar before generating.
