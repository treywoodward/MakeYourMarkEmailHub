"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function SignInPage() {
  const [error, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="grid min-h-dvh place-items-center bg-deep-navy px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Brand lockup */}
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
            Make Your Mark Legacy Team
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white">Email Hub</h1>
          <div className="mx-auto mt-4 h-px w-9 bg-gold" />
        </div>

        {/* Card */}
        <form
          action={formAction}
          className="mt-8 rounded-2xl bg-surface p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
        >
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink-3"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            autoFocus
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-hairline bg-raise px-3.5 py-3 text-sm text-ink placeholder:text-ink-3 focus:border-navy focus:bg-surface focus:outline-none"
          />

          {error && <p className="mt-2.5 text-sm text-amber-700">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-700 active:scale-[0.99] disabled:opacity-60"
          >
            {pending ? "Checking…" : "Continue"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-white/35">
          A private tool for the Make Your Mark email program.
        </p>
      </div>
    </div>
  );
}
