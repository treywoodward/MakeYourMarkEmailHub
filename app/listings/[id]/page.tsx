import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getListing } from "@/lib/data/listings";
import { BackHeader } from "@/app/components/BackHeader";
import { money } from "@/app/components/ListingCard";

export const dynamic = "force-dynamic";

function flagNotes(flags: Record<string, unknown>): string[] {
  const notes: string[] = [];
  if (flags.truncated)
    notes.push(
      "The description was cut off in the screenshot. Check the full remarks before using it.",
    );
  if (flags.contingency)
    notes.push("Status is contingent. Decide whether to feature it.");
  if (flags.portraitPhotos)
    notes.push(
      `${flags.portraitPhotos} portrait photo(s) were flagged and left out of grids.`,
    );
  return notes;
}

export default async function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  await requireUser();
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const stats = [
    listing.beds && { value: listing.beds, label: "Beds" },
    listing.baths && { value: listing.baths, label: "Baths" },
    listing.sqft && { value: listing.sqft.toLocaleString("en-US"), label: "Sq Ft" },
    listing.acres && { value: listing.acres, label: "Acres" },
  ].filter(Boolean) as { value: string; label: string }[];

  const gallery = listing.photos.filter((p) => !p.excludedReason);
  const notes = flagNotes(listing.flags);

  return (
    <div className="mx-auto min-h-dvh max-w-[560px] bg-panel pb-12">
      <BackHeader href="/listings" label="Listings" />

      <div className="bg-surface px-5 pt-6 pb-6">
        <h1 className="font-serif text-2xl leading-tight text-ink">
          {listing.address ?? "Untitled listing"}
        </h1>
        <p className="mt-1 text-sm text-ink-2 tnums">
          {[listing.neighborhood, listing.city, listing.zip]
            .filter(Boolean)
            .join(", ") || "Location pending"}
        </p>
        {listing.price != null && (
          <p className="mt-2 font-serif text-2xl text-gold-ink tnums">
            {money(listing.price)}
          </p>
        )}
        {(listing.statusText || listing.mlsNumber) && (
          <p className="mt-2 text-xs uppercase tracking-wide text-ink-3">
            {[listing.mlsNumber && `MLS #${listing.mlsNumber}`, listing.statusText]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      {notes.length > 0 && (
        <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Needs attention
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-amber-900">
            {notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {stats.length > 0 && (
        <div className="mx-4 mt-4 flex divide-x divide-hairline rounded-2xl border border-hairline bg-surface">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 px-3 py-4 text-center">
              <p className="font-serif text-xl text-navy tnums">{s.value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {listing.descriptionRaw && (
        <div className="mx-4 mt-4 rounded-2xl border border-hairline bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
            Description
          </p>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
            {listing.descriptionRaw}
          </p>
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mx-4 mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
            Photos
          </p>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((p, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-lg border border-hairline"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {listing.screenshotUrl && (
        <div className="mx-4 mt-4">
          <a
            href={listing.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-navy underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
          >
            View the original screenshot
          </a>
        </div>
      )}
    </div>
  );
}
