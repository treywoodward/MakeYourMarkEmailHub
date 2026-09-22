"use client";

import { useState, useTransition } from "react";
import { generateEmail } from "@/app/emails/[id]/actions";

export function GeneratePanel({
  emailId,
  aiEnabled,
  hasCopy,
}: {
  emailId: string;
  aiEnabled: boolean;
  hasCopy: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(!hasCopy);

  return (
    <section className="mx-4 mb-4 rounded-xl border border-hairline bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-navy">Generate with Claude</h2>
        {hasCopy && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs text-slate-500 underline"
          >
            {open ? "Hide" : "Regenerate"}
          </button>
        )}
      </div>

      {!aiEnabled ? (
        <p className="mt-2 text-sm text-slate-500">
          Add an <code>ANTHROPIC_API_KEY</code> to enable generation.
        </p>
      ) : (
        open && (
          <div className="mt-3">
            <p className="mb-2 text-sm text-slate-600">
              Describe the email. For a listing, include the address, price,
              beds/baths/sqft, and what makes it special. For a market pulse,
              include the numbers with their sources. For education, give the
              topic and the points to make.
            </p>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              placeholder="Brief for Claude…"
              className="w-full rounded-lg border border-hairline p-2 text-sm focus:border-navy focus:outline-none"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button
              disabled={pending || !brief.trim()}
              onClick={() =>
                startTransition(async () => {
                  setError(null);
                  const res = await generateEmail(emailId, brief);
                  if (res.error) setError(res.error);
                  else setOpen(false);
                })
              }
              className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-deep-navy disabled:opacity-50"
            >
              {pending
                ? "Writing the email…"
                : hasCopy
                  ? "Regenerate"
                  : "Generate email"}
            </button>
          </div>
        )
      )}
    </section>
  );
}
