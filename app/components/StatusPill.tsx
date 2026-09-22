import type { EmailStatus } from "@/lib/types";
import { statusLabel, statusPill } from "@/lib/labels";

export function StatusPill({ status }: { status: EmailStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${statusPill[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}
