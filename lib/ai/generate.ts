// Generate structured email copy with Claude, validate it with the zod schemas,
// and retry once with the validation error on failure (spec section 5).
import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, aiModel } from "./anthropic";
import { buildSystemPrompt } from "./prompts";
import { extractJson } from "./json";
import { emailCopySchema, type EmailCopy } from "@/lib/email/schemas";
import type { EmailType } from "@/lib/types";

function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** The facts we hand Claude about one submitted listing. */
export interface ListingFacts {
  address: string | null;
  city: string | null;
  zip: string | null;
  neighborhood: string | null;
  price: number | null;
  beds: string | null;
  baths: string | null;
  sqft: number | null;
  acres: string | null;
  statusText: string | null;
  mlsNumber: string | null;
  description: string | null;
  photoCount: number;
}

function money(n: number | null): string | null {
  return n == null ? null : `$${n.toLocaleString("en-US")}`;
}

/** Turn submitted listing facts into a brief for the listing-email prompt. */
function buildListingBrief(listings: ListingFacts[]): string {
  const blocks = listings.map((l, i) => {
    const stats = [
      l.beds && `${l.beds} beds`,
      l.baths && `${l.baths} baths`,
      l.sqft && `${l.sqft.toLocaleString("en-US")} sqft`,
      l.acres && `${l.acres} acres`,
    ]
      .filter(Boolean)
      .join(", ");
    return [
      `Property ${i + 1}:`,
      l.address && `  Address: ${l.address}`,
      (l.neighborhood || l.city || l.zip) &&
        `  Location: ${[l.neighborhood, l.city, l.zip].filter(Boolean).join(", ")}`,
      l.price != null && `  Price: ${money(l.price)}`,
      stats && `  Stats: ${stats}`,
      l.mlsNumber && `  MLS #: ${l.mlsNumber}`,
      l.statusText && `  Status: ${l.statusText}`,
      l.description && `  Description: ${l.description}`,
      `  Photos available: ${l.photoCount}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const n = listings.length;
  return [
    `Write the monthly listing email featuring exactly these ${n} propert${n === 1 ? "y" : "ies"}, in this order — one listing block each, same order, do not add, drop, or reorder any:`,
    "",
    blocks.join("\n\n"),
    "",
    "Use only the facts given; do not invent details, and if a description was cut off do not fill the gap. Each listing gets one gold callout for its single most distinctive real feature.",
    n > 1
      ? `Give the email a headline and intro that ties the ${n} properties together, since they may suit different buyers.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Generate a listing email from one or more submitted listings. */
export async function generateListingEmail(
  listings: ListingFacts[],
): Promise<EmailCopy> {
  return generateEmailCopy("listing", buildListingBrief(listings));
}

export async function generateEmailCopy(
  type: EmailType,
  brief: string,
  attachments?: { images?: string[]; pdfs?: string[] },
): Promise<EmailCopy> {
  const anthropic = getAnthropic();
  const system = buildSystemPrompt(type);

  // Dusty's uploaded materials (data screenshots, report PDFs) ride along so
  // Claude reads the actual numbers and sources rather than us transcribing them.
  const userText = `Write the ${type} email. Here is the brief from the admin:\n\n${brief}\n\nReturn only the JSON.`;
  const blocks: Anthropic.ContentBlockParam[] = [];
  for (const url of attachments?.images ?? []) {
    blocks.push({ type: "image", source: { type: "url", url } });
  }
  for (const url of attachments?.pdfs ?? []) {
    blocks.push({ type: "document", source: { type: "url", url } });
  }
  blocks.push({ type: "text", text: userText });

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: blocks },
  ];

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await anthropic.messages.create({
      model: aiModel,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system,
      messages,
    });

    const raw = textOf(response);
    let candidate: unknown;
    try {
      candidate = extractJson(raw);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: `That was not valid JSON (${lastError}). Return only a corrected JSON object.`,
      });
      continue;
    }

    // Inject the type so the discriminated union resolves.
    const parsed = emailCopySchema.safeParse({
      ...(candidate as object),
      type,
    });
    if (parsed.success) return parsed.data;

    lastError = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    messages.push({ role: "assistant", content: raw });
    messages.push({
      role: "user",
      content: `The JSON did not match the required shape. Fix these problems and return only corrected JSON:\n${lastError}`,
    });
  }

  throw new Error(`Generation did not produce valid copy: ${lastError}`);
}
