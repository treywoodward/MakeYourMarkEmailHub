"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { extractListingFromScreenshot, type ExtractedListing } from "@/lib/ai/vision";
import { createListing, type PhotoInput } from "@/lib/data/listings";

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
    return { listingId };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Could not save the listing.",
    };
  }
}
