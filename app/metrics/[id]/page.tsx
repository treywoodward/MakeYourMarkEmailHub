import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppShell } from "@/app/components/AppShell";
import { EmailPreview } from "@/app/components/EmailPreview";
import { getCampaign, getCampaignHtml } from "@/lib/ghl";

export const dynamic = "force-dynamic";

function pct(n: number | null): string {
  return n == null ? "—" : `${Math.round(n * 100)}%`;
}
function num(n: number): string {
  return n.toLocaleString("en-US");
}
function sentDate(ms: number | null): string {
  if (!ms) return "Not sent";
  return new Date(ms).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CampaignDetailPage({
  params,
}: PageProps<"/metrics/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const html = campaign.htmlUrl ? await getCampaignHtml(campaign.htmlUrl) : null;

  const stats = [
    { label: "Recipients", value: num(campaign.recipients) },
    { label: "Delivered", value: num(campaign.delivered) },
    { label: "Failed", value: num(campaign.failed) },
    { label: "Delivery", value: pct(campaign.deliveryRate) },
  ];

  return (
    <AppShell user={user} active="metrics">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 lg:px-10 lg:pt-10">
        <Link
          href="/metrics"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-3 transition hover:text-navy"
        >
          <span aria-hidden className="text-base leading-none">
            ‹
          </span>
          Metrics
        </Link>

        {/* Header */}
        <div className="mt-4 border-b border-hairline pb-6">
          <p className="text-[13px] text-ink-3 tnums">
            {sentDate(campaign.sentAt)}
          </p>
          <h1 className="mt-1 max-w-3xl font-serif text-3xl leading-tight text-ink lg:text-4xl">
            {campaign.name}
          </h1>
          {campaign.subject && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">
              <span className="text-ink-3">Subject: </span>
              {campaign.subject}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-hairline bg-surface px-4 py-4"
            >
              <p className="font-serif text-3xl text-navy tnums">{s.value}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-3">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Rendered email */}
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
            The email that was sent
          </p>
          {html ? (
            <EmailPreview html={html} />
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-hairline bg-surface px-6 py-12 text-center">
              <p className="max-w-[320px] text-sm leading-relaxed text-ink-2">
                The sent HTML for this campaign could not be loaded from
                GoHighLevel.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
