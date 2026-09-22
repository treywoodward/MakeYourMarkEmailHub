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
      <header className="bg-navy px-5 py-3 text-white">
        <Link href="/" className="text-sm text-gold">
          ‹ This month
        </Link>
      </header>

      {/* Subject + preview text */}
      <div className="border-b border-hairline bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-serif text-[13px] italic text-gold">
            {typeLabel[email.type]} · {formatCardDate(email.sendDate)}
          </p>
          <StatusPill status={email.status} />
        </div>
        <h1 className="mt-1 font-serif text-xl leading-snug text-navy">
          {email.subject}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{email.previewText}</p>
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
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-hairline bg-white text-center">
              <p className="max-w-[260px] text-sm text-slate-500">
                A live preview appears here once this email has copy. Listing,
                market pulse, education, and holiday types are all supported.
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
      <ReviewBar emailId={email.id} status={email.status} dbEnabled={isDbConfigured} />
    </div>
  );
}
