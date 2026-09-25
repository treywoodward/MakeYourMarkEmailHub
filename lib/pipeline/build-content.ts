// Build a non-listing email (Market Pulse, education) from the materials Dusty
// uploaded: Claude reads the data screenshots + report PDFs + notes and writes
// the copy. On-demand (the admin triggers it), then it goes to review.
import "server-only";
import { unusedMaterialsForType, markMaterialsUsed } from "@/lib/data/materials";
import { createEmailFromCopy } from "@/lib/data/emails";
import { generateEmailCopy } from "@/lib/ai/generate";
import { renderEmail } from "@/lib/email/render";
import {
  nextMondayForSlot,
  slotKindForType,
  slotName,
  toYmd,
  monthKey,
} from "@/lib/schedule";
import { notifyProfile } from "@/lib/push/send";
import { formatCardDate } from "@/lib/dates";

export type ContentType = "marketPulse" | "education";

const LABEL: Record<ContentType, string> = {
  marketPulse: "Market Pulse",
  education: "Education email",
};

export type BuildContentResult =
  | { status: "built"; emailId: string; sendDate: string }
  | { status: "none" }
  | { status: "error"; message: string };

export async function buildContentEmail(
  type: ContentType,
): Promise<BuildContentResult> {
  const materials = await unusedMaterialsForType(type);
  if (materials.length === 0) return { status: "none" };

  const notes = materials
    .map((m) => m.note?.trim())
    .filter(Boolean)
    .join("\n\n");
  const images: string[] = [];
  const pdfs: string[] = [];
  for (const m of materials) {
    for (const f of m.files) {
      if (f.contentType.startsWith("image/")) images.push(f.url);
      else if (f.contentType === "application/pdf") pdfs.push(f.url);
    }
  }

  const brief =
    (notes ? `${notes}\n\n` : "") +
    "Write this email from the attached materials and notes above. Follow the data honesty rules: every market number carries its source, geography, and period, and a single zip is 'southwest Lubbock', never 'Lubbock'. Do not invent numbers.";

  try {
    const copy = await generateEmailCopy(type, brief, { images, pdfs });
    const html = renderEmail(copy);
    const target = nextMondayForSlot(slotKindForType(type), new Date());
    const emailId = await createEmailFromCopy({
      month: monthKey(target),
      slot: slotName(target),
      sendDate: toYmd(target),
      type,
      copy,
      html,
    });
    await markMaterialsUsed(
      materials.map((m) => m.id),
      emailId,
    );
    await notifyProfile("admin", {
      title: `${LABEL[type]} drafted`,
      body: `Drafted for ${formatCardDate(toYmd(target))} from ${materials.length} upload${materials.length === 1 ? "" : "s"}.`,
      url: `/emails/${emailId}`,
    });
    return { status: "built", emailId, sendDate: toYmd(target) };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Generation failed.",
    };
  }
}
