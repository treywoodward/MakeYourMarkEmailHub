"use client";

import { useState, useTransition } from "react";
import type { EmailStatus } from "@/lib/types";
import { approveEmail, requestChanges } from "@/app/emails/[id]/actions";
import { toast } from "@/lib/toast";

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const primaryBtn =
  "flex-1 rounded-xl bg-navy py-3 text-sm font-medium text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-navy";
const secondaryBtn =
  "flex-1 rounded-xl border border-navy/25 py-3 text-sm font-medium text-navy transition hover:border-navy hover:bg-navy/[0.04] active:scale-[0.99] disabled:opacity-50";

export function ReviewBar({
  emailId,
  status,
  dbEnabled,
  variant = "sticky",
}: {
  emailId: string;
  status: EmailStatus;
  dbEnabled: boolean;
  /** "sticky" = phone bottom bar; "inline" = a panel in the desktop rail. */
  variant?: "sticky" | "inline";
}) {
  const [pending, startTransition] = useTransition();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const bar =
    variant === "inline"
      ? "rounded-2xl border border-hairline bg-surface p-4"
      : "sticky bottom-0 border-t border-hairline bg-surface/95 px-4 py-3 backdrop-blur";

  if (!dbEnabled) {
    return (
      <div className={bar}>
        <p className="text-center text-xs text-ink-3">
          Connect Neon to approve, request changes, and comment.
        </p>
      </div>
    );
  }

  return (
    <div className={bar}>
      {noteOpen ? (
        <div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            autoFocus
            placeholder="What should change?"
            className="w-full rounded-xl border border-hairline bg-raise p-3 text-sm text-ink placeholder:text-ink-3 focus:border-navy focus:bg-surface focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              disabled={pending || !note.trim()}
              onClick={() =>
                startTransition(async () => {
                  await requestChanges(emailId, note);
                  setNote("");
                  setNoteOpen(false);
                })
              }
              className={primaryBtn}
            >
              {pending ? "Sending…" : "Send request"}
            </button>
            <button
              onClick={() => setNoteOpen(false)}
              className="rounded-xl px-4 text-sm font-medium text-ink-3 transition hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            disabled={pending || status === "approved"}
            onClick={() =>
              startTransition(async () => {
                const res = await approveEmail(emailId);
                toast(
                  res?.sendDate
                    ? `Approved. Copy the HTML into GHL and schedule for ${prettyDate(res.sendDate)}. Dusty was notified.`
                    : "Approved. Dusty was notified.",
                  "success",
                );
              })
            }
            className={primaryBtn}
          >
            {status === "approved" ? "Approved" : "Approve"}
          </button>
          <button
            disabled={pending}
            onClick={() => setNoteOpen(true)}
            className={secondaryBtn}
          >
            Request changes
          </button>
        </div>
      )}
    </div>
  );
}
