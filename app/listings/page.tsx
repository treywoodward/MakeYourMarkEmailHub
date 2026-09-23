import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listListings } from "@/lib/data/listings";
import { AppShell } from "@/app/components/AppShell";
import { ListingCard } from "@/app/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const user = await requireUser();
  const listings = await listListings();

  return (
    <AppShell user={user} active="listings">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 lg:px-10 lg:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="h-px w-9 bg-gold" />
            <h1 className="mt-3 font-serif text-4xl leading-tight text-navy lg:text-5xl">
              Listings
            </h1>
          </div>
          <Link
            href="/submit"
            className="shrink-0 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            Submit a listing
          </Link>
        </div>

        <div className="mt-7">
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hairline bg-surface px-6 py-16 text-center">
              <p className="font-serif text-lg text-navy">No listings yet</p>
              <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-ink-2">
                Submit one with a flexmls screenshot and photos, and the details
                are read for you.
              </p>
              <Link
                href="/submit"
                className="mt-4 inline-block rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Submit a listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
