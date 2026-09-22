import type { EmailStatus } from "@/lib/types";
import { statusLabel, statusDot, statusEmphasis } from "@/lib/labels";

export function StatusPill({ status }: { status: EmailStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[status]}`} />
      <span className={statusEmphasis[status] ?? "text-ink-3"}>
        {statusLabel[status]}
      </span>
    </span>
  );
}
