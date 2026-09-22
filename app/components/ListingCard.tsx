import Link from "next/link";
import type { ListingSummary } from "@/lib/data/listings";
import type { ListingState } from "@/lib/types";

const stateLabel: Record<ListingState, string> = {
  processing: "Processing",
  ready: "Ready",
  needs_attention: "Needs attention",
};
const stateDot: Record<ListingState, string> = {
  processing: "bg-navy/40",
  ready: "bg-emerald-600",
  needs_attention: "bg-amber-500",
};
const stateText: Partial<Record<ListingState, string>> = {
  needs_attention: "text-amber-700",
};

export function money(n: number | null): string | null {
  return n == null ? null : `$${n.toLocaleString("en-US")}`;
}

export function ListingCard({ listing }: { listing: ListingSummary }) {
  const price = money(listing.price);
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex gap-4 rounded-2xl border border-hairline bg-surface p-3 shadow-[0_1px_2px_rgba(28,29,51,0.04),0_8px_24px_-16px_rgba(28,29,51,0.25)] transition duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-navy/20"
    >
      <div className="aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-xl bg-raise">
        {listing.heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.heroUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-faint">
            {listing.address?.[0] ?? "?"}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span className={`h-1.5 w-1.5 rounded-full ${stateDot[listing.state]}`} />
          <span className={stateText[listing.state] ?? "text-ink-3"}>
            {stateLabel[listing.state]}
          </span>
        </span>
        <h3 className="mt-1 truncate font-serif text-lg text-ink group-hover:text-navy">
          {listing.address ?? "Untitled listing"}
        </h3>
        <p className="mt-0.5 text-sm text-ink-2 tnums">
          {[listing.city, price].filter(Boolean).join(" · ") || "Details pending"}
        </p>
      </div>
    </Link>
  );
}
