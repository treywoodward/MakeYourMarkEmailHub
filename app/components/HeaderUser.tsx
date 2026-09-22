import { signOut } from "@/app/sign-in/actions";

// Shows who is signed in and a sign-out button. Rendered only when the gate is on.
export function HeaderUser({ name }: { name: string }) {
  return (
    <form action={signOut} className="flex items-center gap-2 text-xs text-white/70">
      <span>{name}</span>
      <button type="submit" className="underline hover:text-white">
        Sign out
      </button>
    </form>
  );
}
