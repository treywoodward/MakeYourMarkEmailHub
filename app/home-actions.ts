"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { assembleListingEmail, type AssembleResult } from "@/lib/pipeline/assemble";
import {
  buildContentEmail,
  type ContentType,
  type BuildContentResult,
} from "@/lib/pipeline/build-content";

/** Admin: build the listings email now from whatever listings are pending. */
export async function assembleNow(): Promise<AssembleResult | { error: string }> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Only the admin can do this." };
  const result = await assembleListingEmail({ force: true });
  revalidatePath("/");
  return result;
}

/** Admin: build a Market Pulse or education email from Dusty's uploaded materials. */
export async function buildContentNow(
  type: ContentType,
): Promise<BuildContentResult | { error: string }> {
  const user = await requireUser();
  if (user.role !== "admin") return { error: "Only the admin can do this." };
  const result = await buildContentEmail(type);
  revalidatePath("/");
  return result;
}
