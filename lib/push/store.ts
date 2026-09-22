// Web Push subscription storage (Neon). One row per browser/device, keyed by
// endpoint, tied to the acting profile (admin/client).
import "server-only";
import { eq, ne } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { pushSubscriptions, profiles } from "@/lib/db/schema";
import type { AppUser } from "@/lib/auth";

export interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function saveSubscription(user: AppUser, sub: WebPushSubscription) {
  if (!isDbConfigured || !db) return;
  await db
    .insert(profiles)
    .values({ id: user.id, email: user.email, name: user.name, role: user.role })
    .onConflictDoNothing();
  await db
    .insert(pushSubscriptions)
    .values({ profileId: user.id, endpoint: sub.endpoint, keys: sub.keys })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { profileId: user.id, keys: sub.keys },
    });
}

export async function removeSubscription(endpoint: string) {
  if (!isDbConfigured || !db) return;
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

/** Every subscription that does NOT belong to this profile (the other party). */
export async function subscriptionsExcept(profileId: string) {
  if (!isDbConfigured || !db) return [];
  return db
    .select()
    .from(pushSubscriptions)
    .where(ne(pushSubscriptions.profileId, profileId));
}
