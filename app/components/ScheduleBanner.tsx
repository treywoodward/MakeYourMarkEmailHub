"use client";

import { useEffect, useState, useTransition } from "react";
import { requestSendDate } from "@/app/emails/[id]/actions";
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
 * Shown to Dusty when an email is scheduled: the send date, plus the option to
 * request a different one. Also pops a toast the first time he lands on it (from
 * the push notification) in this session.
 */
export function ScheduleBanner({
  emailId,
  sendDate,
}: {
  emailId: string;
  sendDate: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(sendDate ?? "");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  const when = sendDate ? prettyDate(sendDate) : null;

  useEffect(() => {
    if (!when) return;
    try {
      const key = `mym_scheduled_toast_${emailId}`;
      if (!sessionStorage.getItem(key)) {
        toast(`This email is scheduled to go out ${when}.`);
        sessionStorage.setItem(key, "1");
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-ink">
        Scheduled
      </p>
      <p className="mt-1 font-serif text-lg text-ink">
        Going out {when ?? "soon"}
      </p>

      {sent ? (
        <p className="mt-2 text-sm text-ink-2">
          Your date request was sent to Trey.
        </p>
      ) : open ? (
        <div className="mt-3 space-y-2.5">
          <label className="block text-xs font-medium text-ink-3">
            Preferred date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-hairline bg-surface px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none"
            />
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Anything Trey should know? (optional)"
            className="w-full rounded-xl border border-hairline bg-surface p-3 text-sm text-ink placeholder:text-ink-3 focus:border-navy focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              disabled={pending || !date}
              onClick={() =>
                start(async () => {
                  const res = await requestSendDate(emailId, date, note);
                  if (res.error) toast(res.error);
                  else {
                    setSent(true);
                    toast("Date request sent to Trey.", "success");
                  }
                })
              }
              className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send request"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ink-3 transition hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 text-sm font-medium text-navy underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
        >
          Request a different date
        </button>
      )}
    </div>
  );
}
