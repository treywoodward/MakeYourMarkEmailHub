"use client";

import { useEffect, useState } from "react";
import {
  pushSupported,
  isIos,
  isStandalone,
  permission,
  isSubscribed,
  enablePush,
} from "@/lib/push/browser";

type State = "loading" | "hidden" | "prompt" | "ios-install";

const DISMISS_KEY = "mym_notif_dismissed";

function dismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function NotificationsToggle() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (dismissed()) return setState("hidden");
      if (!pushSupported()) {
        return setState(isIos() && !isStandalone() ? "ios-install" : "hidden");
      }
      if (permission() === "denied") return setState("hidden");
      if (await isSubscribed()) return setState("hidden");
      if (permission() === "granted") {
        await enablePush();
        return setState("hidden");
      }
      setState("prompt");
    })();
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setState("hidden");
  }

  if (state === "loading" || state === "hidden") return null;

  return (
    <div className="mx-4 mb-1 flex items-start gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
      <div className="min-w-0 flex-1">
        {state === "prompt" ? (
          <>
            <p className="text-sm font-medium text-ink">
              Get notified when something needs you
            </p>
            <p className="mt-0.5 text-sm text-ink-2">
              A push alert when an email is approved, commented on, or ready to
              review.
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const res = await enablePush();
                  setBusy(false);
                  if (res.ok) setState("hidden");
                }}
                className="rounded-xl bg-navy px-3.5 py-2 text-sm font-medium text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50"
              >
                {busy ? "Turning on…" : "Turn on"}
              </button>
              <button
                onClick={dismiss}
                className="text-sm font-medium text-ink-3 transition hover:text-ink"
              >
                Not now
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-ink">
              Get push alerts on your phone
            </p>
            <p className="mt-0.5 text-sm text-ink-2">
              Add this to your Home Screen first: tap the Share button, then{" "}
              <span className="font-medium text-ink">Add to Home Screen</span>.
              Reopen it from your Home Screen and turn on notifications there.
            </p>
            <button
              onClick={dismiss}
              className="mt-2 text-sm font-medium text-ink-3 transition hover:text-ink"
            >
              Got it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
