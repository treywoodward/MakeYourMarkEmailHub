// Simple two-password role gate (replaces Clerk). One password signs you in as
// admin (Trey), another as client (Dusty). A tamper-proof signed cookie stores
// the role. No third party, no DNS, works identically on any domain.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import type { UserRole } from "./types";

const COOKIE = "mym_session";
const secret = process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";

// The gate is on when at least one password is configured. With none set, the
// app runs open as admin (handy in local dev before you set passwords).
export const authEnabled = Boolean(
  process.env.ADMIN_PASSWORD || process.env.CLIENT_PASSWORD,
);

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

function sign(role: string): string {
  return createHmac("sha256", secret).update(role).digest("hex");
}

/** Cookie value: "<role>.<hmac(role)>" so it cannot be forged without AUTH_SECRET. */
export function tokenFor(role: UserRole): string {
  return `${role}.${sign(role)}`;
}

function verify(token: string | undefined): UserRole | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const role = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (role !== "admin" && role !== "client") return null;
  const expected = sign(role);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return role;
}

function userFor(role: UserRole): AppUser {
  return role === "admin"
    ? { id: "admin", email: "", name: "Trey", role: "admin" }
    : { id: "client", email: "", name: "Dusty", role: "client" };
}

/** Validate a submitted password and return the role it grants, or null. */
export function roleForPassword(password: string): UserRole | null {
  const admin = process.env.ADMIN_PASSWORD;
  const client = process.env.CLIENT_PASSWORD;
  if (admin && password === admin) return "admin";
  if (client && password === client) return "client";
  return null;
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  if (!authEnabled) return userFor("admin"); // open in dev when no passwords set
  const store = await cookies();
  const role = verify(store.get(COOKIE)?.value);
  return role ? userFor(role) : null;
}

/** Require a signed-in user; redirect to /sign-in if not. */
export async function requireUser(): Promise<AppUser> {
  const u = await getCurrentAppUser();
  if (!u) redirect("/sign-in");
  return u;
}

export async function isAdmin(): Promise<boolean> {
  return (await getCurrentAppUser())?.role === "admin";
}

export { COOKIE };
