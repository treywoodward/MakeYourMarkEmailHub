"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  addComment,
  setEmailStatus,
  getEmailDetail,
  setEmailContent,
} from "@/lib/data/emails";
import { generateEmailCopy } from "@/lib/ai/generate";
import { tryRenderEmail } from "@/lib/email/render";

// Both roles (Trey and Dusty) may approve, request changes, and comment.

export async function approveEmail(emailId: string) {
  await requireUser();
  await setEmailStatus(emailId, "approved");
  revalidatePath(`/emails/${emailId}`);
  revalidatePath("/");
}

export async function requestChanges(emailId: string, note: string) {
  const user = await requireUser();
  const trimmed = note.trim();
  if (trimmed) await addComment(emailId, user, trimmed);
  await setEmailStatus(emailId, "changes_requested");
  revalidatePath(`/emails/${emailId}`);
  revalidatePath("/");
}

export async function postComment(emailId: string, body: string) {
  const user = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) return;
  await addComment(emailId, user, trimmed);
  revalidatePath(`/emails/${emailId}`);
}

/** Admin-only: have Claude write the copy for this email and render it. */
export async function generateEmail(
  emailId: string,
  brief: string,
): Promise<{ error?: string }> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Only the admin can generate." };
  if (!brief.trim()) return { error: "Add a brief describing the email." };

  const email = await getEmailDetail(emailId);
  if (!email) return { error: "Email not found." };

  try {
    const copy = await generateEmailCopy(email.type, brief.trim());
    const html = tryRenderEmail(copy, email.photos ?? []) ?? "";
    await setEmailContent(emailId, {
      copy,
      html,
      subject: copy.subject,
      previewText: copy.previewText,
      status: "in_review",
    });
    revalidatePath(`/emails/${emailId}`);
    revalidatePath("/");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Generation failed." };
  }
}
