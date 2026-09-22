"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { addComment, setEmailStatus } from "@/lib/data/emails";

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
