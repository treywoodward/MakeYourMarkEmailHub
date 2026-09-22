import Link from "next/link";
import type { EmailListItem } from "@/lib/data/emails";
import { typeLabel } from "@/lib/labels";
import { cardDateParts } from "@/lib/dates";
import { StatusPill } from "./StatusPill";

export function EmailCard({ email }: { email: EmailListItem }) {
  const { weekday, day, month } = cardDateParts(email.sendDate);

  return (
    <Link
      href={`/emails/${email.id}`}
      className="group block rounded-2xl border border-hairline bg-surface shadow-[0_1px_2px_rgba(28,29,51,0.04),0_8px_24px_-16px_rgba(28,29,51,0.25)] transition duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-[0_2px_4px_rgba(28,29,51,0.05),0_16px_36px_-18px_rgba(28,29,51,0.35)] focus-visible:outline-none"
    >
      <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        {/* Typographic date lockup — the send date, not a boxed icon. */}
        <div className="flex w-11 shrink-0 flex-col items-center pt-0.5 text-center tnums">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-ink">
            {weekday}
          </span>
          <span className="font-serif text-3xl leading-none text-navy">{day}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3">
            {month}
          </span>
        </div>

        {/* Hairline divider */}
        <div className="w-px shrink-0 self-stretch bg-hairline" />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-[13px] italic text-gold-ink">
              {typeLabel[email.type]}
            </p>
            <StatusPill status={email.status} />
          </div>
          <h3 className="mt-1 font-serif text-lg leading-snug text-ink transition-colors group-hover:text-navy">
            {email.subject}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">
            {email.previewText}
          </p>
        </div>
      </div>
    </Link>
  );
}
