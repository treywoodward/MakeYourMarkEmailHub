import { seedMonth } from "@/lib/seed";
import { formatMonthLabel } from "@/lib/dates";
import { EmailCard } from "./components/EmailCard";
import { HeaderUser } from "./components/HeaderUser";
import { requireUser, authEnabled } from "@/lib/auth";
import { listMonthEmails } from "@/lib/data/emails";

export const dynamic = "force-dynamic";

export default async function ThisMonthPage() {
  const user = await requireUser();
  const emails = await listMonthEmails(seedMonth);
  const needsReview = emails.filter(
    (e) => e.status === "in_review" || e.status === "changes_requested",
  ).length;

  return (
    <div className="mx-auto min-h-dvh max-w-[520px] bg-panel">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-deep-navy px-5 py-3.5 text-white/95 backdrop-blur">
        <div className="leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
            Make Your Mark Legacy Team
          </p>
          <p className="font-serif text-base tracking-tight">Email Hub</p>
        </div>
        {authEnabled && <HeaderUser name={user.name ?? "Signed in"} />}
      </header>

      {/* Masthead */}
      <div className="px-5 pt-8 pb-5">
        <div className="h-px w-9 bg-gold" />
        <h1 className="mt-3 font-serif text-4xl leading-none text-navy tnums">
          {formatMonthLabel(seedMonth)}
        </h1>
        <p className="mt-2.5 text-sm text-ink-2">
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

      {/* List */}
      <main className="space-y-3 px-4 pb-12">
        {emails.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-hairline bg-surface px-6 py-14 text-center">
            <p className="font-serif text-lg text-navy">Nothing planned yet</p>
            <p className="mx-auto mt-1.5 max-w-[240px] text-sm text-ink-2">
              The month&rsquo;s emails appear here as they are scheduled.
            </p>
          </div>
        ) : (
          emails.map((email) => <EmailCard key={email.id} email={email} />)
        )}
      </main>
    </div>
  );
}
