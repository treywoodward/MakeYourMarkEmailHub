"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assembleNow } from "@/app/home-actions";

/**
 * Admin-only prompt shown when listings are waiting to be built into an email.
 * Normally the cron builds it automatically once submissions settle; this lets
 * Trey build it on demand instead of waiting.
 */
export function PendingListingsPanel({ count }: { count: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (count === 0) return null;

  function build() {
    start(async () => {
      setMsg(null);
      const res = await assembleNow();
      if ("error" in res) setMsg(res.error);
      else if (res.status === "built") router.push(`/emails/${res.emailId}`);
      else if (res.status === "none") setMsg("Those listings are already in an email.");
      else setMsg("Nothing to build yet.");
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-ink">
          {count} listing{count === 1 ? "" : "s"} waiting to go into an email
        </p>
        <p className="mt-0.5 text-sm text-ink-2">
          It builds automatically once Dusty stops sending, or build it now.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {msg && <span className="text-xs text-ink-3">{msg}</span>}
        <button
          onClick={build}
          disabled={pending}
          className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50"
        >
          {pending ? "Writing the email…" : "Build the email now"}
        </button>
      </div>
    </div>
  );
}
