import Link from "next/link";
import { notFound } from "next/navigation";
import { typeLabel } from "@/lib/labels";
import { formatCardDate } from "@/lib/dates";
import { StatusPill } from "@/app/components/StatusPill";
import { EmailPreview } from "@/app/components/EmailPreview";
import { CommentThread } from "@/app/components/CommentThread";
import { ReviewBar } from "@/app/components/ReviewBar";
import { GeneratePanel } from "@/app/components/GeneratePanel";
import { AppShell } from "@/app/components/AppShell";
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

  const preview = html ? (
    <EmailPreview html={html} />
  ) : (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface px-6 py-12 text-center">
      <p className="max-w-[280px] text-sm leading-relaxed text-ink-2">
        A live preview appears here once this email has copy.
        {user.role === "admin"
          ? " Write a brief and generate it."
          : " Trey is preparing it."}
      </p>
    </div>
  );

  return (
    <AppShell user={user} active="month">
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-6 lg:px-10 lg:pb-16 lg:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-3 transition hover:text-navy"
        >
          <span aria-hidden className="text-base leading-none">
            ‹
          </span>
          This month
        </Link>

        {/* Subject header */}
        <div className="mt-4 border-b border-hairline pb-6">
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
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-ink lg:text-4xl">
            {email.subject}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
            {email.previewText}
          </p>
        </div>

        {/* Two columns on desktop: preview + action rail. */}
        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <div className="min-w-0">{preview}</div>

          <aside className="mt-6 space-y-5 lg:mt-0 lg:sticky lg:top-8 lg:self-start">
            {user.role === "admin" && (
              <GeneratePanel
                emailId={email.id}
                aiEnabled={isAiConfigured}
                hasCopy={Boolean(email.copy)}
              />
            )}

            {/* Desktop review actions live in the rail. */}
            <div className="hidden lg:block">
              <ReviewBar
                emailId={email.id}
                status={email.status}
                dbEnabled={isDbConfigured}
                variant="inline"
              />
            </div>

            <CommentThread
              emailId={email.id}
              comments={email.comments}
              dbEnabled={isDbConfigured}
            />
          </aside>
        </div>
      </div>

      {/* Phone review actions: a sticky bottom bar. */}
      <div className="lg:hidden">
        <ReviewBar
          emailId={email.id}
          status={email.status}
          dbEnabled={isDbConfigured}
        />
      </div>
    </AppShell>
  );
}
