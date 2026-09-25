"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Admin hand-off to GHL. The GHL API cannot inject our HTML or schedule a send,
 * so this copies the finished HTML for Trey to paste into a GHL campaign and
 * schedule for the target date.
 */
export function SendInGhlPanel({
  html,
  sendDate,
}: {
  html: string;
  sendDate: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const when = sendDate ? prettyDate(sendDate) : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      toast("Email HTML copied. Paste it into GHL.", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast("Copy failed. Select and copy the preview HTML manually.");
    }
  }

  return (
    <div className="rounded-2xl border border-navy/20 bg-navy/[0.04] p-4">
      <p className="font-serif text-lg text-ink">Send in GoHighLevel</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-2">
        {when ? (
          <>
            Scheduled for <span className="font-medium text-ink">{when}</span>.{" "}
          </>
        ) : null}
        Create a campaign in GHL, paste this HTML into the code editor, and
        schedule it for {when ? "that date" : "the send date"}.
      </p>
      <button
        onClick={copy}
        className="mt-3 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99]"
      >
        {copied ? "Copied" : "Copy email HTML"}
      </button>
    </div>
  );
}
