"use client";

import { useCallback, useRef, useState } from "react";

// Renders rendered email HTML inside a sandboxed iframe at phone or desktop
// width. The iframe auto-sizes to its content. sandbox="allow-same-origin"
// (no allow-scripts) lets us read the content height without letting the email
// run any script, so the preview is safe.
export function EmailPreview({ html }: { html: string }) {
  const [view, setView] = useState<"phone" | "desktop">("phone");
  const [height, setHeight] = useState(600);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const measure = useCallback(() => {
    try {
      const doc = frameRef.current?.contentDocument;
      const h = doc?.documentElement?.scrollHeight ?? doc?.body?.scrollHeight;
      if (h) setHeight(h);
    } catch {
      // cross-origin guard; ignore
    }
  }, []);

  const maxWidth = view === "phone" ? 390 : 620;

  return (
    <div>
      {/* Width toggle — a segmented control */}
      <div className="mb-3 flex justify-center">
        <div className="inline-flex gap-1 rounded-full border border-hairline bg-raise p-1">
          {(["phone", "desktop"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium capitalize transition ${
                view === v
                  ? "bg-navy text-white shadow-sm"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth }}>
        <iframe
          // Re-key on view so the iframe reloads and re-measures at the new width.
          key={view}
          ref={frameRef}
          srcDoc={html}
          onLoad={measure}
          sandbox="allow-same-origin"
          title="Email preview"
          className="w-full rounded-xl border border-hairline bg-white shadow-[0_1px_2px_rgba(28,29,51,0.04),0_18px_44px_-24px_rgba(28,29,51,0.4)]"
          style={{ height }}
        />
      </div>
    </div>
  );
}
