// Zod schemas for the structured copy Claude returns per email type (spec section 5,
// refined to match the real reference-templates/). The LLM produces JSON; we validate
// it here (retry once on failure), then a render function in lib/email/render/*.ts
// turns the validated object into HTML. The LLM never writes HTML.

import { z } from "zod";

// Optional CTA override for the navy panel. Each type has a sensible default,
// but the copy can supply its own so the CTA matches the email's voice.
const cta = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  body: z.string(),
});

// Shared fields present on every email type.
const baseCopy = z.object({
  subject: z.string(),
  previewText: z.string(),
  eyebrow: z.string(),
  headline: z.string(),
  intro: z.string(),
  cta: cta.optional(),
});

const stat = z.object({
  value: z.string(),
  label: z.string(),
});

const dustysTake = z.object({
  quote: z.string().optional(),
  paragraphs: z.array(z.string()).min(1),
});

// -------- listing --------
const listingItem = z.object({
  eyebrow: z.string(), // "Just Listed • Eastwick" (single) or "Neighborhood • City ZIP" (multi)
  address: z.string(),
  cityLine: z.string().optional(), // grey city/ZIP line, single-listing layout only
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

const tierRow = z.object({
  medianPrice: z.string(),
  sqft: z.string(),
  dom: z.string(),
  newCount: z.string(),
  absorbed: z.string(),
});

export const marketPulseCopySchema = baseCopy.extend({
  type: z.literal("marketPulse"),
  periodLabel: z.string(), // "September 2026" (header, right side)
  openingNote: z.string(),
  stats: z.array(marketStat).length(3),
  whatsMoving: z.object({
    headline: z.string(),
    paragraphs: z.array(z.string()).min(1),
  }),
  tierTable: z
    .object({
      intro: z.string().optional(),
      rows: z.array(tierRow).min(1),
      footnote: z.string().optional(),
    })
    .optional(),
  dustysTake,
  sourceNote: z.string(), // "Where these numbers come from" content
});

// -------- education --------
// Numbered sections (items) or argued sections (sections). At least one.
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
    dustysTake: dustysTake.optional(),
    sideNote: z.object({ kicker: z.string(), body: z.string() }).optional(),
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
    items: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  }),
  closing: z.array(z.string()).min(1),
  pullQuote: z.string(),
});

// Discriminated union across all four types.
export const emailCopySchema = z.discriminatedUnion("type", [
  listingCopySchema,
  marketPulseCopySchema,
  educationCopySchema,
  holidayCopySchema,
]);

export type Cta = z.infer<typeof cta>;
export type ListingItem = z.infer<typeof listingItem>;
export type ListingCopy = z.infer<typeof listingCopySchema>;
export type MarketPulseCopy = z.infer<typeof marketPulseCopySchema>;
export type EducationCopy = z.infer<typeof educationCopySchema>;
export type HolidayCopy = z.infer<typeof holidayCopySchema>;
export type EmailCopy = z.infer<typeof emailCopySchema>;
