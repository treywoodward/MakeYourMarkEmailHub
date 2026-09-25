"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buildContentNow } from "@/app/home-actions";
import type { Material } from "@/lib/data/materials";

const LABEL: Record<string, string> = {
  marketPulse: "Market Pulse",
  education: "Education email",
};

/**
 * Admin-only: materials Dusty uploaded, grouped by target email, each with a
 * "Build it" button that has Claude draft the email from them.
 */
export function MaterialsPanel({ materials }: { materials: Material[] }) {
  if (materials.length === 0) return null;

  const groups = new Map<string, Material[]>();
  for (const m of materials) {
    const key = m.targetType;
    groups.set(key, [...(groups.get(key) ?? []), m]);
  }

  return (
    <section className="mt-9">
      <h2 className="font-serif text-xl text-navy">Materials from Dusty</h2>
      <p className="mt-1 text-sm text-ink-2">
        Uploads waiting to become an email. Build one and Claude drafts it from
        the notes, screenshots, and PDFs.
      </p>
      <div className="mt-4 space-y-3">
        {[...groups.entries()].map(([type, items]) => (
          <MaterialGroup key={type} type={type} items={items} />
        ))}
      </div>
    </section>
  );
}

function MaterialGroup({ type, items }: { type: string; items: Material[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const fileCount = items.reduce((n, m) => n + m.files.length, 0);
  const noteCount = items.filter((m) => m.note).length;

  function build() {
    start(async () => {
      setMsg(null);
      const res = await buildContentNow(type as "marketPulse" | "education");
      if ("error" in res) setMsg(res.error);
      else if (res.status === "built") router.push(`/emails/${res.emailId}`);
      else if (res.status === "none") setMsg("Nothing to build.");
      else setMsg(res.message);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-ink">
          {LABEL[type] ?? type}
        </p>
        <p className="mt-0.5 text-xs text-ink-3 tnums">
          {items.length} upload{items.length === 1 ? "" : "s"}
          {fileCount > 0 && ` · ${fileCount} file${fileCount === 1 ? "" : "s"}`}
          {noteCount > 0 && ` · ${noteCount} note${noteCount === 1 ? "" : "s"}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {msg && <span className="text-xs text-ink-3">{msg}</span>}
        <button
          onClick={build}
          disabled={pending}
          className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50"
        >
          {pending ? "Writing the email…" : "Build it"}
        </button>
      </div>
    </div>
  );
}
