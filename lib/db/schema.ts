// Drizzle schema for Neon Postgres. Mirrors the data model in docs/SPEC.md
// section 11. Authorization is enforced in app code (Clerk), not database RLS,
// so there are no policies here. `profiles.id` holds the Clerk user id.

import {
  pgTable,
  pgEnum,
  text,
  integer,
  numeric,
  boolean,
  jsonb,
  timestamp,
  date,
  uuid,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import type { EmailCopy } from "@/lib/email/schemas";

// ---- enums ----------------------------------------------------------------
export const userRole = pgEnum("user_role", ["admin", "client"]);
export const listingSource = pgEnum("listing_source", ["spark", "submission"]);
export const listingState = pgEnum("listing_state", [
  "processing",
  "ready",
  "needs_attention",
]);
export const emailSlot = pgEnum("email_slot", [
  "week1",
  "week2",
  "week3",
  "week4",
  "week5",
  "holiday",
]);
export const emailType = pgEnum("email_type", [
  "listing",
  "marketPulse",
  "education",
  "holiday",
]);
export const emailStatus = pgEnum("email_status", [
  "planned",
  "drafting",
  "in_review",
  "changes_requested",
  "approved",
  "pushed",
  "sent",
]);

// ---- tables ---------------------------------------------------------------
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull(),
  name: text("name"),
  role: userRole("role").notNull().default("client"),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mlsNumber: text("mls_number"),
    address: text("address"),
    city: text("city"),
    zip: text("zip"),
    price: integer("price"),
    prevPrice: integer("prev_price"),
    beds: numeric("beds"),
    baths: numeric("baths"),
    sqft: integer("sqft"),
    acres: numeric("acres"),
    statusText: text("status_text"),
    neighborhood: text("neighborhood"),
    listingUrl: text("listing_url"),
    descriptionRaw: text("description_raw"),
    descriptionEdited: text("description_edited"),
    callout: text("callout"),
    source: listingSource("source").notNull(),
    flags: jsonb("flags").$type<Record<string, unknown>>().notNull().default({}),
    state: listingState("state").notNull().default("processing"),
    submittedBy: text("submitted_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("listings_state_idx").on(t.state)],
);

export const listingPhotos = pgTable(
  "listing_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    sourceUrl: text("source_url"),
    ghlUrl: text("ghl_url"),
    ghlMediaId: text("ghl_media_id"),
    width: integer("width"),
    height: integer("height"),
    wasCropped: boolean("was_cropped").notNull().default(false),
    excludedReason: text("excluded_reason"),
    isHero: boolean("is_hero").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("listing_photos_listing_idx").on(t.listingId, t.sortOrder)],
);

export const emails = pgTable(
  "emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    month: text("month").notNull(), // 'YYYY-MM'
    slot: emailSlot("slot").notNull(),
    type: emailType("type").notNull(),
    sendDate: date("send_date"),
    status: emailStatus("status").notNull().default("planned"),
    subject: text("subject"),
    previewText: text("preview_text"),
    copy: jsonb("copy").$type<EmailCopy>(),
    // Render input: photos[i] = ordered CDN URLs for listing i (hero first).
    // The ingestion pipeline will later normalize these into listing_photos.
    photos: jsonb("photos").$type<string[][]>(),
    html: text("html"),
    ghlTemplateId: text("ghl_template_id"),
    ghlCampaignId: text("ghl_campaign_id"),
    swapNote: text("swap_note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("emails_month_idx").on(t.month)],
);

export const emailListings = pgTable(
  "email_listings",
  {
    emailId: uuid("email_id")
      .notNull()
      .references(() => emails.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.emailId, t.listingId] })],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    emailId: uuid("email_id")
      .notNull()
      .references(() => emails.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => profiles.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("comments_email_idx").on(t.emailId, t.createdAt)],
);

export const marketSnapshots = pgTable(
  "market_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: text("source").notNull(),
    geography: text("geography").notNull(),
    periodStart: date("period_start"),
    periodEnd: date("period_end"),
    metrics: jsonb("metrics").$type<Record<string, unknown>>().notNull(),
    methodNotes: text("method_notes"),
    filePath: text("file_path"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("market_snapshots_geo_idx").on(t.geography, t.periodEnd)],
);

export const emailStats = pgTable("email_stats", {
  emailId: uuid("email_id")
    .primaryKey()
    .references(() => emails.id, { onDelete: "cascade" }),
  delivered: integer("delivered"),
  opens: integer("opens"),
  clicks: integer("clicks"),
  unsubscribes: integer("unsubscribes"),
  bounces: integer("bounces"),
  pulledAt: timestamp("pulled_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  keys: jsonb("keys").$type<{ p256dh: string; auth: string }>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
