// Data-access for submitted listings (Neon).
import "server-only";
import { desc, eq, and, inArray, notInArray, gte } from "drizzle-orm";
import { requireDb, isDbConfigured, db } from "@/lib/db";
import { listings, listingPhotos, emailListings, profiles } from "@/lib/db/schema";
import type { ListingState } from "@/lib/types";
import type { AppUser } from "@/lib/auth";
import type { ExtractedListing } from "@/lib/ai/vision";
import type { ListingFacts } from "@/lib/ai/generate";

export interface PhotoInput {
  url: string;
  width: number | null;
  height: number | null;
}

export interface ListingSummary {
  id: string;
  address: string | null;
  city: string | null;
  price: number | null;
  state: ListingState;
  flags: Record<string, unknown>;
  createdAt: string;
  heroUrl: string | null;
}

export interface ListingPhoto {
  url: string;
  isHero: boolean;
  excludedReason: string | null;
}

export interface ListingDetail {
  id: string;
  mlsNumber: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  price: number | null;
  beds: string | null;
  baths: string | null;
  sqft: number | null;
  acres: string | null;
  statusText: string | null;
  neighborhood: string | null;
  descriptionRaw: string | null;
  state: ListingState;
  flags: Record<string, unknown>;
  photos: ListingPhoto[];
  screenshotUrl: string | null;
}

function isPortrait(p: PhotoInput): boolean {
  return Boolean(p.width && p.height && p.height > p.width);
}

export async function createListing(input: {
  user: AppUser;
  mlsNumber: string | null;
  extracted: ExtractedListing;
  screenshotUrl: string | null;
  photos: PhotoInput[];
}): Promise<string> {
  const database = requireDb();
  await database
    .insert(profiles)
    .values({
      id: input.user.id,
      email: input.user.email,
      name: input.user.name,
      role: input.user.role,
    })
    .onConflictDoNothing();

  const flags: Record<string, unknown> = {};
  if (input.extracted.descriptionTruncated) flags.truncated = true;
  if (/contingen/i.test(input.extracted.statusText ?? "")) flags.contingency = true;
  const portrait = input.photos.filter(isPortrait).length;
  if (portrait > 0) flags.portraitPhotos = portrait;
  if (input.screenshotUrl) flags.screenshotUrl = input.screenshotUrl;
  const needsAttention = Boolean(flags.truncated || flags.contingency);

  const [row] = await database
    .insert(listings)
    .values({
      mlsNumber: input.mlsNumber || input.extracted.mlsNumber,
      address: input.extracted.address,
      city: input.extracted.city,
      zip: input.extracted.zip,
      price: input.extracted.price,
      beds: input.extracted.beds,
      baths: input.extracted.baths,
      sqft: input.extracted.sqft,
      acres: input.extracted.acres,
      statusText: input.extracted.statusText,
      neighborhood: input.extracted.neighborhood,
      descriptionRaw: input.extracted.description,
      source: "submission",
      flags,
      state: needsAttention ? "needs_attention" : "ready",
      submittedBy: input.user.id,
    })
    .returning({ id: listings.id });

  const listingId = row.id;

  if (input.photos.length) {
    const heroIdx = input.photos.findIndex((p) => !isPortrait(p));
    const hero = heroIdx === -1 ? 0 : heroIdx;
    await database.insert(listingPhotos).values(
      input.photos.map((p, i) => ({
        listingId,
        sourceUrl: p.url,
        width: p.width,
        height: p.height,
        isHero: i === hero,
        excludedReason: isPortrait(p) ? "portrait" : null,
        sortOrder: i,
      })),
    );
  }

  return listingId;
}

export async function listListings(): Promise<ListingSummary[]> {
  if (!isDbConfigured || !db) return [];
  try {
    const rows = await db.select().from(listings).orderBy(desc(listings.createdAt));
    const heroes = await db
      .select({
        listingId: listingPhotos.listingId,
        url: listingPhotos.sourceUrl,
      })
      .from(listingPhotos)
      .where(eq(listingPhotos.isHero, true));
    const heroByListing = new Map(heroes.map((h) => [h.listingId, h.url]));
    return rows.map((r) => ({
      id: r.id,
      address: r.address,
      city: r.city,
      price: r.price,
      state: r.state,
      flags: r.flags,
      createdAt: r.createdAt.toISOString(),
      heroUrl: heroByListing.get(r.id) ?? null,
    }));
  } catch (err) {
    // Degrade to an empty list rather than 500 the page (e.g. the listings
    // tables not yet pushed to this database). The cause is logged.
    console.error(
      "[data] listListings DB query failed; showing empty. Run `npm run db:push`?",
      err,
    );
    return [];
  }
}

// ---- listing-email pipeline ----------------------------------------------

/** Listings that are ready and not yet assigned to any email, oldest first. */
export async function pendingListings(): Promise<
  { id: string; createdAt: Date }[]
> {
  if (!isDbConfigured || !db) return [];
  try {
    const assigned = db
      .select({ id: emailListings.listingId })
      .from(emailListings);
    return await db
      .select({ id: listings.id, createdAt: listings.createdAt })
      .from(listings)
      .where(and(eq(listings.state, "ready"), notInArray(listings.id, assigned)))
      .orderBy(listings.createdAt);
  } catch (err) {
    console.error("[data] pendingListings failed", err);
    return [];
  }
}

/** How many listings were submitted in the last `minutes` (for notify debounce). */
export async function countRecentListings(minutes: number): Promise<number> {
  if (!isDbConfigured || !db) return 0;
  try {
    const since = new Date(Date.now() - minutes * 60_000);
    const rows = await db
      .select({ id: listings.id })
      .from(listings)
      .where(gte(listings.createdAt, since));
    return rows.length;
  } catch (err) {
    console.error("[data] countRecentListings failed", err);
    return 0;
  }
}

export interface ListingForEmail extends ListingFacts {
  id: string;
  galleryUrls: string[]; // hero first, portrait/excluded left out
}

/** Full facts + gallery URLs for a set of listings, in the given id order. */
export async function listingsForEmail(
  ids: string[],
): Promise<ListingForEmail[]> {
  if (!ids.length || !isDbConfigured || !db) return [];
  const rows = await db.select().from(listings).where(inArray(listings.id, ids));
  const photoRows = await db
    .select()
    .from(listingPhotos)
    .where(inArray(listingPhotos.listingId, ids))
    .orderBy(listingPhotos.sortOrder);

  const byId = new Map(rows.map((r) => [r.id, r]));
  const galleryById = new Map<string, string[]>();
  for (const p of photoRows) {
    if (p.excludedReason || !p.sourceUrl) continue;
    const arr = galleryById.get(p.listingId) ?? [];
    // hero to the front, everything else in sort order
    if (p.isHero) arr.unshift(p.sourceUrl);
    else arr.push(p.sourceUrl);
    galleryById.set(p.listingId, arr);
  }

  return ids
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => {
      const galleryUrls = galleryById.get(r.id) ?? [];
      return {
        id: r.id,
        address: r.address,
        city: r.city,
        zip: r.zip,
        neighborhood: r.neighborhood,
        price: r.price,
        beds: r.beds,
        baths: r.baths,
        sqft: r.sqft,
        acres: r.acres,
        statusText: r.statusText,
        mlsNumber: r.mlsNumber,
        description: r.descriptionEdited ?? r.descriptionRaw,
        photoCount: galleryUrls.length,
        galleryUrls,
      };
    });
}

export async function getListing(id: string): Promise<ListingDetail | null> {
  if (!isDbConfigured || !db) return null;
  try {
    const rows = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    const r = rows[0];
    if (!r) return null;
    const photos = await db
      .select()
      .from(listingPhotos)
      .where(and(eq(listingPhotos.listingId, id)))
      .orderBy(listingPhotos.sortOrder);
    const flags = r.flags as Record<string, unknown>;
    return {
    id: r.id,
    mlsNumber: r.mlsNumber,
    address: r.address,
    city: r.city,
    zip: r.zip,
    price: r.price,
    beds: r.beds,
    baths: r.baths,
    sqft: r.sqft,
    acres: r.acres,
    statusText: r.statusText,
    neighborhood: r.neighborhood,
    descriptionRaw: r.descriptionRaw,
    state: r.state,
    flags,
    photos: photos.map((p) => ({
      url: p.sourceUrl ?? "",
      isHero: p.isHero,
      excludedReason: p.excludedReason,
    })),
      screenshotUrl: (flags.screenshotUrl as string) ?? null,
    };
  } catch (err) {
    console.error(
      "[data] getListing DB query failed; showing not-found. Run `npm run db:push`?",
      err,
    );
    return null;
  }
}
