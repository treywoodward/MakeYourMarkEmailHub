// Seed data for the skeleton so the UI renders before Supabase is connected.
// Once the database is live, the home page reads from `emails` instead of this file.
// Keyed to the real Mondays of September 2026 (Sept 7, 14, 21, 28) with a Labor
// Day holiday overlay, and a spread of statuses so every status pill shows.
//
// Some emails also carry real `copy` (validated by lib/email/schemas) and `photos`
// so the detail page can render a true email preview. Photo URLs are the actual
// GHL CDN images from the reference templates.

import type { EmailSlot, EmailStatus, EmailType } from "./types";
import type { EmailCopy } from "./email/schemas";

export interface SeedEmail {
  id: string;
  month: string; // 'YYYY-MM'
  slot: EmailSlot;
  type: EmailType;
  send_date: string; // 'YYYY-MM-DD'
  status: EmailStatus;
  subject: string;
  preview_text: string;
  hero_thumb_url?: string;
  // When present, the detail page renders a live email preview from these.
  copy?: EmailCopy;
  photos?: string[][]; // photos[i] = ordered CDN URLs for listing i (hero first)
}

const CDN = "https://assets.cdn.filesafe.space/fHjFPixdwzhw2AqUfXJm/media/";

// --- 3712 141st Street (single listing), from dusty_listing_3712_141st.html ---
const listing3712Copy: EmailCopy = {
  type: "listing",
  subject: "Just Listed in Eastwick at Kelsey Park",
  previewText: "Like new and impeccably maintained, right on the park.",
  eyebrow: "Just Listed",
  headline: "3712 141st Street",
  intro:
    "Like new and impeccably maintained, this home in Eastwick at Kelsey Park brings together style, function and location.",
  listings: [
    {
      eyebrow: "Just Listed  •  Eastwick at Kelsey Park",
      address: "3712 141st Street",
      cityLine: "Lubbock, TX 79423",
      price: "$550,000",
      stats: [
        { value: "4", label: "Beds" },
        { value: "3", label: "Baths" },
        { value: "2,705", label: "Sq Ft" },
      ],
      paragraphs: [
        "Like new and impeccably maintained, this four bedroom, three bath home in Eastwick at Kelsey Park brings together style, function and location. The floor plan is filled with natural light and includes a versatile flex space that works well as a home office or a playroom. Outside, beat-the-heat shades keep the covered patio comfortable through a West Texas afternoon. Exceptionally clean and move-in ready.",
      ],
      callout:
        "Kelsey Park is right through your back gate. Not down the street, not a drive away. Through the gate.",
      mlsLine: "MLS #202611456  •  Active",
    },
  ],
};

const listing3712Photos: string[][] = [
  [
    `${CDN}6a8c5d8dad59e6cfed386b61.jpg`, // hero
    `${CDN}6a8c5d8dbbd5ecc97f838d30.jpg`,
    `${CDN}6a8c5d8d67ecc8731d5ace4f.jpg`,
    `${CDN}6a8c5d8dbbd5ecc97f838d35.jpg`,
    `${CDN}6a8c5d8dcdd4b797a340fd39.jpg`,
    `${CDN}6a8c5d8d4570702876806be8.jpg`,
    `${CDN}6a8c5d8d67f8d8c86b7dabc3.jpg`,
    `${CDN}6a8c5d8d67bb7ac35134b337.jpg`,
    `${CDN}6a8c5d8d4570702876806c04.jpg`,
  ],
];

export const seedMonth = "2026-09";

export const seedEmails: SeedEmail[] = [
  {
    id: "seed-holiday-laborday",
    month: "2026-09",
    slot: "holiday",
    type: "holiday",
    send_date: "2026-09-05",
    status: "sent",
    subject: "A quiet thank-you this Labor Day",
    preview_text: "The people who built Lubbock did it one honest day at a time.",
  },
  {
    id: "seed-week1-listing",
    month: "2026-09",
    slot: "week1",
    type: "listing",
    send_date: "2026-09-07",
    status: "sent",
    subject: "Two new listings in southwest Lubbock",
    preview_text: "A pair worth a look before the fall market tightens.",
  },
  {
    id: "seed-week2-marketpulse",
    month: "2026-09",
    slot: "week2",
    type: "marketPulse",
    send_date: "2026-09-14",
    status: "sent",
    subject: "Where Lubbock stands going into fall",
    preview_text: "Rates eased, inventory held. Here is what the numbers actually say.",
  },
  {
    id: "seed-week3-listing",
    month: "2026-09",
    slot: "week3",
    type: "listing",
    send_date: "2026-09-21",
    status: "changes_requested",
    subject: "Just Listed in Eastwick at Kelsey Park",
    preview_text: "Like new and impeccably maintained, right on the park.",
    copy: listing3712Copy,
    photos: listing3712Photos,
  },
  {
    id: "seed-week4-education",
    month: "2026-09",
    slot: "week4",
    type: "education",
    send_date: "2026-09-28",
    status: "in_review",
    subject: "What a home inspection will and will not tell you",
    preview_text: "Before you waive it, understand what you are giving up.",
  },
];
