"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function SignInPage() {
  const [error, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-panel px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-xl border border-hairline bg-white p-6 shadow-sm"
      >
        <p className="text-center font-serif text-[11px] italic tracking-wide text-gold">
          Make Your Mark Legacy Team
        </p>
        <h1 className="mt-1 text-center font-serif text-2xl text-navy">Email Hub</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Enter your password to continue.
        </p>

        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          className="mt-5 w-full rounded-lg border border-hairline px-3 py-2.5 text-sm focus:border-navy focus:outline-none"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 w-full rounded-lg bg-navy py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
