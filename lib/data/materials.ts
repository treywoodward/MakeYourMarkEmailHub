// Materials Dusty uploads to build the non-listing emails (Market Pulse,
// education): data screenshots, report PDFs, and typed notes.
import "server-only";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db, isDbConfigured, requireDb } from "@/lib/db";
import { emailMaterials, profiles } from "@/lib/db/schema";
import type { AppUser } from "@/lib/auth";
import type { EmailType } from "@/lib/types";

export interface MaterialFile {
  url: string;
  name: string;
  contentType: string;
}

export interface Material {
  id: string;
  month: string;
  targetType: EmailType;
  note: string | null;
  files: MaterialFile[];
  uploadedBy: string | null;
  createdAt: string;
}

function mapRow(r: typeof emailMaterials.$inferSelect): Material {
  return {
    id: r.id,
    month: r.month,
    targetType: r.targetType,
    note: r.note,
    files: r.files,
    uploadedBy: r.uploadedBy,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function addMaterial(input: {
  month: string;
  targetType: EmailType;
  note: string | null;
  files: MaterialFile[];
  user: AppUser;
}): Promise<string> {
  const database = requireDb();
  await database
    .insert(profiles)
    .values({
      id: input.user.id,
      email: input.user.email,
      name: input.user.name,
      role: input.user.role,
    })
    .onConflictDoNothing();
  const [row] = await database
    .insert(emailMaterials)
    .values({
      month: input.month,
      targetType: input.targetType,
      note: input.note,
      files: input.files,
      uploadedBy: input.user.id,
    })
    .returning({ id: emailMaterials.id });
  return row.id;
}

/** All not-yet-used materials, newest first (admin dashboard). */
export async function pendingMaterials(): Promise<Material[]> {
  if (!isDbConfigured || !db) return [];
  try {
    const rows = await db
      .select()
      .from(emailMaterials)
      .where(isNull(emailMaterials.usedByEmailId))
      .orderBy(desc(emailMaterials.createdAt));
    return rows.map(mapRow);
  } catch (err) {
    console.error("[data] pendingMaterials failed", err);
    return [];
  }
}

/** Unused materials of a given target type, oldest first (for building). */
export async function unusedMaterialsForType(
  targetType: EmailType,
): Promise<Material[]> {
  if (!isDbConfigured || !db) return [];
  try {
    const rows = await db
      .select()
      .from(emailMaterials)
      .where(
        and(
          eq(emailMaterials.targetType, targetType),
          isNull(emailMaterials.usedByEmailId),
        ),
      )
      .orderBy(emailMaterials.createdAt);
    return rows.map(mapRow);
  } catch (err) {
    console.error("[data] unusedMaterialsForType failed", err);
    return [];
  }
}

export async function markMaterialsUsed(ids: string[], emailId: string) {
  if (!ids.length) return;
  const database = requireDb();
  await database
    .update(emailMaterials)
    .set({ usedByEmailId: emailId })
    .where(inArray(emailMaterials.id, ids));
}
