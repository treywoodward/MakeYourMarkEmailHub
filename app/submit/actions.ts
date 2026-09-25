"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { extractListingFromScreenshot, type ExtractedListing } from "@/lib/ai/vision";
import {
  createListing,
  countRecentListings,
  type PhotoInput,
} from "@/lib/data/listings";
import { notifyProfile } from "@/lib/push/send";

const EMPTY: ExtractedListing = {
  address: null,
  city: null,
  zip: null,
  price: null,
  beds: null,
  baths: null,
  sqft: null,
  acres: null,
  statusText: null,
  neighborhood: null,
  mlsNumber: null,
  description: null,
  descriptionTruncated: false,
};

export async function submitListing(input: {
  mlsNumber: string;
  screenshotUrl: string | null;
  photos: PhotoInput[];
}): Promise<{ error?: string; listingId?: string }> {
  const user = await requireUser();

  if (!input.screenshotUrl && input.photos.length === 0 && !input.mlsNumber.trim()) {
    return { error: "Add a screenshot, some photos, or an MLS number." };
  }

  let extracted = EMPTY;
  if (input.screenshotUrl) {
    try {
      extracted = await extractListingFromScreenshot(input.screenshotUrl);
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Could not read the screenshot.",
      };
    }
  }

  try {
    const listingId = await createListing({
      user,
      mlsNumber: input.mlsNumber.trim() || null,
      extracted,
      screenshotUrl: input.screenshotUrl,
      photos: input.photos,
    });
    revalidatePath("/listings");

    // Notify the admin, but only for the FIRST listing of a batch (this one is
    // already counted), so a run of listings over an hour is one ping, not five.
    // The "ready to review" ping comes later, once the batch is assembled.
    if (user.role !== "admin" && (await countRecentListings(60)) <= 1) {
      const where =
        extracted.address ?? (input.mlsNumber.trim() || "a new listing");
      await notifyProfile("admin", {
        title: "Dusty is adding listings",
        body: `Starting with ${where}. I will draft the email once they stop coming in.`,
        url: "/listings",
      });
    }

    return { listingId };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save the listing.",
    };
  }
}
