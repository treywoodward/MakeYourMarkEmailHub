"use client";

import { UserButton } from "@clerk/nextjs";

// Account / sign-out control. Only rendered when Clerk is configured.
export function HeaderUser() {
  return <UserButton />;
}
