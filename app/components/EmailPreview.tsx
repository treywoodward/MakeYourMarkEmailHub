"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Renders rendered email HTML inside a sandboxed iframe at phone or desktop
// width. The iframe auto-sizes to its content. sandbox="allow-same-origin"
// (no allow-scripts) lets us read the content height without letting the email
// run any script, so the preview is safe.
//
// Sizing is driven from an effect, not the iframe's `load` event: with `srcDoc`
// the load event often fires before React attaches the handler, so a single
// onLoad measurement is unreliable and leaves the preview cropped or with a big
// dark gap below the email. Instead we attach a ResizeObserver to the email's
// <body> plus per-image load listeners, so the iframe always matches the real
// content height as images (logo, headshot, photos) finish loading.
export function EmailPreview({ html }: { html: string }) {
  const [view, setView] = useState<"phone" | "desktop">("phone");
  const [height, setHeight] = useState(400);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const measure = useCallback(() => {
    try {
      const body = frameRef.current?.contentDocument?.body;
      if (!body) return;
      // Measure the email's own content, not documentElement: many email HTMLs
      // set <html> to height:100%, so documentElement.scrollHeight inflates to
      // whatever height we set the iframe to and ratchets up, never shrinking
      // back (leaving a tall dark gap). The body wraps the actual content and
      // does not fill the iframe, so it reports the true height and can shrink.
      const root = body.firstElementChild as HTMLElement | null;
      const h = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        root?.offsetHeight ?? 0,
      );
      if (h) setHeight(h);
    } catch {
      // cross-origin guard; ignore
    }
  }, []);

  useEffect(() => {
    // Start compact so a stale (taller) height never leaves a gap while the new
    // view measures.
    setHeight(400);

    let ro: ResizeObserver | null = null;
    let raf = 0;
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    function attach() {
      if (cancelled) return;
      const doc = frameRef.current?.contentDocument;
      if (!doc?.body) {
        raf = requestAnimationFrame(attach); // wait for srcDoc to parse
        return;
      }
      measure();

      doc.querySelectorAll("img").forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", measure);
          img.addEventListener("error", measure);
          imgs.push(img);
        }
      });

      try {
        ro = new ResizeObserver(() => measure());
        ro.observe(doc.body);
      } catch {
        // ResizeObserver unavailable; image listeners + timers still cover it.
      }

      timers.push(setTimeout(measure, 300), setTimeout(measure, 1000));
    }
    attach();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      timers.forEach(clearTimeout);
      imgs.forEach((img) => {
        img.removeEventListener("load", measure);
        img.removeEventListener("error", measure);
      });
    };
  }, [html, view, measure]);

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
          sandbox="allow-same-origin"
          title="Email preview"
          scrolling="no"
          className="w-full rounded-xl border border-hairline bg-white shadow-[0_1px_2px_rgba(28,29,51,0.04),0_18px_44px_-24px_rgba(28,29,51,0.4)]"
          style={{ height }}
        />
      </div>
    </div>
  );
}
