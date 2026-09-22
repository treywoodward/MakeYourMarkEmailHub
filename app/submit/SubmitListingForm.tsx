"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { submitListing } from "./actions";

interface Photo {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
}

function readDimensions(
  file: File,
): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

const dropClass =
  "flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-raise px-4 py-6 text-center transition hover:border-navy/40";

export function SubmitListingForm({
  blobEnabled,
  aiEnabled,
}: {
  blobEnabled: boolean;
  aiEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mls, setMls] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotBusy, setScreenshotBusy] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onScreenshot(file: File | undefined) {
    if (!file) return;
    setError(null);
    setScreenshotBusy(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setScreenshot(blob.url);
    } catch {
      setError("Screenshot upload failed. Try again.");
    } finally {
      setScreenshotBusy(false);
    }
  }

  async function onPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const dims = await readDimensions(file);
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          setPhotos((prev) => [
            ...prev,
            { id: blob.url, url: blob.url, width: dims.width, height: dims.height },
          ]);
        } catch {
          setError("A photo failed to upload. Try again.");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  function submit() {
    startTransition(async () => {
      setError(null);
      const res = await submitListing({
        mlsNumber: mls,
        screenshotUrl: screenshot,
        photos: photos.map((p) => ({ url: p.url, width: p.width, height: p.height })),
      });
      if (res.error) setError(res.error);
      else if (res.listingId) router.push(`/listings/${res.listingId}`);
    });
  }

  if (!blobEnabled) {
    return (
      <div className="mx-4 rounded-2xl border border-hairline bg-surface p-5 text-sm text-ink-2">
        Connect <span className="font-medium text-ink">Vercel Blob</span> to
        enable uploads (Vercel project → Storage → create a Blob store), then add
        its token as <code className="text-gold-ink">BLOB_READ_WRITE_TOKEN</code>.
      </div>
    );
  }

  const busy = pending || uploading > 0 || screenshotBusy;

  return (
    <div className="space-y-5 px-4">
      {/* MLS */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
          MLS number
        </label>
        <input
          value={mls}
          onChange={(e) => setMls(e.target.value)}
          placeholder="e.g. 202611456"
          className="mt-2 w-full rounded-xl border border-hairline bg-raise px-3.5 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-navy focus:bg-surface focus:outline-none"
        />
      </div>

      {/* Screenshot */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
          Flexmls screenshot
        </label>
        <p className="mt-1 mb-2 text-sm text-ink-2">
          {aiEnabled
            ? "Claude reads the address, price, stats, and description from it."
            : "Add ANTHROPIC_API_KEY to have Claude read this automatically."}
        </p>
        {screenshot ? (
          <div className="relative overflow-hidden rounded-2xl border border-hairline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshot} alt="Screenshot" className="w-full" />
            <button
              onClick={() => setScreenshot(null)}
              className="absolute top-2 right-2 rounded-full bg-deep-navy/80 px-2.5 py-1 text-xs font-medium text-white"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className={dropClass}>
            <span className="text-sm font-medium text-navy">
              {screenshotBusy ? "Uploading…" : "Choose a screenshot"}
            </span>
            <span className="mt-0.5 text-xs text-ink-3">PNG or JPG</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onScreenshot(e.target.files?.[0])}
            />
          </label>
        )}
      </div>

      {/* Photos */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">
          Photos
        </label>
        <p className="mt-1 mb-2 text-sm text-ink-2">
          Landscape shots for the gallery. Portrait photos are flagged and left
          out of grids.
        </p>
        {photos.length > 0 && (
          <div className="mb-2 grid grid-cols-3 gap-2">
            {photos.map((p) => {
              const portrait = Boolean(p.width && p.height && p.height > p.width);
              return (
                <div
                  key={p.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-hairline"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {portrait && (
                    <span className="absolute bottom-1 left-1 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      portrait
                    </span>
                  )}
                  <button
                    onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}
                    className="absolute top-1 right-1 rounded-full bg-deep-navy/80 px-1.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <label className={dropClass}>
          <span className="text-sm font-medium text-navy">
            {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
          </span>
          <span className="mt-0.5 text-xs text-ink-3">Select one or more</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => onPhotos(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-amber-700">{error}</p>}

      <button
        disabled={busy}
        onClick={submit}
        className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-50"
      >
        {pending
          ? "Reading and saving…"
          : uploading > 0
            ? "Waiting for uploads…"
            : "Submit listing"}
      </button>
    </div>
  );
}
