"use server";

import { requireUser } from "@/lib/auth";
import { addMaterial, type MaterialFile } from "@/lib/data/materials";
import { notifyProfile } from "@/lib/push/send";
import { nextMondayForSlot, slotKindForType, monthKey } from "@/lib/schedule";

export type MaterialTarget = "marketPulse" | "education";

export async function submitMaterial(input: {
  targetType: MaterialTarget;
  note: string;
  files: MaterialFile[];
}): Promise<{ ok?: true; error?: string }> {
  const user = await requireUser();
  if (!input.note.trim() && input.files.length === 0) {
    return { error: "Add a note or a file." };
  }
  const target = nextMondayForSlot(
    slotKindForType(input.targetType),
    new Date(),
  );
  await addMaterial({
    month: monthKey(target),
    targetType: input.targetType,
    note: input.note.trim() || null,
    files: input.files,
    user,
  });

  if (user.role !== "admin") {
    const label = input.targetType === "marketPulse" ? "Market Pulse" : "education";
    await notifyProfile("admin", {
      title: "Dusty sent materials",
      body: `New ${label} materials. Build the email when you are ready.`,
      url: "/",
    });
  }
  return { ok: true };
}
