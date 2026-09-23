import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppShell } from "@/app/components/AppShell";
import { EmailPreview } from "@/app/components/EmailPreview";
import { NotifyDustyButton } from "@/app/components/NotifyDustyButton";
import { getDraft, getCampaignHtml } from "@/lib/ghl";

export const dynamic = "force-dynamic";

export default async function DraftPage({ params }: PageProps<"/drafts/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) notFound();

  const html = draft.htmlUrl ? await getCampaignHtml(draft.htmlUrl) : null;

  return (
    <AppShell user={user} active="month">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 lg:px-10 lg:pt-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-3 transition hover:text-navy"
        >
          <span aria-hidden className="text-base leading-none">
            ‹
          </span>
          This month
        </Link>

        <div className="mt-4 border-b border-hairline pb-6">
          <p className="font-serif text-[13px] italic text-gold-ink">
            Draft in GoHighLevel
          </p>
          <h1 className="mt-1 max-w-3xl font-serif text-3xl leading-tight text-ink lg:text-4xl">
            {draft.name}
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            {user.role === "admin"
              ? "Not sent yet. Preview it, then let Dusty know it is ready to review."
              : "Not sent yet. Have a look and let Trey know what you think."}
          </p>
          {user.role === "admin" && (
            <div className="mt-4">
              <NotifyDustyButton draftId={draft.id} size="lg" />
            </div>
          )}
        </div>

        <div className="mt-6">
          {html ? (
            <EmailPreview html={html} />
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface px-6 py-12 text-center">
              <p className="max-w-[320px] text-sm leading-relaxed text-ink-2">
                This draft has no preview available from GoHighLevel yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
