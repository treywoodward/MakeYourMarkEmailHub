"use server";

import { requireUser } from "@/lib/auth";
import {
  saveSubscription,
  removeSubscription,
  type WebPushSubscription,
} from "@/lib/push/store";
import { notifyProfile } from "@/lib/push/send";

export async function subscribePush(sub: WebPushSubscription) {
  const user = await requireUser();
  await saveSubscription(user, sub);
}

export async function unsubscribePush(endpoint: string) {
  await requireUser();
  await removeSubscription(endpoint);
}

/** Send a test push to the current user's own devices. Returns delivered count. */
export async function sendTestNotification(): Promise<{ sent: number }> {
  const user = await requireUser();
  const sent = await notifyProfile(user.id, {
    title: "Test notification",
    body: "Your notifications are working. This is a test from Email Hub.",
    url: "/",
  });
  return { sent };
}
