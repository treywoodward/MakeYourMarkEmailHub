// Current-user + role resolution. Bridges Clerk (identity) and our profiles
// table (role). Before Clerk is configured, returns a dev admin so the full UI
// is visible during setup.
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import type { UserRole } from "@/lib/types";

export const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Comma-separated emails that should be admins (Trey). Others default to client.
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

/** The signed-in user with their role. Upserts a profile row on first sign-in. */
export async function getCurrentAppUser(): Promise<AppUser | null> {
  if (!authEnabled) {
    // Dev fallback: act as admin so the whole UI is reachable before setup.
    return { id: "dev", email: "dev@local", name: "Dev (admin)", role: "admin" };
  }

  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name = user?.fullName ?? null;
  let role: UserRole = adminEmails.includes(email.toLowerCase()) ? "admin" : "client";

  if (isDbConfigured && db) {
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);
    if (existing[0]) {
      role = existing[0].role;
    } else {
      await db.insert(profiles).values({ id: userId, email, name, role }).onConflictDoNothing();
    }
  }

  return { id: userId, email, name, role };
}

export async function isAdmin(): Promise<boolean> {
  const u = await getCurrentAppUser();
  return u?.role === "admin";
}

/** Require a signed-in user; redirect to sign-in if not. Use at the top of a
 *  protected page (resource-based protection, Clerk's recommended approach). */
export async function requireUser(): Promise<AppUser> {
  const u = await getCurrentAppUser();
  if (!u) redirect("/sign-in");
  return u;
}
