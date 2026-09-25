"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { assembleListingEmail, type AssembleResult } from "@/lib/pipeline/assemble";

/** Admin: build the listings email now from whatever listings are pending. */
export async function assembleNow(): Promise<AssembleResult | { error: string }> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Only the admin can do this." };
  const result = await assembleListingEmail({ force: true });
  revalidatePath("/");
  return result;
}
