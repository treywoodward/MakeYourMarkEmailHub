import { seedMonth } from "@/lib/seed";
import { formatMonthLabel } from "@/lib/dates";
import { EmailCard } from "./components/EmailCard";
import { NotificationsToggle } from "./components/NotificationsToggle";
import { AppShell } from "./components/AppShell";
import { DraftsPanel } from "./components/DraftsPanel";
import { requireUser } from "@/lib/auth";
import { listMonthEmails } from "@/lib/data/emails";
import { listDrafts } from "@/lib/ghl";

export const dynamic = "force-dynamic";

export default async function ThisMonthPage() {
  const user = await requireUser();
  const emails = await listMonthEmails(seedMonth);
  const drafts = user.role === "admin" ? await listDrafts() : [];
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

        {/* Mobile-only push prompt */}
        <div className="mt-5 lg:hidden">
          <NotificationsToggle />
        </div>

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
