"use server";

import { requireUser } from "@/lib/auth";
import { notifyOthers } from "@/lib/push/send";
import { getDraft } from "@/lib/ghl";

/**
 * Admin action: push a "please review" notification to Dusty for a GHL draft.
 * Returns how many of Dusty's devices it reached (0 means he has not enabled
 * notifications yet), or an error if a non-admin calls it.
 */
export async function notifyDustyToReview(
  draftId: string,
): Promise<{ sent: number } | { error: string }> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Only the admin can send this." };
  const draft = await getDraft(draftId);
  const name = draft?.name ?? "a new email";
  const sent = await notifyOthers(user.id, {
    title: "New email to review",
    body: `${name} is ready for your review.`,
    url: `/drafts/${draftId}`,
  });
  return { sent };
}
