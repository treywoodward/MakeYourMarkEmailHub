"use client";

export type ToastTone = "info" | "success";

/** Show a transient in-app toast. No-op on the server. */
export function toast(message: string, tone: ToastTone = "info") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("mym:toast", { detail: { message, tone } }),
  );
}
