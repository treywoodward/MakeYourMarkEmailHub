"use client";

import { useState, useTransition } from "react";
import { notifyDustyToReview } from "@/app/drafts/actions";

/**
 * Admin-only button that pushes a review notification to Dusty. Surfaces
 * whether it actually reached a device so Trey knows if Dusty has notifications
 * turned on yet.
 */
export function NotifyDustyButton({
  draftId,
  size = "sm",
}: {
  draftId: string;
  size?: "sm" | "lg";
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const base =
    size === "lg"
      ? "rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50"
      : "rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50";

  function send() {
    start(async () => {
      setMsg(null);
      const res = await notifyDustyToReview(draftId);
      if ("error" in res) setMsg({ ok: false, text: res.error });
      else if (res.sent > 0)
        setMsg({ ok: true, text: "Sent to Dusty" });
      else
        setMsg({
          ok: false,
          text: "Dusty has not turned on notifications yet",
        });
    });
  }

  return (
    <div className="flex items-center gap-2.5">
      <button onClick={send} disabled={pending} className={base}>
        {pending ? "Sending…" : "Notify Dusty"}
      </button>
      {msg && (
        <span
          className={`text-xs ${msg.ok ? "text-emerald-700" : "text-ink-3"}`}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}
