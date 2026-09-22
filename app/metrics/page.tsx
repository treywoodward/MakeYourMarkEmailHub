import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatMonthLabel } from "@/lib/dates";
import { AppShell } from "@/app/components/AppShell";
import { listCampaigns, isGhlConfigured, type Campaign } from "@/lib/ghl";

export const dynamic = "force-dynamic";

function pct(n: number | null): string {
  return n == null ? "—" : `${Math.round(n * 100)}%`;
}
function num(n: number): string {
  return n.toLocaleString("en-US");
}
function sentDate(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "YYYY-MM" bucket for a campaign, or "undated". campaigns arrive newest-first. */
function monthKey(ms: number | null): string {
  if (!ms) return "undated";
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function groupByMonth(campaigns: Campaign[]): { key: string; items: Campaign[] }[] {
  const groups: { key: string; items: Campaign[] }[] = [];
  for (const c of campaigns) {
    const key = monthKey(c.sentAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(c);
    else groups.push({ key, items: [c] });
  }
  return groups;
}

export default async function MetricsPage() {
  const user = await requireUser();
  const campaigns = isGhlConfigured ? await listCampaigns() : [];

  const totalRecipients = campaigns.reduce((s, c) => s + c.recipients, 0);
  const totalDelivered = campaigns.reduce((s, c) => s + c.delivered, 0);

  // Headline rate reflects CURRENT deliverability: the median of the 12 most
  // recent campaigns. An all-time figure would be dragged down by early sends
  // to a bad list (~31% delivery) that no longer reflects the cleaned list
  // (recent campaigns ~97%). campaigns is already sorted newest-first.
  const recentRates = campaigns
    .slice(0, 12)
    .map((c) => c.deliveryRate)
    .filter((r): r is number => r != null)
    .sort((a, b) => a - b);
  const recentDelivery =
    recentRates.length === 0
      ? null
      : recentRates.length % 2
        ? recentRates[(recentRates.length - 1) / 2]
        : (recentRates[recentRates.length / 2 - 1] +
            recentRates[recentRates.length / 2]) /
          2;

  const summary = [
    { label: "Campaigns", value: num(campaigns.length) },
    { label: "Recipients", value: num(totalRecipients) },
    { label: "Delivered", value: num(totalDelivered) },
    { label: "Recent delivery", value: pct(recentDelivery) },
  ];

  const groups = groupByMonth(campaigns);

  return (
    <AppShell user={user} active="metrics">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 lg:px-10 lg:pt-12">
        <div className="h-px w-9 bg-gold" />
        <h1 className="mt-3 font-serif text-4xl leading-tight text-navy lg:text-5xl">
          Campaign metrics
        </h1>
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Every email sent through GoHighLevel, newest first. Delivery is live.
          Open and unsubscribe rates unlock once the GHL integration&rsquo;s
          statistics scope reaches the token.
        </p>

        {!isGhlConfigured ? (
          <div className="mt-8 rounded-2xl border border-hairline bg-surface p-6 text-sm text-ink-2">
            Connect <span className="font-medium text-ink">GoHighLevel</span> to
            see campaign metrics. Add{" "}
            <code className="text-gold-ink">GHL_PRIVATE_TOKEN</code> and{" "}
            <code className="text-gold-ink">GHL_LOCATION_ID</code> from
            Dusty&rsquo;s sub-account.
          </div>
        ) : campaigns.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-hairline bg-surface px-6 py-16 text-center">
            <p className="font-serif text-lg text-navy">No campaigns yet</p>
            <p className="mx-auto mt-1.5 max-w-[280px] text-sm text-ink-2">
              Sent campaigns from GoHighLevel will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Summary tiles */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {summary.map((s) => (
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

            {/* Month groups: newest expanded, older collapsed into banners. */}
            <div className="mt-8 space-y-3">
              {groups.map((g, i) => (
                <MonthGroup key={g.key} group={g} defaultOpen={i === 0} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function MonthGroup({
  group,
  defaultOpen,
}: {
  group: { key: string; items: Campaign[] };
  defaultOpen: boolean;
}) {
  const label =
    group.key === "undated" ? "Undated" : formatMonthLabel(group.key);
  const delivered = group.items.reduce((s, c) => s + c.delivered, 0);

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-hairline bg-surface"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition hover:bg-raise [&::-webkit-details-marker]:hidden">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-lg text-navy">{label}</span>
          <span className="text-xs text-ink-3 tnums">
            {group.items.length} campaign{group.items.length === 1 ? "" : "s"}
            {" · "}
            {num(delivered)} delivered
          </span>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <div className="border-t border-hairline">
        {/* Desktop table */}
        <table className="hidden w-full text-sm lg:table">
          <thead>
            <tr className="border-b border-hairline text-left text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              <th className="px-5 py-3 font-semibold">Campaign</th>
              <th className="px-4 py-3 font-semibold">Sent</th>
              <th className="px-4 py-3 text-right font-semibold">Recipients</th>
              <th className="px-4 py-3 text-right font-semibold">Delivered</th>
              <th className="px-4 py-3 text-right font-semibold">Failed</th>
              <th className="px-5 py-3 text-right font-semibold">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {group.items.map((c) => (
              <tr
                key={c.id}
                className="border-b border-hairline last:border-0 transition hover:bg-raise"
              >
                <td className="max-w-sm px-5 py-3.5">
                  <Link
                    href={`/metrics/${c.id}`}
                    className="block truncate font-medium text-ink transition hover:text-navy"
                  >
                    {c.name}
                  </Link>
                  <p className="truncate text-xs text-ink-3">{c.subject}</p>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-ink-2 tnums">
                  {sentDate(c.sentAt)}
                </td>
                <td className="px-4 py-3.5 text-right text-ink-2 tnums">
                  {num(c.recipients)}
                </td>
                <td className="px-4 py-3.5 text-right text-ink-2 tnums">
                  {num(c.delivered)}
                </td>
                <td className="px-4 py-3.5 text-right tnums">
                  <span className={c.failed > 0 ? "text-amber-700" : "text-ink-3"}>
                    {num(c.failed)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-medium text-navy tnums">
                  {pct(c.deliveryRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 lg:hidden">
          {group.items.map((c) => (
            <MetricCard key={c.id} c={c} />
          ))}
        </div>
      </div>
    </details>
  );
}

function MetricCard({ c }: { c: Campaign }) {
  const cells = [
    { label: "Recipients", value: num(c.recipients) },
    { label: "Delivered", value: num(c.delivered) },
    { label: "Delivery", value: pct(c.deliveryRate) },
  ];
  return (
    <Link
      href={`/metrics/${c.id}`}
      className="block rounded-2xl border border-hairline bg-raise p-4 transition hover:border-navy/20"
    >
      <p className="font-serif text-base leading-snug text-ink">{c.name}</p>
      <p className="mt-0.5 line-clamp-1 text-xs text-ink-3">{c.subject}</p>
      <p className="mt-1 text-xs text-ink-3 tnums">{sentDate(c.sentAt)}</p>
      <div className="mt-3 flex divide-x divide-hairline rounded-xl border border-hairline bg-surface">
        {cells.map((cell) => (
          <div key={cell.label} className="flex-1 px-2 py-2.5 text-center">
            <p className="font-serif text-lg text-navy tnums">{cell.value}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-3">
              {cell.label}
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}
