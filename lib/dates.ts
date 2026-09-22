// Date helpers. Parse 'YYYY-MM-DD' as a *local* date so the displayed day never
// shifts due to UTC conversion (a classic off-by-one in email send dates).

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "Mon, Sep 7" */
export function formatCardDate(ymd: string): string {
  const dt = parseLocal(ymd);
  return `${WEEKDAYS[dt.getDay()]}, ${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
}

/** A typographic date lockup: { weekday: "Sat", day: "05", month: "Sep" }. */
export function cardDateParts(ymd: string): {
  weekday: string;
  day: string;
  month: string;
} {
  const dt = parseLocal(ymd);
  return {
    weekday: WEEKDAYS[dt.getDay()],
    day: String(dt.getDate()).padStart(2, "0"),
    month: MONTHS[dt.getMonth()],
  };
}

/** "September 2026" from a 'YYYY-MM' month key. */
export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const full = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${full[m - 1]} ${y}`;
}
