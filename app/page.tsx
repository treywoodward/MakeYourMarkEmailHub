import Link from "next/link";
import { seedMonth } from "@/lib/seed";
import { formatMonthLabel } from "@/lib/dates";
import { EmailCard } from "./components/EmailCard";
import { NotificationsToggle } from "./components/NotificationsToggle";
import { AppShell } from "./components/AppShell";
import { DraftsPanel } from "./components/DraftsPanel";
import { PendingListingsPanel } from "./components/PendingListingsPanel";
import { MaterialsPanel } from "./components/MaterialsPanel";
import { TestNotificationButton } from "./components/TestNotificationButton";
import { requireUser } from "@/lib/auth";
import { listMonthEmails, emailsAwaitingReview } from "@/lib/data/emails";
import { pendingListings } from "@/lib/data/listings";
import { pendingMaterials } from "@/lib/data/materials";
import { listDrafts } from "@/lib/ghl";

export const dynamic = "force-dynamic";

export default async function ThisMonthPage() {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const emails = await listMonthEmails(seedMonth);
  const drafts = isAdmin ? await listDrafts() : [];
  const awaiting = await emailsAwaitingReview();
  const pending = isAdmin ? await pendingListings() : [];
  const materials = isAdmin ? await pendingMaterials() : [];
  const needsReview = emails.filter(
    (e) => e.status === "in_review" || e.status === "changes_requested",
  ).length;

  return (
    <AppShell user={user} active="month">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 lg:px-10 lg:pt-12">
        {/* Masthead */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="h-px w-9 bg-gold" />
            <h1 className="mt-3 font-serif text-4xl leading-none text-navy tnums lg:text-5xl">
              {formatMonthLabel(seedMonth)}
            </h1>
            <p className="mt-3 text-sm text-ink-2">
              <span className="tnums font-medium text-ink">{emails.length}</span>{" "}
              emails this month
              {needsReview > 0 && (
                <>
                  {" · "}
                  <span className="font-medium text-gold-ink">
                    {needsReview} need{needsReview === 1 ? "s" : ""} your review
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Mobile-only quick actions (the sidebar has these on desktop) */}
        <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
          <Link
            href="/submit"
            className="rounded-full bg-navy px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-navy-700"
          >
            Submit a listing
          </Link>
          <Link
            href="/materials"
            className="rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:border-navy/30 hover:text-ink"
          >
            Send market data
          </Link>
        </div>

        {/* Mobile-only push prompt */}
        <div className="mt-3 lg:hidden">
          <NotificationsToggle />
        </div>

        <div className="mt-5">
          <TestNotificationButton />
        </div>

        {isAdmin && <PendingListingsPanel count={pending.length} />}

        {isAdmin && <MaterialsPanel materials={materials} />}

        {/* Awaiting review (any month) */}
        {awaiting.length > 0 && (
          <section className="mt-9">
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-xl text-navy">Awaiting your review</h2>
              <span className="text-xs text-gold-ink tnums">{awaiting.length}</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {awaiting.map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
            </div>
          </section>
        )}

        {/* Emails */}
        <div className="mt-7">
          {emails.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hairline bg-surface px-6 py-16 text-center">
              <p className="font-serif text-lg text-navy">Nothing planned yet</p>
              <p className="mx-auto mt-1.5 max-w-[240px] text-sm text-ink-2">
                The month&rsquo;s emails appear here as they are scheduled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {emails.map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
            </div>
          )}
        </div>

        {user.role === "admin" && <DraftsPanel drafts={drafts} />}
      </div>
    </AppShell>
  );
}
