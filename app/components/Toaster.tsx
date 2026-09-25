"use client";

import { useEffect, useState } from "react";

interface Toast {
  id: number;
  message: string;
  tone: "info" | "success";
}

/** Renders transient toasts dispatched via lib/toast's `toast()`. Mounted once. */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let seq = 0;
    function onToast(e: Event) {
      const detail = (e as CustomEvent).detail as {
        message: string;
        tone?: "info" | "success";
      };
      const t: Toast = {
        id: ++seq,
        message: detail.message,
        tone: detail.tone ?? "info",
      };
      setToasts((prev) => [...prev, t]);
      setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
        5000,
      );
    }
    window.addEventListener("mym:toast", onToast);
    return () => window.removeEventListener("mym:toast", onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto max-w-md rounded-xl px-4 py-3 text-sm shadow-[0_8px_30px_-8px_rgba(28,29,51,0.5)] rise ${
            t.tone === "success"
              ? "border border-emerald-300/60 bg-white text-ink"
              : "bg-deep-navy text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
