// Send Web Push notifications via web-push. Guarded on VAPID config so the app
// runs before keys are set. Dead subscriptions (404/410) are pruned.
import "server-only";
import webpush from "web-push";
import {
  subscriptionsExcept,
  subscriptionsFor,
  removeSubscription,
} from "./store";

export const isPushConfigured = Boolean(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
);

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:dusty@makeyourmarklbk.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

type Sub = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Push a payload to a set of subscriptions; prune dead ones. Returns delivered count. */
async function deliver(subs: Sub[], payload: PushPayload): Promise<number> {
  const results = await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          JSON.stringify(payload),
        );
        return true;
      } catch (err) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) await removeSubscription(s.endpoint);
        return false;
      }
    }),
  );
  return results.filter(Boolean).length;
}

/**
 * Notify everyone except the actor (the other party on a review action).
 * Returns how many live subscriptions were delivered to, so callers can tell
 * the user whether the other party actually has notifications enabled.
 */
export async function notifyOthers(
  actorProfileId: string,
  payload: PushPayload,
): Promise<number> {
  if (!isPushConfigured) return 0;
  configure();
  return deliver(await subscriptionsExcept(actorProfileId), payload);
}

/** Notify a specific profile's own devices. Returns the delivered count. */
export async function notifyProfile(
  profileId: string,
  payload: PushPayload,
): Promise<number> {
  if (!isPushConfigured) return 0;
  configure();
  return deliver(await subscriptionsFor(profileId), payload);
}
