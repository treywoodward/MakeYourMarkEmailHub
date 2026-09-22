// Read a flexmls listing screenshot into structured fields with Claude vision.
import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getAnthropic, aiModel } from "./anthropic";
import { extractJson } from "./json";

export const extractedListingSchema = z.object({
  address: z.string().nullable(),
  city: z.string().nullable(),
  zip: z.string().nullable(),
  price: z.number().int().nullable(), // dollars, no symbols/commas
  beds: z.string().nullable(),
  baths: z.string().nullable(),
  sqft: z.number().int().nullable(),
  acres: z.string().nullable(),
  statusText: z.string().nullable(),
  neighborhood: z.string().nullable(),
  mlsNumber: z.string().nullable(),
  description: z.string().nullable(),
  descriptionTruncated: z.boolean(),
});
export type ExtractedListing = z.infer<typeof extractedListingSchema>;

const SYSTEM = `You read a real estate listing screenshot (from flexmls) and extract its fields as JSON. Rules:
- Return ONLY the JSON object, no markdown or commentary. Use null for anything not visible. Never guess or invent a value.
- price and sqft are integers with no symbols or commas (e.g. 550000, 2705).
- beds, baths, and acres are strings exactly as shown (e.g. "4", "3", "0.32").
- If the description is cut off (a "Show More" or "See More" link, or it ends mid-sentence or with "..."), set descriptionTruncated to true and include only the visible text.
- statusText is the listing status exactly as shown (e.g. "Active", "Active with Contingency", "Pending").
Shape: { "address": string|null, "city": string|null, "zip": string|null, "price": number|null, "beds": string|null, "baths": string|null, "sqft": number|null, "acres": string|null, "statusText": string|null, "neighborhood": string|null, "mlsNumber": string|null, "description": string|null, "descriptionTruncated": boolean }`;

export async function extractListingFromScreenshot(
  imageUrl: string,
): Promise<ExtractedListing> {
  const anthropic = getAnthropic();
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: [
        { type: "image", source: { type: "url", url: imageUrl } },
        { type: "text", text: "Extract the listing fields as JSON." },
      ],
    },
  ];

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await anthropic.messages.create({
      model: aiModel,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: SYSTEM,
      messages,
    });
    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    try {
      const parsed = extractedListingSchema.safeParse(extractJson(raw));
      if (parsed.success) return parsed.data;
      lastError = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    messages.push({ role: "assistant", content: raw });
    messages.push({
      role: "user",
      content: `That did not match the required shape (${lastError}). Return only corrected JSON.`,
    });
  }
  throw new Error(`Could not read the screenshot: ${lastError}`);
}
