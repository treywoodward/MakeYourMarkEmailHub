// Human-readable labels and pill styling for the email type and status enums.

import type { EmailStatus, EmailType } from "./types";

export const typeLabel: Record<EmailType, string> = {
  listing: "Listing",
  marketPulse: "Market Pulse",
  education: "Education",
  holiday: "Holiday",
};

export const statusLabel: Record<EmailStatus, string> = {
  planned: "Planned",
  drafting: "Drafting",
  in_review: "Needs review",
  changes_requested: "Changes requested",
  approved: "Approved",
  pushed: "Pushed to GHL",
  sent: "Sent",
};

// Tailwind classes per status. Kept within the brand palette, with soft amber
// for "changes requested" and soft green for approved/sent.
export const statusPill: Record<EmailStatus, string> = {
  planned: "bg-panel text-navy border border-hairline",
  drafting: "bg-panel text-navy border border-hairline",
  in_review: "bg-gold/15 text-navy border border-gold/40",
  changes_requested: "bg-amber-50 text-amber-800 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  pushed: "bg-navy/10 text-navy border border-navy/20",
  sent: "bg-slate-100 text-slate-600 border border-slate-200",
};
