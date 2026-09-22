import Link from "next/link";
import { notFound } from "next/navigation";
import { seedEmails } from "@/lib/seed";
import { typeLabel } from "@/lib/labels";
import { formatCardDate } from "@/lib/dates";
import { StatusPill } from "@/app/components/StatusPill";

// Next.js 16: params is async.
export default async function EmailDetailPage({
  params,
}: PageProps<"/emails/[id]">) {
  const { id } = await params;
  const email = seedEmails.find((e) => e.id === id);
  if (!email) notFound();

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-panel">
      {/* Top bar */}
      <header className="bg-navy px-5 py-3 text-white">
        <Link href="/" className="text-sm text-gold">
          ‹ This month
        </Link>
      </header>

      {/* Subject + preview text */}
      <div className="border-b border-hairline bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-serif text-[13px] italic text-gold">
            {typeLabel[email.type]} · {formatCardDate(email.send_date)}
          </p>
          <StatusPill status={email.status} />
        </div>
        <h1 className="mt-1 font-serif text-xl leading-snug text-navy">
          {email.subject}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{email.preview_text}</p>
      </div>

      {/* Preview placeholder (the sandboxed iframe goes here once render
          functions and reference templates are wired up). */}
      <main className="flex-1 px-4 py-5">
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-hairline bg-white text-center">
          <p className="max-w-[240px] text-sm text-slate-500">
            Live email preview appears here once the render functions and
            reference templates are added.
          </p>
        </div>
      </main>

      {/* Sticky approve / request-changes bar (screen 2). Disabled in the
          skeleton until the review flow is built in Phase 2. */}
      <div className="sticky bottom-0 border-t border-hairline bg-white px-4 py-3">
        <div className="flex gap-3">
          <button
            disabled
            className="flex-1 rounded-lg bg-navy py-3 text-sm font-medium text-white opacity-50"
          >
            Approve
          </button>
          <button
            disabled
            className="flex-1 rounded-lg border border-navy py-3 text-sm font-medium text-navy opacity-50"
          >
            Request changes
          </button>
        </div>
      </div>
    </div>
  );
}
