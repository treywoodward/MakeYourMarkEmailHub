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
import { notifyOthers, notifyProfile } from "@/lib/push/send";
import { formatCardDate } from "@/lib/dates";

async function emailSubject(emailId: string): Promise<string> {
  const e = await getEmailDetail(emailId);
  return e?.subject || "an email";
}

// Both roles (Trey and Dusty) may approve, request changes, and comment.

export async function approveEmail(
  emailId: string,
): Promise<{ sendDate: string | null }> {
  const user = await requireUser();
  const email = await getEmailDetail(emailId);
  await setEmailStatus(emailId, "approved");
  revalidatePath(`/emails/${emailId}`);
  revalidatePath("/");

  const subject = email?.subject || "an email";
  if (user.role === "admin") {
    // Tell Dusty it is set, with the date and the option to ask for another.
    const when = email?.sendDate ? formatCardDate(email.sendDate) : null;
    await notifyProfile("client", {
      title: "Your email is scheduled",
      body: when
        ? `"${subject}" is set to go out ${when}. Tap to review or request a different date.`
        : `"${subject}" is approved.`,
      url: `/emails/${emailId}`,
    });
  } else {
    await notifyOthers(user.id, {
      title: "Approved",
      body: `${user.name} approved "${subject}"`,
      url: `/emails/${emailId}`,
    });
  }
  return { sendDate: email?.sendDate ?? null };
}

/** Client asks to move the send date. Records it and pings the admin. */
export async function requestSendDate(
  emailId: string,
  isoDate: string,
  note: string,
): Promise<{ ok?: true; error?: string }> {
  const user = await requireUser();
  if (!isoDate) return { error: "Pick a date." };
  const pretty = formatCardDate(isoDate);
  const trimmed = note.trim();
  await addComment(
    emailId,
    user,
    `Requested a different send date: ${pretty}.${trimmed ? " " + trimmed : ""}`,
  );
  await setEmailStatus(emailId, "changes_requested");
  revalidatePath(`/emails/${emailId}`);
  revalidatePath("/");
  await notifyProfile("admin", {
    title: "Date change requested",
    body: `${user.name} asked to move "${await emailSubject(emailId)}" to ${pretty}.`,
    url: `/emails/${emailId}`,
  });
  return { ok: true };
}

export async function requestChanges(emailId: string, note: string) {
  const user = await requireUser();
  const trimmed = note.trim();
  if (trimmed) await addComment(emailId, user, trimmed);
  await setEmailStatus(emailId, "changes_requested");
  revalidatePath(`/emails/${emailId}`);
  revalidatePath("/");
  await notifyOthers(user.id, {
    title: "Changes requested",
    body: `${user.name} requested changes on "${await emailSubject(emailId)}"`,
    url: `/emails/${emailId}`,
  });
}

export async function postComment(emailId: string, body: string) {
  const user = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) return;
  await addComment(emailId, user, trimmed);
  revalidatePath(`/emails/${emailId}`);
  await notifyOthers(user.id, {
    title: `New comment from ${user.name}`,
    body: trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed,
    url: `/emails/${emailId}`,
  });
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
    await notifyOthers(user.id, {
      title: "Ready to review",
      body: `A new email is ready: "${copy.subject}"`,
      url: `/emails/${emailId}`,
    });
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Generation failed." };
  }
}
