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

export async function generateEmailCopy(
  type: EmailType,
  brief: string,
): Promise<EmailCopy> {
  const anthropic = getAnthropic();
  const system = buildSystemPrompt(type);
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Write the ${type} email. Here is the brief from the admin:\n\n${brief}\n\nReturn only the JSON.`,
    },
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
