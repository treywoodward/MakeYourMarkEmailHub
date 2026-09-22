"use server";

import { requireUser } from "@/lib/auth";
import {
  saveSubscription,
  removeSubscription,
  type WebPushSubscription,
} from "@/lib/push/store";

export async function subscribePush(sub: WebPushSubscription) {
  const user = await requireUser();
  await saveSubscription(user, sub);
}

export async function unsubscribePush(endpoint: string) {
  await requireUser();
  await removeSubscription(endpoint);
}
