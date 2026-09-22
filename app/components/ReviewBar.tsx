"use client";

import { useState, useTransition } from "react";
import type { EmailStatus } from "@/lib/types";
import { approveEmail, requestChanges } from "@/app/emails/[id]/actions";

export function ReviewBar({
  emailId,
  status,
  dbEnabled,
}: {
  emailId: string;
  status: EmailStatus;
  dbEnabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!dbEnabled) {
    return (
      <div className="sticky bottom-0 border-t border-hairline bg-white px-4 py-3">
        <p className="text-center text-xs text-slate-500">
          Connect Neon (set DATABASE_URL) to approve, request changes, and comment.
        </p>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 border-t border-hairline bg-white px-4 py-3">
      {noteOpen ? (
        <div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What should change?"
            className="w-full rounded-lg border border-hairline p-2 text-sm focus:border-navy focus:outline-none"
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
              className="flex-1 rounded-lg bg-navy py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Send request
            </button>
            <button
              onClick={() => setNoteOpen(false)}
              className="rounded-lg border border-hairline px-4 text-sm text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            disabled={pending || status === "approved"}
            onClick={() => startTransition(() => approveEmail(emailId))}
            className="flex-1 rounded-lg bg-navy py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "approved" ? "Approved" : "Approve"}
          </button>
          <button
            disabled={pending}
            onClick={() => setNoteOpen(true)}
            className="flex-1 rounded-lg border border-navy py-3 text-sm font-medium text-navy disabled:opacity-50"
          >
            Request changes
          </button>
        </div>
      )}
    </div>
  );
}
