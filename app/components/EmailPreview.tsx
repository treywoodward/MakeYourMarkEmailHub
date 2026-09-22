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
      {/* Width toggle */}
      <div className="mb-3 flex justify-center gap-1">
        {(["phone", "desktop"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              view === v
                ? "bg-navy text-white"
                : "bg-white text-slate-500 border border-hairline"
            }`}
          >
            {v}
          </button>
        ))}
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
          className="w-full rounded-lg border border-hairline bg-white"
          style={{ height }}
        />
      </div>
    </div>
  );
}
