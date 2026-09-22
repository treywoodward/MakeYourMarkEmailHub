import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listListings } from "@/lib/data/listings";
import { BackHeader } from "@/app/components/BackHeader";
import { ListingCard } from "@/app/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  await requireUser();
  const listings = await listListings();

  return (
    <div className="mx-auto min-h-dvh max-w-[520px] bg-panel pb-12">
      <BackHeader href="/" label="This month" />

      <div className="flex items-end justify-between gap-3 px-5 pt-8 pb-5">
        <div>
          <div className="h-px w-9 bg-gold" />
          <h1 className="mt-3 font-serif text-3xl leading-tight text-navy">
            Listings
          </h1>
        </div>
        <Link
          href="/submit"
          className="shrink-0 rounded-xl bg-navy px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          Submit
        </Link>
      </div>

      <main className="space-y-3 px-4">
        {listings.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-hairline bg-surface px-6 py-14 text-center">
            <p className="font-serif text-lg text-navy">No listings yet</p>
            <p className="mx-auto mt-1.5 max-w-[260px] text-sm text-ink-2">
              Submit one with a flexmls screenshot and photos, and Claude reads
              the details.
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-block rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white"
            >
              Submit a listing
            </Link>
          </div>
        ) : (
          listings.map((l) => <ListingCard key={l.id} listing={l} />)
        )}
      </main>
    </div>
  );
}
