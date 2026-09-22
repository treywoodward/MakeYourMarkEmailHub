// Seed data for the skeleton so the UI renders before Supabase is connected.
// Once the database is live, the home page reads from `emails` instead of this file.
// Keyed to the real Mondays of September 2026 (Sept 7, 14, 21, 28) with a Labor
// Day holiday overlay, and a spread of statuses so every status pill shows.

import type { EmailSlot, EmailStatus, EmailType } from "./types";

export interface SeedEmail {
  id: string;
  month: string; // 'YYYY-MM'
  slot: EmailSlot;
  type: EmailType;
  send_date: string; // 'YYYY-MM-DD'
  status: EmailStatus;
  subject: string;
  preview_text: string;
  // No processed listing photos yet, so the card shows a branded placeholder.
  hero_thumb_url?: string;
}

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
    subject: "Just listed on 141st",
    preview_text: "A new price and a fresh look at a southwest favorite.",
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
