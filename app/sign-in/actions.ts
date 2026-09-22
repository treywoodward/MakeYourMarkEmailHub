"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { roleForPassword, tokenFor, COOKIE } from "@/lib/auth";

// Used with useActionState: (prevError, formData) => error | undefined.
export async function signIn(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const password = String(formData.get("password") ?? "");
  const role = roleForPassword(password);
  if (!role) return "That password is not right.";

  const store = await cookies();
  store.set(COOKIE, tokenFor(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  redirect("/");
}

export async function signOut() {
  const store = await cookies();
  store.delete(COOKIE);
  redirect("/sign-in");
}
