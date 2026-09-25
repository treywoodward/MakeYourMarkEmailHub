"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { submitMaterial, type MaterialTarget } from "./actions";
import { toast } from "@/lib/toast";
import type { MaterialFile } from "@/lib/data/materials";

const dropClass =
  "flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-raise px-4 py-6 text-center transition hover:border-navy/40";

const TARGETS: { value: MaterialTarget; label: string; hint: string }[] = [
  { value: "marketPulse", label: "Market Pulse", hint: "Week 2 — market data" },
  { value: "education", label: "Education", hint: "Week 4 — topic / value" },
];

export function MaterialsForm({ blobEnabled }: { blobEnabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [target, setTarget] = useState<MaterialTarget>("marketPulse");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError(null);
    const arr = Array.from(list);
    setUploading((n) => n + arr.length);
    await Promise.all(
      arr.map(async (file) => {
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          setFiles((prev) => [
            ...prev,
            {
              url: blob.url,
              name: file.name,
              contentType: file.type || "application/octet-stream",
            },
          ]);
        } catch {
          setError("A file failed to upload. Try again.");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  function submit() {
    startTransition(async () => {
      setError(null);
      const res = await submitMaterial({ targetType: target, note, files });
      if (res.error) setError(res.error);
      else {
        toast("Sent to Trey.", "success");
        router.push("/");
      }
    });
  }

  if (!blobEnabled) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface p-5 text-sm text-ink-2">
        Uploads need <span className="font-medium text-ink">Vercel Blob</span>.
        Add <code className="text-gold-ink">BLOB_READ_WRITE_TOKEN</code>.
      </div>
    );
  }

  const busy = pending || uploading > 0;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
          What is this for?
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTarget(t.value)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                target === t.value
                  ? "border-navy bg-navy/[0.04]"
                  : "border-hairline bg-surface hover:border-navy/30"
              }`}
            >
              <span className="block text-sm font-semibold text-ink">
                {t.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-3">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
          Notes, numbers, sources
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          placeholder="Paste the numbers, sources, and anything you want in the email."
          className="mt-2 w-full rounded-xl border border-hairline bg-raise p-3 text-sm leading-relaxed text-ink placeholder:text-ink-3 focus:border-navy focus:bg-surface focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
          Screenshots &amp; PDFs
        </label>
        {files.length > 0 && (
          <ul className="mt-2 mb-2 space-y-1.5">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2 text-sm"
              >
                <span className="truncate text-ink-2">{f.name}</span>
                <button
                  onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                  className="ml-3 shrink-0 text-xs font-medium text-ink-3 hover:text-ink"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className={dropClass}>
          <span className="text-sm font-medium text-navy">
            {uploading > 0 ? `Uploading ${uploading}…` : "Add screenshots or PDFs"}
          </span>
          <span className="mt-0.5 text-xs text-ink-3">Images or PDF</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-amber-700">{error}</p>}

      <button
        disabled={busy}
        onClick={submit}
        className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50"
      >
        {pending ? "Sending…" : uploading > 0 ? "Waiting for uploads…" : "Send to Trey"}
      </button>
    </div>
  );
}
