import { seedEmails, seedMonth } from "@/lib/seed";
import { formatMonthLabel } from "@/lib/dates";
import { EmailCard } from "./components/EmailCard";
import { HeaderUser } from "./components/HeaderUser";
import { requireUser, authEnabled } from "@/lib/auth";

export default async function ThisMonthPage() {
  await requireUser();
  const emails = [...seedEmails].sort((a, b) =>
    a.send_date.localeCompare(b.send_date),
  );

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-panel">
      {/* Top bar */}
      <header className="flex items-start justify-between bg-navy px-5 pt-5 pb-4 text-white">
        <div>
          <p className="font-serif text-[11px] italic tracking-wide text-gold">
            Make Your Mark Legacy Team
          </p>
          <h1 className="font-serif text-xl leading-tight">Dusty Email Hub</h1>
        </div>
        {authEnabled && <HeaderUser />}
      </header>

      {/* Month heading */}
      <div className="px-5 pt-6 pb-2">
        <p className="font-serif text-sm italic text-gold">This month</p>
        <div className="mt-0.5 h-px w-10 bg-gold" />
        <h2 className="mt-2 font-serif text-2xl text-navy">
          {formatMonthLabel(seedMonth)}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {emails.length} emails planned
        </p>
      </div>

      {/* Cards */}
      <main className="space-y-3 px-4 pt-2 pb-10">
        {emails.map((email) => (
          <EmailCard key={email.id} email={email} />
        ))}
      </main>
    </div>
  );
}
