// Send cadence: one email every Monday on a four-week rotation, keyed to which
// Monday of the calendar month it is:
//   1st Monday: listing (dual by default)
//   2nd Monday: Market Pulse
//   3rd Monday: listing
//   4th Monday: value / education
//   5th Monday (when it exists): flex — holiday, extra listing drop, or skip.
//
// So listing emails go out on the 1st and 3rd Monday of a month. A batch of
// submitted listings targets the next listing Monday that leaves review time.

export type SlotKind = "listing" | "marketPulse" | "education" | "flex";
export type SlotName = "week1" | "week2" | "week3" | "week4" | "week5";

/** How many days of review buffer to leave before a send. */
export const REVIEW_BUFFER_DAYS = 2;

function atMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, days: number): Date {
  const r = atMidnight(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Which Monday of its month a date is (1..5). Assumes `d` is a Monday. */
export function mondayOrdinal(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7) + 1;
}

/** The rotation slot a given Monday holds. */
export function slotForMonday(d: Date): SlotKind {
  const n = mondayOrdinal(d);
  if (n === 1 || n === 3) return "listing";
  if (n === 2) return "marketPulse";
  if (n === 4) return "education";
  return "flex";
}

/** The email_slot enum value (week1..week5) for a Monday date. */
export function slotName(d: Date): SlotName {
  return (["week1", "week2", "week3", "week4", "week5"] as const)[
    mondayOrdinal(d) - 1
  ];
}

/** The first Monday on or after a date (returns the date itself if it is Monday). */
function mondayOnOrAfter(d: Date): Date {
  const day = atMidnight(d).getDay(); // 0 Sun .. 6 Sat
  const delta = (8 - day) % 7; // 0 if Monday, else days until Monday
  return addDays(d, delta);
}

/**
 * The next listing Monday (1st or 3rd Monday of a month) that is at least
 * `bufferDays` away from `from`, so there is time to review before it sends.
 */
export function nextListingMonday(
  from: Date,
  bufferDays: number = REVIEW_BUFFER_DAYS,
): Date {
  const earliest = addDays(from, bufferDays);
  let monday = mondayOnOrAfter(earliest);
  for (let i = 0; i < 16; i++) {
    if (slotForMonday(monday) === "listing") return monday;
    monday = addDays(monday, 7);
  }
  return monday; // unreachable in practice
}

/**
 * The next Monday of a given rotation kind (marketPulse=2nd, education=4th,
 * listing=1st/3rd) at least `bufferDays` from `from`.
 */
export function nextMondayForSlot(
  kind: SlotKind,
  from: Date,
  bufferDays: number = REVIEW_BUFFER_DAYS,
): Date {
  const earliest = addDays(from, bufferDays);
  let monday = mondayOnOrAfter(earliest);
  for (let i = 0; i < 20; i++) {
    if (slotForMonday(monday) === kind) return monday;
    monday = addDays(monday, 7);
  }
  return monday;
}

/** The rotation kind an email type targets. */
export function slotKindForType(
  type: "marketPulse" | "education" | "listing" | "holiday",
): SlotKind {
  if (type === "marketPulse") return "marketPulse";
  if (type === "education") return "education";
  if (type === "holiday") return "flex";
  return "listing";
}

/** 'YYYY-MM-DD' in local time (matches how send dates are stored/parsed). */
export function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 'YYYY-MM' month key for a date. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
