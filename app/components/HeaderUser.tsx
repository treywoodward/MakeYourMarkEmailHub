import { signOut } from "@/app/sign-in/actions";

// Who is signed in, plus a sign-out button. Rendered only when the gate is on.
export function HeaderUser({ name }: { name: string }) {
  return (
    <form action={signOut} className="flex items-center gap-3">
      <span className="text-xs font-medium text-white/70">{name}</span>
      <button
        type="submit"
        className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/80 transition hover:border-gold/60 hover:text-white"
      >
        Sign out
      </button>
    </form>
  );
}
