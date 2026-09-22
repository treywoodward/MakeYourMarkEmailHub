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
    <section className="mx-4 mb-4 overflow-hidden rounded-2xl border border-hairline bg-surface">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <h2 className="font-serif text-lg text-ink">Generate with Claude</h2>
        </div>
        {hasCopy && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-ink-3 transition hover:text-ink"
          >
            {open ? "Hide" : "Regenerate"}
          </button>
        )}
      </div>

      {!aiEnabled ? (
        <p className="border-t border-hairline px-4 py-3 text-sm text-ink-2">
          Add an <code className="text-gold-ink">ANTHROPIC_API_KEY</code> to
          enable generation.
        </p>
      ) : (
        open && (
          <div className="border-t border-hairline p-4">
            <p className="mb-2.5 text-sm leading-relaxed text-ink-2">
              Describe the email. For a listing, give the address, price,
              beds/baths/sqft, and what makes it special. For a market pulse,
              the numbers with their sources. For education, the topic and the
              points to make.
            </p>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              placeholder="Brief for Claude…"
              className="w-full rounded-xl border border-hairline bg-raise p-3 text-sm leading-relaxed text-ink placeholder:text-ink-3 focus:border-navy focus:bg-surface focus:outline-none"
            />
            {error && (
              <p className="mt-2 text-sm text-amber-700">{error}</p>
            )}
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
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-deep-navy transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            >
              {pending && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-deep-navy/30 border-t-deep-navy" />
              )}
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
