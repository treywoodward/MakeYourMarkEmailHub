// Zod schemas for the structured copy Claude returns per email type (spec section 5).
// The LLM produces JSON; we validate it here (retry once on failure), then a render
// function in lib/email/render/*.ts turns the validated object into HTML.
// The LLM never writes HTML.

import { z } from "zod";

// Shared fields present on every email type.
const baseCopy = z.object({
  subject: z.string(),
  previewText: z.string(),
  eyebrow: z.string(),
  headline: z.string(),
  intro: z.string(),
});

const stat = z.object({
  value: z.string(),
  label: z.string(),
});

// A "Dusty's take" block, reused by several types.
const dustysTake = z.object({
  quote: z.string().optional(),
  paragraphs: z.array(z.string()).min(1),
});

// -------- listing --------
const listingItem = z.object({
  eyebrow: z.string(),
  address: z.string(),
  price: z.string(),
  stats: z.array(stat).min(3).max(4),
  paragraphs: z.array(z.string()).min(1),
  callout: z.string(), // one gold callout: the single most distinctive feature
  mlsLine: z.string(),
  listingUrl: z.string().url().optional(),
  variant: z.enum(["justListed", "comingSoon", "newPrice"]).optional(),
  // Photos come from the database, not the LLM (spec section 5).
});

export const listingCopySchema = baseCopy.extend({
  type: z.literal("listing"),
  listings: z.array(listingItem).min(1).max(4),
});

// -------- marketPulse --------
const marketStat = z.object({
  value: z.string(),
  label: z.string(),
  sublabel: z.string(),
});

export const marketPulseCopySchema = baseCopy.extend({
  type: z.literal("marketPulse"),
  openingNote: z.string(),
  stats: z.array(marketStat).length(3),
  whatsMoving: z.object({
    headline: z.string(),
    paragraphs: z.array(z.string()).min(1),
  }),
  tierTable: z
    .array(z.object({ tier: z.string(), value: z.string() }))
    .optional(),
  dustysTake,
  sourceNote: z.string(), // "Where these numbers come from" content
});

// -------- education --------
// Either numbered sections (items) or argued sections (sections). At least one.
export const educationCopySchema = baseCopy
  .extend({
    type: z.literal("education"),
    items: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    sections: z
      .array(
        z.object({
          kicker: z.string(),
          headline: z.string(),
          paragraphs: z.array(z.string()).min(1),
        }),
      )
      .optional(),
    dustysTake,
    sideNote: z.string().optional(),
  })
  .refine((d) => (d.items?.length ?? 0) > 0 || (d.sections?.length ?? 0) > 0, {
    message: "education copy needs either items[] or sections[]",
  });

// -------- holiday --------
export const holidayCopySchema = baseCopy.extend({
  type: z.literal("holiday"),
  note: z.array(z.string()).min(1),
  list: z.object({
    kicker: z.string(),
    title: z.string(),
    items: z.array(z.string()).min(1),
  }),
  closing: z.string(),
  pullQuote: z.string(),
});

// Discriminated union across all four types.
export const emailCopySchema = z.discriminatedUnion("type", [
  listingCopySchema,
  marketPulseCopySchema,
  educationCopySchema,
  holidayCopySchema,
]);

export type ListingCopy = z.infer<typeof listingCopySchema>;
export type MarketPulseCopy = z.infer<typeof marketPulseCopySchema>;
export type EducationCopy = z.infer<typeof educationCopySchema>;
export type HolidayCopy = z.infer<typeof holidayCopySchema>;
export type EmailCopy = z.infer<typeof emailCopySchema>;
