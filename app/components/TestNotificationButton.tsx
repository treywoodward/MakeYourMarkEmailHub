"use client";

import { useState } from "react";
import {
  pushSupported,
  isIos,
  isStandalone,
  isSubscribed,
  enablePush,
} from "@/lib/push/browser";
import { sendTestNotification } from "@/app/notifications/actions";

/**
 * Sends the signed-in user a test push. If they have not enabled notifications
 * yet, it turns them on first (one permission prompt), then sends. Reports the
 * outcome so it is obvious whether the notification actually went out.
 */
export function TestNotificationButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      if (!pushSupported()) {
        setMsg({
          ok: false,
          text:
            isIos() && !isStandalone()
              ? "On iPhone, add this app to your Home Screen first, then open it from there."
              : "This browser does not support notifications.",
        });
        return;
      }
      if (!(await isSubscribed())) {
        const res = await enablePush();
        if (!res.ok) {
          setMsg({
            ok: false,
            text:
              res.reason === "denied"
                ? "Notifications are blocked. Allow them in your browser settings, then try again."
                : "Could not turn on notifications.",
          });
          return;
        }
      }
      const res = await sendTestNotification();
      setMsg(
        res.sent > 0
          ? { ok: true, text: "Sent. Check your notifications." }
          : { ok: false, text: "No device subscribed. Try again in a moment." },
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={run}
        disabled={busy}
        className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition hover:border-navy/30 hover:text-ink disabled:opacity-50"
      >
        {busy ? "Sending…" : "Send a test notification"}
      </button>
      {msg && (
        <span className={`text-xs ${msg.ok ? "text-emerald-700" : "text-ink-3"}`}>
          {msg.text}
        </span>
      )}
    </div>
  );
}
