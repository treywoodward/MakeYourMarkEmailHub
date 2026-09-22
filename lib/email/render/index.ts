// Dispatch validated copy to the right render function.
// photosByListing is only meaningful for listing emails.

import type { EmailCopy } from "@/lib/email/schemas";
import { renderListing } from "./listing";
import { renderMarketPulse } from "./marketPulse";
import { renderEducation } from "./education";
import { renderHoliday } from "./holiday";

export function renderEmail(
  copy: EmailCopy,
  photosByListing: string[][] = [],
): string {
  switch (copy.type) {
    case "listing":
      return renderListing(copy, photosByListing);
    case "marketPulse":
      return renderMarketPulse(copy);
    case "education":
      return renderEducation(copy);
    case "holiday":
      return renderHoliday(copy);
    default: {
      const _exhaustive: never = copy;
      throw new Error(`Unknown email type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

/** Render, returning null instead of throwing when a type is not yet supported. */
export function tryRenderEmail(
  copy: EmailCopy,
  photosByListing: string[][] = [],
): string | null {
  try {
    return renderEmail(copy, photosByListing);
  } catch {
    return null;
  }
}
