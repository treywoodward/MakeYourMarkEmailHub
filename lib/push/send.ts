// Send Web Push notifications via web-push. Guarded on VAPID config so the app
// runs before keys are set. Dead subscriptions (404/410) are pruned.
import "server-only";
import webpush from "web-push";
import { subscriptionsExcept, removeSubscription } from "./store";

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

/** Notify everyone except the actor (the other party on a review action). */
export async function notifyOthers(actorProfileId: string, payload: PushPayload) {
  if (!isPushConfigured) return;
  configure();
  const subs = await subscriptionsExcept(actorProfileId);
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          JSON.stringify(payload),
        );
      } catch (err) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) await removeSubscription(s.endpoint);
      }
    }),
  );
}
