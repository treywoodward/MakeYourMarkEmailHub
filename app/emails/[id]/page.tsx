import Link from "next/link";
import { notFound } from "next/navigation";
import { typeLabel } from "@/lib/labels";
import { formatCardDate } from "@/lib/dates";
import { StatusPill } from "@/app/components/StatusPill";
import { EmailPreview } from "@/app/components/EmailPreview";
import { CommentThread } from "@/app/components/CommentThread";
import { ReviewBar } from "@/app/components/ReviewBar";
import { GeneratePanel } from "@/app/components/GeneratePanel";
import { tryRenderEmail } from "@/lib/email/render";
import { requireUser } from "@/lib/auth";
import { getEmailDetail } from "@/lib/data/emails";
import { isDbConfigured } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai/anthropic";

// Auth-gated and per-request DB reads: never statically prerender.
export const dynamic = "force-dynamic";
// Generation with Claude can take a while; give the server action room.
export const maxDuration = 60;

// Next.js 16: params is async.
export default async function EmailDetailPage({
  params,
}: PageProps<"/emails/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const email = await getEmailDetail(id);
  if (!email) notFound();

  const html = email.copy ? tryRenderEmail(email.copy, email.photos) : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[680px] flex-col bg-panel">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-deep-navy px-5 py-3 backdrop-blur">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/70 transition hover:text-gold"
        >
          <span aria-hidden className="text-base leading-none">
            ‹
          </span>
          This month
        </Link>
      </header>

      {/* Subject + preview text */}
      <div className="border-b border-hairline bg-surface px-5 pt-5 pb-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink-3">
            <span className="font-serif italic text-gold-ink">
              {typeLabel[email.type]}
            </span>
            <span className="mx-1.5 text-faint">·</span>
            <span className="tnums">{formatCardDate(email.sendDate)}</span>
          </p>
          <StatusPill status={email.status} />
        </div>
        <h1 className="mt-2 font-serif text-2xl leading-tight text-ink">
          {email.subject}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
          {email.previewText}
        </p>
      </div>

      <main className="flex-1">
        {/* Admin: generate the copy with Claude. */}
        {user.role === "admin" && (
          <div className="pt-4">
            <GeneratePanel
              emailId={email.id}
              aiEnabled={isAiConfigured}
              hasCopy={Boolean(email.copy)}
            />
          </div>
        )}

        {/* Live email preview (or a placeholder before it has copy). */}
        <div className="px-4 py-5">
          {html ? (
            <EmailPreview html={html} />
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface px-6 py-12 text-center">
              <p className="max-w-[280px] text-sm leading-relaxed text-ink-2">
                A live preview appears here once this email has copy.
                {user.role === "admin"
                  ? " Write a brief above and generate it."
                  : " Trey is preparing it."}
              </p>
            </div>
          )}
        </div>

        {/* Comment thread */}
        <CommentThread
          emailId={email.id}
          comments={email.comments}
          dbEnabled={isDbConfigured}
        />
      </main>

      {/* Sticky approve / request-changes bar */}
      <ReviewBar
        emailId={email.id}
        status={email.status}
        dbEnabled={isDbConfigured}
      />
    </div>
  );
}
