import Link from "next/link";
import type { SeedEmail } from "@/lib/seed";
import { typeLabel } from "@/lib/labels";
import { formatCardDate } from "@/lib/dates";
import { StatusPill } from "./StatusPill";

export function EmailCard({ email }: { email: SeedEmail }) {
  const day = Number(email.send_date.split("-")[2]);

  return (
    <Link
      href={`/emails/${email.id}`}
      className="block rounded-xl border border-hairline bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail tile: deep navy with an oversized faint day numeral. */}
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-deep-navy">
          <span
            className="font-serif text-5xl leading-none text-faint/25 select-none"
            aria-hidden
          >
            {day}
          </span>
          <span className="absolute bottom-1 left-0 right-0 text-center font-serif text-[10px] tracking-wide text-gold">
            {typeLabel[email.type]}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-slate-500">{formatCardDate(email.send_date)}</p>
            <StatusPill status={email.status} />
          </div>
          <p className="mt-1 font-serif text-[13px] italic text-gold">
            {typeLabel[email.type]}
          </p>
          <h3 className="mt-0.5 font-serif text-lg leading-snug text-navy">
            {email.subject}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
            {email.preview_text}
          </p>
        </div>
      </div>
    </Link>
  );
}
