import Link from "next/link";
import type { Draft } from "@/lib/ghl";
import { NotifyDustyButton } from "./NotifyDustyButton";

function updated(ms: number | null): string {
  if (!ms) return "";
  return `Updated ${new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

/**
 * Admin-only: GHL drafts that are not sent yet, newest first. Each can be
 * previewed and handed to Dusty for review with one tap.
 */
export function DraftsPanel({ drafts }: { drafts: Draft[] }) {
  if (drafts.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-baseline gap-3">
        <h2 className="font-serif text-xl text-navy">Drafts in GoHighLevel</h2>
        <span className="text-xs text-ink-3 tnums">
          {drafts.length} not sent
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-2">
        New drafts you build in GoHighLevel show up here. Preview one, then send
        Dusty a note to review it.
      </p>

      <div className="mt-4 space-y-2.5">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <Link
                href={`/drafts/${d.id}`}
                className="font-serif text-base leading-snug text-ink transition hover:text-navy"
              >
                {d.name}
              </Link>
              <p className="mt-0.5 text-xs text-ink-3 tnums">{updated(d.updatedAt)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/drafts/${d.id}`}
                className="text-sm font-medium text-navy underline decoration-gold/50 underline-offset-2 hover:decoration-gold"
              >
                Preview
              </Link>
              <NotifyDustyButton draftId={d.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
