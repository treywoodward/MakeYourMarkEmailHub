// Shared TypeScript types that mirror the database (see supabase/migrations/0001_init.sql).
// These are hand-kept for now. Once the Supabase project exists we can generate
// them with `supabase gen types typescript` and replace this file.

export type UserRole = "admin" | "client";
export type ListingSource = "spark" | "submission";
export type ListingState = "processing" | "ready" | "needs_attention";
export type EmailSlot = "week1" | "week2" | "week3" | "week4" | "week5" | "holiday";
export type EmailType = "listing" | "marketPulse" | "education" | "holiday";
export type EmailStatus =
  | "planned"
  | "drafting"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "pushed"
  | "sent";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface Listing {
  id: string;
  mls_number: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  price: number | null;
  prev_price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  acres: number | null;
  status_text: string | null;
  neighborhood: string | null;
  listing_url: string | null;
  description_raw: string | null;
  description_edited: string | null;
  callout: string | null;
  source: ListingSource;
  flags: Record<string, unknown>;
  state: ListingState;
  submitted_by: string | null;
  created_at: string;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  source_url: string | null;
  ghl_url: string | null;
  ghl_media_id: string | null;
  width: number | null;
  height: number | null;
  was_cropped: boolean;
  excluded_reason: string | null;
  is_hero: boolean;
  sort_order: number;
}

export interface EmailRecord {
  id: string;
  month: string; // 'YYYY-MM'
  slot: EmailSlot;
  type: EmailType;
  send_date: string | null; // 'YYYY-MM-DD'
  status: EmailStatus;
  subject: string | null;
  preview_text: string | null;
  copy: unknown | null;
  html: string | null;
  ghl_template_id: string | null;
  ghl_campaign_id: string | null;
  swap_note: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  email_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface MarketSnapshot {
  id: string;
  source: string;
  geography: string;
  period_start: string | null;
  period_end: string | null;
  metrics: Record<string, unknown>;
  method_notes: string | null;
  file_path: string | null;
  created_at: string;
}

export interface EmailStats {
  email_id: string;
  delivered: number | null;
  opens: number | null;
  clicks: number | null;
  unsubscribes: number | null;
  bounces: number | null;
  pulled_at: string;
}
