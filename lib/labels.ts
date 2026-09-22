// Human-readable labels and status styling for the email type and status enums.

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
  pushed: "Pushed",
  sent: "Sent",
};

// A status dot color per state. Semantic but restrained: gold for "wants you",
// warm amber for changes, green for approved, muted ink for done/neutral.
export const statusDot: Record<EmailStatus, string> = {
  planned: "bg-faint",
  drafting: "bg-navy/40",
  in_review: "bg-gold",
  changes_requested: "bg-amber-500",
  approved: "bg-emerald-600",
  pushed: "bg-navy",
  sent: "bg-ink-3/60",
};

// A few states deserve emphasis in the label color; the rest stay muted ink.
export const statusEmphasis: Partial<Record<EmailStatus, string>> = {
  in_review: "text-gold-ink",
  changes_requested: "text-amber-700",
  approved: "text-emerald-700",
};
