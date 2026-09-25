// Assemble a listings email from the pending (submitted, unassigned) listings.
// A batch is considered complete once no new listing has arrived for the settle
// window, so a run of listings Dusty sends over an hour becomes ONE email.
import "server-only";
import { pendingListings, listingsForEmail } from "@/lib/data/listings";
import { createListingEmail } from "@/lib/data/emails";
import { generateListingEmail } from "@/lib/ai/generate";
import { renderEmail } from "@/lib/email/render";
import { nextListingMonday, slotName, toYmd, monthKey } from "@/lib/schedule";
import { notifyProfile } from "@/lib/push/send";
import { formatCardDate } from "@/lib/dates";

/** Wait this long after the last submission before building the email. */
export const SETTLE_MS = 60 * 60 * 1000; // 60 minutes

export type AssembleResult =
  | { status: "none" }
  | { status: "waiting"; count: number; quietMinutes: number }
  | { status: "built"; emailId: string; count: number; sendDate: string };

export async function assembleListingEmail(
  opts: { force?: boolean } = {},
): Promise<AssembleResult> {
  const pending = await pendingListings();
  if (pending.length === 0) return { status: "none" };

  const newest = Math.max(...pending.map((p) => p.createdAt.getTime()));
  const quietFor = Date.now() - newest;
  if (!opts.force && quietFor < SETTLE_MS) {
    return {
      status: "waiting",
      count: pending.length,
      quietMinutes: Math.round(quietFor / 60_000),
    };
  }

  const ids = pending.map((p) => p.id);
  const details = await listingsForEmail(ids);
  const orderedIds = details.map((d) => d.id);

  const copy = await generateListingEmail(details);
  const photos = details.map((d) => d.galleryUrls);
  const html = renderEmail(copy, photos);

  const target = nextListingMonday(new Date());
  const emailId = await createListingEmail({
    month: monthKey(target),
    slot: slotName(target),
    sendDate: toYmd(target),
    copy,
    html,
    photos,
    listingIds: orderedIds,
  });

  await notifyProfile("admin", {
    title: "Listings email ready to review",
    body: `${orderedIds.length} listing${orderedIds.length === 1 ? "" : "s"}, drafted for ${formatCardDate(toYmd(target))}.`,
    url: `/emails/${emailId}`,
  });

  return {
    status: "built",
    emailId,
    count: orderedIds.length,
    sendDate: toYmd(target),
  };
}
