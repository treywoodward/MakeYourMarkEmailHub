// Dispatch validated copy to the right render function.
// photosByListing is only meaningful for listing emails.

import type { EmailCopy } from "@/lib/email/schemas";
import { renderListing } from "./listing";

export function renderEmail(
  copy: EmailCopy,
  photosByListing: string[][] = [],
): string {
  switch (copy.type) {
    case "listing":
      return renderListing(copy, photosByListing);
    // marketPulse, education, and holiday renderers are added next.
    default:
      throw new Error(`Renderer for "${copy.type}" is not implemented yet.`);
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
